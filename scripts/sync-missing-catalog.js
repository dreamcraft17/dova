/** Insert seed catalog SKUs that are missing. Never updates price, stock, or users. */
require('./load-env').loadDovaEnv();
const { Pool } = require('pg');
const { productImageUrl, SEED_PRODUCT_CATALOG } = require('dova-shared');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const cats = await pool.query('SELECT id, name FROM categories');
    const categoryByName = Object.fromEntries(cats.rows.map((row) => [row.name, row.id]));
    const supplier = await pool.query(
      `SELECT id FROM supplier_profiles WHERE verification_status = 'approved' ORDER BY created_at ASC LIMIT 1`,
    );
    if (!supplier.rows[0]) {
      console.error('No approved supplier profile — cannot insert catalog products.');
      process.exit(1);
    }

    const inserted = [];
    for (const item of SEED_PRODUCT_CATALOG) {
      const categoryId = categoryByName[item.categoryName];
      if (!categoryId) throw new Error(`Missing category: ${item.categoryName}`);
      const found = await pool.query('SELECT id, price, stock_quantity FROM products WHERE LOWER(name)=LOWER($1) LIMIT 1', [item.name]);
      if (found.rows.length) continue;
      await pool.query(
        'INSERT INTO products (supplier_id,name,description,price,stock_quantity,category_id,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [
          supplier.rows[0].id,
          item.name,
          'Freshly sourced quality produce for your business.',
          item.price,
          50,
          categoryId,
          productImageUrl(item.name, item.categoryName),
        ],
      );
      inserted.push(item.name);
    }

    const wheat = await pool.query(
      `SELECT name, price, stock_quantity FROM products WHERE LOWER(name) IN ('wheat flour', 'whole wheat flour') ORDER BY name`,
    );
    console.log('Existing flour SKUs (unchanged):', wheat.rows);
    console.log(inserted.length ? `Inserted ${inserted.length} missing products: ${inserted.join(', ')}` : 'No missing seed products.');
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
