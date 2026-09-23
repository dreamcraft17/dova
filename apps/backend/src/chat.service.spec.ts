import { ServiceUnavailableException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';

function makeDatabase() { return { enabled: false } as DatabaseService; }
function makeCatalog() {
  return { listProducts: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 40, total: 0 } }) } as any;
}
function makeBundles() {
  return { listCustomerBundles: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0 } }), getCustomerBundle: jest.fn() } as any;
}

const customer = {
  id: 'u1', email: 'buyer@dova.local', fullName: 'Buyer', role: 'customer' as const,
  isActive: true, createdAt: '', passwordHash: '',
};

function jsonResponse(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status }); }

describe('ChatService', () => {
  afterEach(() => { delete process.env.GEMINI_API_KEY; jest.restoreAllMocks(); });

  it('reports the assistant as unconfigured when GEMINI_API_KEY is missing', async () => {
    await expect(new ChatService(makeDatabase(), makeCatalog(), makeBundles()).sendMessage(customer, 'hello')).rejects.toThrow(ServiceUnavailableException);
  });

  it('sends the conversation to Gemini and returns the model response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse({ candidates: [{ content: { parts: [{ text: 'Hello from Gemini.' }] } }] }),
    );
    const catalog = makeCatalog();
    catalog.listProducts.mockResolvedValue({ data: [{ name: 'Plantain Flour', categoryName: 'Flour', price: 2500, stockQuantity: 12, description: 'Fine flour' }], pagination: { page: 1, limit: 40, total: 1 } });
    const bundles = makeBundles();
    bundles.listCustomerBundles.mockResolvedValue({ data: [{ id: 'bundle-1' }], pagination: { page: 1, limit: 20, total: 1 } });
    bundles.getCustomerBundle.mockResolvedValue({
      id: 'bundle-1', name: 'Family Flour Bundle', description: 'A family pack', bundlePrice: 5000,
      status: 'active', isFeatured: true, createdBy: 'admin', createdAt: '', updatedAt: '',
      computed: { availableQuantity: 4, individualTotal: 6000, savingsAmount: 1000, savingsPercentage: 16.6, isOutOfStock: false },
      contents: [{ id: 'content-1', bundleId: 'bundle-1', productId: 'p1', quantity: 2, position: 0, product: { name: 'Plantain Flour' } }],
    });
    const result = await new ChatService(makeDatabase(), catalog, bundles).sendMessage(customer, 'hi');
    expect(result.conversationId).toBeNull();
    expect(result.messages[0].text).toBe('Hello from Gemini.');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/models/gemini-flash-latest:generateContent'),
      expect.objectContaining({ headers: expect.objectContaining({ 'X-goog-api-key': 'test-key' }) }),
    );
    const request = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(request.systemInstruction.parts[0].text).toContain('Plantain Flour');
    expect(request.systemInstruction.parts[0].text).toContain('Family Flour Bundle');
    expect(request.systemInstruction.parts[0].text).toContain('2x Plantain Flour');
    expect(request.systemInstruction.parts[0].text).toContain('Products (/marketplace)');
    expect(request.systemInstruction.parts[0].text).toContain('Orders (/customer/history)');
  });

  it('surfaces a friendly error when Gemini is unreachable', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));
    await expect(new ChatService(makeDatabase(), makeCatalog(), makeBundles()).sendMessage(customer, 'hi')).rejects.toThrow(
      'The AI assistant is unavailable right now. Please try again.',
    );
  });

  it('refuses programming questions without calling Gemini', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const result = await new ChatService(makeDatabase(), makeCatalog(), makeBundles()).sendMessage(customer, 'Can you help me write Python code?');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.messages[0].text).toContain('cannot help with coding');
  });
});
