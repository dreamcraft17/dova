import { ServiceUnavailableException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';

function makeDatabase() {
  return { enabled: false } as DatabaseService;
}

function makeService() {
  return new ChatService(makeDatabase());
}

const customer = {
  id: 'u1',
  email: 'buyer@dova.local',
  fullName: 'Buyer',
  role: 'customer' as const,
  isActive: true,
  createdAt: '',
  passwordHash: '',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('ChatService', () => {
  afterEach(() => {
    delete process.env.BOTPRESS_WEBHOOK_ID;
    jest.restoreAllMocks();
  });

  it('reports the assistant as unconfigured when BOTPRESS_WEBHOOK_ID is missing', async () => {
    const service = makeService();
    await expect(service.sendMessage(customer, 'hello')).rejects.toThrow(ServiceUnavailableException);
  });

  it('returns empty history when the user has never chatted', async () => {
    process.env.BOTPRESS_WEBHOOK_ID = 'wh_1';
    const service = makeService();
    const result = await service.history(customer);
    expect(result).toEqual({ conversationId: null, messages: [] });
  });

  it('creates a user and conversation, sends a message, and polls until the bot replies', async () => {
    process.env.BOTPRESS_WEBHOOK_ID = 'wh_1';
    const service = makeService();
    const sentAt = new Date().toISOString();
    const replyAt = new Date(Date.now() + 1000).toISOString();

    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ user: { id: 'bp-user-1' }, key: 'user-key-1' }, 201))
      .mockResolvedValueOnce(jsonResponse({ conversation: { id: 'conv-1' } }, 201))
      .mockResolvedValueOnce(
        jsonResponse({ message: { id: 'm1', userId: 'bp-user-1', conversationId: 'conv-1', payload: { type: 'text', text: 'hi' }, createdAt: sentAt } }, 201),
      )
      .mockResolvedValueOnce(jsonResponse({ messages: [] }))
      .mockResolvedValueOnce(
        jsonResponse({
          messages: [
            { id: 'm2', userId: 'bot-user', conversationId: 'conv-1', payload: { type: 'text', text: 'Hello! How can I help?' }, createdAt: replyAt },
          ],
        }),
      );

    const result = await service.sendMessage(customer, 'hi');

    expect(result.conversationId).toBe('conv-1');
    expect(result.messages).toEqual([
      { id: 'm2', role: 'assistant', text: 'Hello! How can I help?', createdAt: new Date(replyAt).toISOString() },
    ]);
    expect(fetchMock.mock.calls[0][0]).toContain('/wh_1/users');
    expect(fetchMock.mock.calls[2][0]).toContain('/wh_1/messages');
  }, 10_000);

  it('surfaces a friendly error when Botpress is unreachable', async () => {
    process.env.BOTPRESS_WEBHOOK_ID = 'wh_1';
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));
    const service = makeService();

    await expect(service.sendMessage(customer, 'hi')).rejects.toThrow(
      'The AI assistant is unavailable right now. Please try again.',
    );
  });
});
