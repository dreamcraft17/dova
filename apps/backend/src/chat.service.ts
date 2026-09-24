import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { BundleDetail, ChatMessage } from 'dova-shared';
import { AppService } from './app.service';
import { BundleService } from './bundle.service';
import { ChatRecord, DatabaseService, StoredUser } from './database.service';
import { DOVA_SITE_CONTEXT } from './site-context';

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_CONTEXT_MESSAGES = 20;
const PROGRAMMING_REFUSAL = 'I can only help with DOVA products, bundles, orders, delivery, and general farming questions. I cannot help with coding or programming questions.';
const PROGRAMMING_PATTERNS = /\b(coding|codingan|programming|pemrograman|source code|javascript|typescript|python|java|c\+\+|html|css|sql|api endpoint|function|syntax|debugging|algorithm)\b/i;

type GeminiPart = { text?: string };
type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };
type GeminiResponse = { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> };
type GeminiRequest = { systemInstruction: { parts: GeminiPart[] }; contents: GeminiContent[] };

/** Talks to Gemini on behalf of a DOVA user via the Gemini generateContent API. */
@Injectable()
export class ChatService {
  private readonly histories = new Map<string, ChatRecord[]>();

  constructor(
    private readonly database: DatabaseService,
    private readonly catalog: AppService,
    private readonly bundles: BundleService,
  ) {}

  private apiKey(): string {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) throw new ServiceUnavailableException('The AI assistant is not configured yet.');
    return key;
  }

  private apiUrl() {
    const base = process.env.GEMINI_API_URL?.trim() || 'https://generativelanguage.googleapis.com/v1beta';
    const model = process.env.GEMINI_MODEL?.trim() || 'gemini-flash-latest';
    return `${base}/models/${model}:generateContent`;
  }

  private async generate(contents: GeminiContent[], catalogContext: string): Promise<string> {
    const apiKey = this.apiKey();
    let response: Response;
    try {
      response = await fetch(this.apiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `You are DOVA AI, a warm and conversational assistant for the DOVA agricultural marketplace. Match the user's language (English or Indonesian) and answer naturally, not like a canned FAQ. You may explain, compare products, make reasonable recommendations from the live catalog, ask a clarifying question, and guide the user through the website. Keep answers concise but useful. Use the DOVA website guide to explain the site's content and UI. Use the live catalog context below when answering product and bundle questions. Never invent product names, prices, stock, bundle contents, delivery promises, or policies. If the site guide or catalog does not contain an answer, be honest about the limit and suggest the relevant DOVA page or Contact DOVA. Do not answer coding/programming questions. Do not expose private account data or perform account/order/payment actions in chat. Keep farming advice general and cautious.\n\n${DOVA_SITE_CONTEXT}\nLIVE DOVA CATALOG:\n${catalogContext}` }] },
          contents,
        } satisfies GeminiRequest),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      console.warn('[Chat] Gemini request failed:', (error as Error).message);
      throw new BadRequestException('The AI assistant is unavailable right now. Please try again.');
    }

    const payload = await response.json().catch(() => undefined) as GeminiResponse | undefined;
    if (!response.ok) {
      console.warn('[Chat] Gemini returned an error:', response.status);
      throw new BadRequestException('The AI assistant is unavailable right now. Please try again.');
    }
    const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!text) throw new BadRequestException('The AI assistant returned an empty response. Please try again.');
    return text;
  }

  private async getHistory(userId: string): Promise<ChatRecord[]> {
    if (this.database.enabled) return this.database.chatListMessages(userId);
    return this.histories.get(userId) || [];
  }

  private async saveMessage(message: ChatRecord) {
    if (this.database.enabled) return this.database.chatSaveMessage(message);
    const history = this.histories.get(message.userId) || [];
    history.push(message);
    this.histories.set(message.userId, history);
  }

  private isProgrammingRequest(text: string) {
    return PROGRAMMING_PATTERNS.test(text);
  }

  private async catalogContext(): Promise<string> {
    try {
      const [products, bundleList] = await Promise.all([
        this.catalog.listProducts('', '', 1, 40),
        this.bundles.listCustomerBundles('', '', 1, 20),
      ]);
      const bundleDetails = await Promise.all(
        bundleList.data.map((bundle) => this.bundles.getCustomerBundle(bundle.id)),
      );
      const productLines = products.data.map((product) =>
        `- Product: ${product.name} | category: ${product.categoryName} | price: ₦${product.price} | stock units: ${product.stockQuantity} | description: ${product.description}`,
      );
      const bundleLines = bundleDetails.map((bundle: BundleDetail) => {
        const contents = bundle.contents.map((item) => `${item.quantity}x ${item.product.name}`).join(', ');
        return `- Bundle: ${bundle.name} | price: ₦${bundle.bundlePrice} | available quantity: ${bundle.computed.availableQuantity} | contents: ${contents} | description: ${bundle.description}`;
      });
      return [...productLines, ...bundleLines].join('\n') || 'No active products or bundles are currently available.';
    } catch (error) {
      console.warn('[Chat] Catalog context unavailable:', (error as Error).message);
      return 'Catalog data is temporarily unavailable. Do not guess product or bundle details.';
    }
  }

  async history(user: StoredUser): Promise<{ conversationId: null; messages: ChatMessage[] }> {
    const messages = await this.getHistory(user.id);
    return { conversationId: null, messages: messages.map(({ id, role, text, createdAt }) => ({ id, role, text, createdAt })) };
  }

  async sendMessage(user: StoredUser, text: string): Promise<{ conversationId: null; messages: ChatMessage[] }> {
    const history = await this.getHistory(user.id);
    const userMessage: ChatRecord = { id: `user-${Date.now()}`, userId: user.id, role: 'user', text, createdAt: new Date().toISOString() };
    await this.saveMessage(userMessage);
    if (this.isProgrammingRequest(text)) {
      const refusal: ChatRecord = { id: `assistant-${Date.now()}`, userId: user.id, role: 'assistant', text: PROGRAMMING_REFUSAL, createdAt: new Date().toISOString() };
      await this.saveMessage(refusal);
      return { conversationId: null, messages: [{ id: refusal.id, role: refusal.role, text: refusal.text, createdAt: refusal.createdAt }] };
    }
    const contents: GeminiContent[] = [
      ...history.slice(-MAX_CONTEXT_MESSAGES).map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.text }] } as GeminiContent)),
      { role: 'user', parts: [{ text }] },
    ];
    const replyText = await this.generate(contents, await this.catalogContext());
    const reply: ChatRecord = { id: `assistant-${Date.now()}`, userId: user.id, role: 'assistant', text: replyText, createdAt: new Date().toISOString() };
    await this.saveMessage(reply);
    return { conversationId: null, messages: [{ id: reply.id, role: reply.role, text: reply.text, createdAt: reply.createdAt }] };
  }

  async sendGuestMessage(text: string): Promise<{ conversationId: null; messages: ChatMessage[] }> {
    if (this.isProgrammingRequest(text)) {
      return {
        conversationId: null,
        messages: [{ id: `guest-refusal-${Date.now()}`, role: 'assistant', text: PROGRAMMING_REFUSAL, createdAt: new Date().toISOString() }],
      };
    }
    const replyText = await this.generate(
      [{ role: 'user', parts: [{ text }] }],
      await this.catalogContext(),
    );
    return {
      conversationId: null,
      messages: [{ id: `guest-assistant-${Date.now()}`, role: 'assistant', text: replyText, createdAt: new Date().toISOString() }],
    };
  }
}
