import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ChatMessage } from 'dova-shared';
import { ChatIdentity, DatabaseService, StoredUser } from './database.service';

const REQUEST_TIMEOUT_MS = 10_000;
const POLL_INTERVAL_MS = 700;

type BotpressUser = { id: string; name?: string };
type BotpressMessagePayload = { type: string; text?: string; markdown?: string; [key: string]: unknown };
type BotpressMessage = { id: string; userId: string; conversationId: string; payload: BotpressMessagePayload; createdAt: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function describePayload(payload: BotpressMessagePayload): string {
  return `[Unsupported ${payload.type} message]`;
}

/** Talks to a Botpress bot on behalf of a DOVA user via the headless Botpress Chat API. */
@Injectable()
export class ChatService {
  /** In-memory fallback identity store, mirrors FeedbackService's dual-path pattern when there is no database. */
  private readonly identities = new Map<string, ChatIdentity>();

  constructor(private readonly database: DatabaseService) {}

  private useDatabase() {
    return this.database.enabled;
  }

  private replyTimeoutMs() {
    return Number(process.env.BOTPRESS_REPLY_TIMEOUT_MS) || 20_000;
  }

  private webhookId(): string {
    const id = process.env.BOTPRESS_WEBHOOK_ID?.trim();
    if (!id) throw new ServiceUnavailableException('The AI assistant is not configured yet.');
    return id;
  }

  private baseUrl() {
    const base = process.env.BOTPRESS_CHAT_API_URL?.trim() || 'https://chat.botpress.cloud';
    return `${base}/${this.webhookId()}`;
  }

  private async botpressFetch<T>(path: string, options: { method: string; userKey?: string; body?: unknown }): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl()}${path}`, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.userKey ? { 'x-user-key': options.userKey } : {}),
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      console.warn('[Chat] Botpress request failed:', (error as Error).message);
      throw new BadRequestException('The AI assistant is unavailable right now. Please try again.');
    }
    const payload = await response.json().catch(() => undefined);
    const errorCode = payload && typeof payload === 'object' && 'code' in payload ? Number((payload as any).code) : undefined;
    if (!response.ok || (errorCode !== undefined && errorCode >= 400 && errorCode < 600)) {
      console.warn('[Chat] Botpress returned an error:', response.status, payload);
      throw new BadRequestException('The AI assistant is unavailable right now. Please try again.');
    }
    return payload as T;
  }

  private async getIdentity(userId: string): Promise<ChatIdentity | undefined> {
    if (this.useDatabase()) return this.database.chatGetIdentity(userId);
    return this.identities.get(userId);
  }

  private async ensureIdentity(user: StoredUser): Promise<ChatIdentity> {
    const existing = await this.getIdentity(user.id);
    if (existing) return existing;

    const created = await this.botpressFetch<{ user: BotpressUser; key: string }>('/users', {
      method: 'POST',
      body: { name: user.fullName },
    });
    const identity: ChatIdentity = { userId: user.id, botpressUserId: created.user.id, botpressUserKey: created.key };
    if (this.useDatabase()) {
      await this.database.chatCreateIdentity(identity);
    } else {
      this.identities.set(user.id, identity);
    }
    return identity;
  }

  private async ensureConversation(identity: ChatIdentity): Promise<string> {
    if (identity.botpressConversationId) return identity.botpressConversationId;

    const created = await this.botpressFetch<{ conversation: { id: string } }>('/conversations', {
      method: 'POST',
      userKey: identity.botpressUserKey,
      body: {},
    });
    identity.botpressConversationId = created.conversation.id;
    if (this.useDatabase()) {
      await this.database.chatSetConversation(identity.userId, created.conversation.id);
    } else {
      this.identities.set(identity.userId, identity);
    }
    return created.conversation.id;
  }

  private async listMessages(conversationId: string, userKey: string): Promise<BotpressMessage[]> {
    const result = await this.botpressFetch<{ messages: BotpressMessage[] }>(
      `/conversations/${conversationId}/messages`,
      { method: 'GET', userKey },
    );
    return result.messages;
  }

  private toChatMessage(message: BotpressMessage, mine: boolean): ChatMessage {
    const { payload } = message;
    const text = payload.text ?? payload.markdown ?? describePayload(payload);
    return {
      id: message.id,
      role: mine ? 'user' : 'assistant',
      text,
      createdAt: new Date(message.createdAt).toISOString(),
    };
  }

  async history(user: StoredUser): Promise<{ conversationId: string | null; messages: ChatMessage[] }> {
    const identity = await this.getIdentity(user.id);
    if (!identity?.botpressConversationId) return { conversationId: null, messages: [] };

    const messages = await this.listMessages(identity.botpressConversationId, identity.botpressUserKey);
    const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return {
      conversationId: identity.botpressConversationId,
      messages: sorted.map((message) => this.toChatMessage(message, message.userId === identity.botpressUserId)),
    };
  }

  async sendMessage(user: StoredUser, text: string): Promise<{ conversationId: string; messages: ChatMessage[] }> {
    const identity = await this.ensureIdentity(user);
    const conversationId = await this.ensureConversation(identity);

    const sent = await this.botpressFetch<{ message: BotpressMessage }>('/messages', {
      method: 'POST',
      userKey: identity.botpressUserKey,
      body: { conversationId, payload: { type: 'text', text } },
    });

    const sentAt = new Date(sent.message.createdAt).getTime();
    const deadline = Date.now() + this.replyTimeoutMs();
    while (Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS);
      const messages = await this.listMessages(conversationId, identity.botpressUserKey);
      const replies = messages
        .filter((message) => message.userId !== identity.botpressUserId && new Date(message.createdAt).getTime() > sentAt)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      if (replies.length) {
        return { conversationId, messages: replies.map((message) => this.toChatMessage(message, false)) };
      }
    }
    return { conversationId, messages: [] };
  }
}
