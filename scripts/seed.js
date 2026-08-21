require('./load-env').loadDovaEnv();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { productImageUrl, shouldRefreshCatalogImage } = require('dova-shared');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const PRODUCT_CATALOG = [
  ['Fresh Tomatoes', 25000, 'Vegetables'],
  ['Organic Bananas', 18000, 'Fruits'],
  ['Farm Milk', 22000, 'Dairy'],
  ['Premium Rice', 75000, 'Grains'],
  ['Crisp Carrots', 16000, 'Vegetables'],
  ['Avocado Hass', 30000, 'Fruits'],
  ['Free Range Eggs', 28000, 'Dairy'],
  ['Whole Wheat Flour', 42000, 'Grains'],
  ['Chicken Breast', 68000, 'Meat'],
  ['Atlantic Salmon', 125000, 'Seafood'],
  ['Palm Sugar', 24000, 'Pantry'],
  ['Coconut Water', 32000, 'Beverages'],
  ['Red Onions', 19000, 'Vegetables'],
  ['Sweet Potatoes', 23000, 'Vegetables'],
  ['Greek Yogurt', 36000, 'Dairy'],
  ['Arabica Coffee', 95000, 'Beverages'],
  ['Fresh Spinach', 17000, 'Vegetables'],
  ['Mango Harum Manis', 35000, 'Fruits'],
  ['Black Pepper', 27000, 'Pantry'],
  ['Cooking Oil', 58000, 'Pantry'],
  ['UAT Sample Greens', 1500, 'Vegetables'],
  ['UAT Sample Grain Pack', 2500, 'Grains'],
];

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin1234', 12);
    const supplierPassword = bcrypt.hashSync(process.env.SUPPLIER_PASSWORD || 'supplier1234', 12);
    const adminId = randomUUID();
    const supplierUserId = randomUUID();

    await pool.query(
      `INSERT INTO users (id,email,password_hash,full_name,role,is_active)
       VALUES ($1,'admin@dova.local',$2,'DOVA Admin','admin',TRUE)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         is_active = TRUE,
         updated_at = NOW()`,
      [adminId, adminPassword],
    );
    await pool.query(
      `INSERT INTO users (id,email,password_hash,full_name,role,is_active)
       VALUES ($1,'supplier@dova.local',$2,'Demo Supplier','supplier',TRUE)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         is_active = TRUE,
         updated_at = NOW()`,
      [supplierUserId, supplierPassword],
    );

    const supplierUser = await pool.query(`SELECT id FROM users WHERE email='supplier@dova.local'`);
    const supplierId = randomUUID();
    await pool.query(
      `INSERT INTO supplier_profiles (id,user_id,business_name,business_phone,verification_status) VALUES ($1,$2,'Green Valley Farms','+62000000000','approved') ON CONFLICT (user_id) DO NOTHING`,
      [supplierId, supplierUser.rows[0].id],
    );

    const supplier = await pool.query(`SELECT id FROM supplier_profiles WHERE user_id=$1`, [supplierUser.rows[0].id]);
    const cats = await pool.query('SELECT id,name FROM categories');
    const categoryByName = Object.fromEntries(cats.rows.map((row) => [row.name, row.id]));

    for (const [name, price, categoryName] of PRODUCT_CATALOG) {
      const categoryId = categoryByName[categoryName];
      if (!categoryId) throw new Error(`Missing category: ${categoryName}`);
      const found = await pool.query('SELECT id FROM products WHERE name=$1 LIMIT 1', [name]);
      if (found.rows.length) continue;
      await pool.query(
        'INSERT INTO products (supplier_id,name,description,price,stock_quantity,category_id,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [
          supplier.rows[0].id,
          name,
          'Freshly sourced quality produce for your business.',
          price,
          50,
          categoryId,
          productImageUrl(name, categoryName),
        ],
      );
    }

    const existing = await pool.query(
      'SELECT p.id, p.name, p.image_url, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id',
    );
    for (const row of existing.rows) {
      const url = productImageUrl(row.name, row.category_name);
      if (shouldRefreshCatalogImage(row.name, row.image_url)) {
        await pool.query('UPDATE products SET image_url=$1, updated_at=NOW() WHERE id=$2', [url, row.id]);
      }
    }

    await pool.query(
      `UPDATE products p SET category_id = c.id, updated_at = NOW()
       FROM categories c
       WHERE c.name = 'Meat'
         AND LOWER(p.name) LIKE '%chicken%breast%'
         AND p.category_id <> c.id`,
    );

    console.log(`Database seed completed with ${PRODUCT_CATALOG.length} catalog products`);
    console.log('Demo logins (from ADMIN_PASSWORD / SUPPLIER_PASSWORD env):');
    console.log(`  admin@dova.local     → ${process.env.ADMIN_PASSWORD || 'admin1234'}`);
    console.log(`  supplier@dova.local  → ${process.env.SUPPLIER_PASSWORD || 'supplier1234'}`);
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
