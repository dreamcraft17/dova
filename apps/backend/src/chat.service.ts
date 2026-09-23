import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ChatMessage } from 'dova-shared';
import { ChatRecord, DatabaseService, StoredUser } from './database.service';

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_CONTEXT_MESSAGES = 20;

type GeminiPart = { text?: string };
type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };
type GeminiResponse = { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> };

/** Talks to Gemini on behalf of a DOVA user via the Gemini generateContent API. */
@Injectable()
export class ChatService {
  private readonly histories = new Map<string, ChatRecord[]>();

  constructor(private readonly database: DatabaseService) {}

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

  private async generate(contents: GeminiContent[]): Promise<string> {
    const apiKey = this.apiKey();
    let response: Response;
    try {
      response = await fetch(this.apiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
        body: JSON.stringify({ contents }),
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

  async history(user: StoredUser): Promise<{ conversationId: null; messages: ChatMessage[] }> {
    const messages = await this.getHistory(user.id);
    return { conversationId: null, messages: messages.map(({ id, role, text, createdAt }) => ({ id, role, text, createdAt })) };
  }

  async sendMessage(user: StoredUser, text: string): Promise<{ conversationId: null; messages: ChatMessage[] }> {
    const history = await this.getHistory(user.id);
    const userMessage: ChatRecord = { id: `user-${Date.now()}`, userId: user.id, role: 'user', text, createdAt: new Date().toISOString() };
    await this.saveMessage(userMessage);
    const contents: GeminiContent[] = [
      ...history.slice(-MAX_CONTEXT_MESSAGES).map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.text }] } as GeminiContent)),
      { role: 'user', parts: [{ text }] },
    ];
    const replyText = await this.generate(contents);
    const reply: ChatRecord = { id: `assistant-${Date.now()}`, userId: user.id, role: 'assistant', text: replyText, createdAt: new Date().toISOString() };
    await this.saveMessage(reply);
    return { conversationId: null, messages: [{ id: reply.id, role: reply.role, text: reply.text, createdAt: reply.createdAt }] };
  }
}
