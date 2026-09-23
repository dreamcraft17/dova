import { ServiceUnavailableException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';

function makeDatabase() { return { enabled: false } as DatabaseService; }

const customer = {
  id: 'u1', email: 'buyer@dova.local', fullName: 'Buyer', role: 'customer' as const,
  isActive: true, createdAt: '', passwordHash: '',
};

function jsonResponse(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status }); }

describe('ChatService', () => {
  afterEach(() => { delete process.env.GEMINI_API_KEY; jest.restoreAllMocks(); });

  it('reports the assistant as unconfigured when GEMINI_API_KEY is missing', async () => {
    await expect(new ChatService(makeDatabase()).sendMessage(customer, 'hello')).rejects.toThrow(ServiceUnavailableException);
  });

  it('sends the conversation to Gemini and returns the model response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse({ candidates: [{ content: { parts: [{ text: 'Hello from Gemini.' }] } }] }),
    );
    const result = await new ChatService(makeDatabase()).sendMessage(customer, 'hi');
    expect(result.conversationId).toBeNull();
    expect(result.messages[0].text).toBe('Hello from Gemini.');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/models/gemini-flash-latest:generateContent'),
      expect.objectContaining({ headers: expect.objectContaining({ 'X-goog-api-key': 'test-key' }) }),
    );
  });

  it('surfaces a friendly error when Gemini is unreachable', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));
    await expect(new ChatService(makeDatabase()).sendMessage(customer, 'hi')).rejects.toThrow(
      'The AI assistant is unavailable right now. Please try again.',
    );
  });
});
