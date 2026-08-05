require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

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
];

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin1234', 12);
    const supplierPassword = bcrypt.hashSync(process.env.SUPPLIER_PASSWORD || 'supplier1234', 12);
    const adminId = randomUUID();
    const supplierUserId = randomUUID();

    await pool.query(
      `INSERT INTO users (id,email,password_hash,full_name,role) VALUES ($1,'admin@dova.local',$2,'DOVA Admin','admin') ON CONFLICT (email) DO NOTHING`,
      [adminId, adminPassword],
    );
    await pool.query(
      `INSERT INTO users (id,email,password_hash,full_name,role) VALUES ($1,'supplier@dova.local',$2,'Demo Supplier','supplier') ON CONFLICT (email) DO NOTHING`,
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
    const imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';

    const count = await pool.query('SELECT COUNT(*)::int AS count FROM products');
    if (count.rows[0].count < 20) {
      for (let i = 0; i < PRODUCT_CATALOG.length; i++) {
        const [name, price, categoryName] = PRODUCT_CATALOG[i];
        const categoryId = categoryByName[categoryName];
        if (!categoryId) throw new Error(`Missing category: ${categoryName}`);
        await pool.query(
          'INSERT INTO products (supplier_id,name,description,price,stock_quantity,category_id,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [supplier.rows[0].id, name, 'Freshly sourced quality produce for your business.', price, 20 + (i % 5) * 10, categoryId, imageUrl],
        );
      }
    }

    await pool.query(
      `UPDATE products p SET category_id = c.id
       FROM categories c
       WHERE p.name = 'Chicken Breast' AND c.name = 'Meat'`,
    );

    console.log('Database seed completed with 20 products');
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
