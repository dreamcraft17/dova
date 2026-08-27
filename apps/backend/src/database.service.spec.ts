import { DatabaseService } from './database.service';

function makePool() {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client = {
    query: jest.fn(async (text: string, values?: unknown[]) => {
      queries.push({ text, values });
      if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return { rows: [], rowCount: 0 };
      if (text.includes('INSERT INTO carts')) return { rows: [{ id: 'cart-1' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    }),
    release: jest.fn(),
  };
  const pool = {
    query: jest.fn(async (text: string, values?: unknown[]) => {
      queries.push({ text, values });
      if (text === 'SELECT 1') return { rows: [{ '?column?': 1 }], rowCount: 1 };
      if (text.includes('FROM feedback_posts')) return { rows: [], rowCount: 0 };
      if (text.includes('FROM products p JOIN categories')) return { rows: [], rowCount: 0 };
      if (text.includes('INSERT INTO users')) return { rows: [], rowCount: 1 };
      if (text.includes('INSERT INTO supplier_profiles')) return { rows: [], rowCount: 1 };
      if (text.includes('RETURNING id') && text.includes('supplier@dova.local')) return { rows: [{ id: 'supplier-user-id' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    }),
    connect: jest.fn(async () => client),
    end: jest.fn(),
  };
  return { pool, queries, client };
}

describe('DatabaseService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, DATABASE_URL: 'postgres://test', USE_IN_MEMORY: 'false' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('is enabled when DATABASE_URL is set and USE_IN_MEMORY is not true', () => {
    const service = new DatabaseService();
    expect(service.enabled).toBe(true);
  });

  it('persists cart items with delivery_slot', async () => {
    const { pool, client } = makePool();
    const service = new DatabaseService();
    (service as unknown as { pool: typeof pool }).pool = pool;

    await service.saveCart('user-1', {
      items: [{
        id: 'line-1',
        product: {
          id: 'prod-1',
          supplierId: 'sup-1',
          supplierName: 'Farm',
          name: 'Tomatoes',
          description: '',
          price: 1000,
          stockQuantity: 10,
          categoryId: 'cat-1',
          categoryName: 'Vegetables',
          isActive: true,
        },
        quantity: 2.5,
        subtotal: 2500,
        deliverySlot: 'evening',
      }],
      total: 2500,
    });

    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('delivery_slot'),
      ['line-1', 'cart-1', 'prod-1', 2.5, 'evening'],
    );
  });

  it('maps delivery_slot when loading cart', async () => {
    const { pool } = makePool();
    pool.query = jest.fn(async (text: string) => {
      if (text.includes('FROM carts ca JOIN cart_items')) {
        return {
          rows: [{
            id: 'line-1',
            quantity: '1.5',
            delivery_slot: 'morning',
            supplier_id: 'sup-1',
            business_name: 'Farm',
            name: 'Tomatoes',
            description: '',
            price: '1000',
            stock_quantity: 10,
            category_id: 'cat-1',
            category_name: 'Vegetables',
            is_active: true,
          }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });
    const service = new DatabaseService();
    (service as unknown as { pool: typeof pool }).pool = pool;

    const cart = await service.getCart('user-1');
    expect(cart?.items[0].deliverySlot).toBe('morning');
    expect(cart?.items[0].quantity).toBe(1.5);
  });

  it('revokes sessions by token hash', async () => {
    const { pool } = makePool();
    const service = new DatabaseService();
    (service as unknown as { pool: typeof pool }).pool = pool;

    await service.revokeSession('refresh-token-value');
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM user_sessions WHERE token_hash=$1',
      expect.any(Array),
    );
  });

  it('setSupplierStatus casts status param as varchar (approved)', async () => {
    const { pool, queries } = makePool();
    const service = new DatabaseService();
    (service as unknown as { pool: typeof pool }).pool = pool;

    await service.setSupplierStatus('sup-1', 'approved');
    expect(queries.some((q) => q.text.includes('$1::varchar'))).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('verification_status = $1::varchar'),
      ['approved', null, 'sup-1'],
    );
  });

  it('setSupplierStatus stores rejection reason', async () => {
    const { pool } = makePool();
    const service = new DatabaseService();
    (service as unknown as { pool: typeof pool }).pool = pool;

    await service.setSupplierStatus('sup-2', 'rejected', 'Incomplete docs');
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('rejection_reason = $2'),
      ['rejected', 'Incomplete docs', 'sup-2'],
    );
  });
});
