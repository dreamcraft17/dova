import * as fs from 'fs';
import * as path from 'path';

const REQUIRED_EXPORTS = ['productImageUrl', 'publicCatalogImageUrl', 'SEED_PRODUCT_CATALOG', 'stockLimitMessage', 'shouldRefreshCatalogImage'];

describe('dova-shared dist exports', () => {
  it('declares backend-required symbols in index.d.ts', () => {
    const dtsPath = path.join(__dirname, '../dist/index.d.ts');
    expect(fs.existsSync(dtsPath)).toBe(true);
    const dts = fs.readFileSync(dtsPath, 'utf8');
    for (const symbol of REQUIRED_EXPORTS) {
      expect(dts).toContain(symbol);
    }
  });
});
