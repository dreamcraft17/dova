import { DatabaseService } from './database.service';

const ADMIN_ID = '11111111-2222-4333-8444-555555555555';
const PRODUCT_ID = '392829b6-9b64-4433-bd86-35d39849aaaa';

function serviceWithPool() {
  const pool = { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 1 }) };
  const service = new DatabaseService();
  (service as unknown as { pool: typeof pool }).pool = pool;
  return { service, pool };
}

describe('DatabaseService.setProductApprovalStatus', () => {
  // Postgres infers a bare parameter inside CASE ... THEN $n ELSE NULL as text and
  // refuses to store it in a uuid column ("column approved_by is of type uuid but
  // expression is of type text"), which made Approve and Reject answer 500.
  it('casts the admin id to uuid so the approved_by assignment type-checks', async () => {
    const { service, pool } = serviceWithPool();
    await service.setProductApprovalStatus(PRODUCT_ID, 'approved', undefined, ADMIN_ID);
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toMatch(/approved_by\s*=\s*CASE WHEN \$1::varchar='approved' THEN \$3::uuid ELSE NULL END/);
    expect(values).toEqual(['approved', null, ADMIN_ID, PRODUCT_ID]);
  });

  it('uses the same typed statement for rejections and stores the reason', async () => {
    const { service, pool } = serviceWithPool();
    await service.setProductApprovalStatus(PRODUCT_ID, 'rejected', 'blurry photo', ADMIN_ID);
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain('$3::uuid');
    expect(values).toEqual(['rejected', 'blurry photo', ADMIN_ID, PRODUCT_ID]);
  });

  it('never leaves a bare parameter as a CASE branch value anywhere in the service', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const source: string = require('fs').readFileSync(require('path').join(__dirname, 'database.service.ts'), 'utf8');
    expect(source.match(/THEN\s+\$\d+\s+(ELSE|END)/g) ?? []).toEqual([]);
  });
});
