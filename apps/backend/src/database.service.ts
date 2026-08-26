import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { Cart, Category, Order, Product, Role, User, minOrderMessage, productImageUrl, shouldRefreshCatalogImage } from 'dova-shared';

export type StoredUser = User & {
  passwordHash: string;
  otpHash?: string;
  otpExpiresAt?: string;
  otpAttempts?: number;
  otpLockedUntil?: string;
  otpResendCount?: number;
  otpResendWindowStart?: string;
};
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly enabled = Boolean(process.env.DATABASE_URL) && process.env.USE_IN_MEMORY !== 'true';
  readonly pool?: Pool;
  constructor() { if (this.enabled) this.pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 }); }
  async onModuleInit() { if (!this.pool) return; await this.pool.query('SELECT 1'); await this.bootstrap(); }
  async onModuleDestroy() { await this.pool?.end(); }
  private mapUser(row: any): StoredUser {
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phoneNumber: row.phone_number || undefined,
      role: row.role as Role,
      isActive: row.is_active,
      emailVerifiedAt: row.email_verified_at ? new Date(row.email_verified_at).toISOString() : undefined,
      createdAt: new Date(row.created_at).toISOString(),
      passwordHash: row.password_hash,
      otpHash: row.otp_hash || undefined,
      otpExpiresAt: row.otp_expires_at ? new Date(row.otp_expires_at).toISOString() : undefined,
      otpAttempts: row.otp_attempts ?? 0,
      otpLockedUntil: row.otp_locked_until ? new Date(row.otp_locked_until).toISOString() : undefined,
      otpResendCount: row.otp_resend_count ?? 0,
      otpResendWindowStart: row.otp_resend_window_start ? new Date(row.otp_resend_window_start).toISOString() : undefined,
    };
  }
  async findUserByEmail(email: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]); return result.rows[0] ? this.mapUser(result.rows[0]) : undefined; }
  async findUserById(id: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]); return result.rows[0] ? this.mapUser(result.rows[0]) : undefined; }
  async insertUser(user: StoredUser) {
    if (!this.pool) return;
    await this.pool.query(
      'INSERT INTO users (id,email,password_hash,full_name,role,is_active,created_at,updated_at,email_verified_at,otp_attempts,otp_resend_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$7,$8,$9,$10)',
      [user.id, user.email, user.passwordHash, user.fullName, user.role, user.isActive, user.createdAt, user.emailVerifiedAt || null, user.otpAttempts ?? 0, user.otpResendCount ?? 0],
    );
  }
  async updatePendingUser(userId: string, fullName: string, passwordHash: string) {
    if (!this.pool) return;
    await this.pool.query('UPDATE users SET full_name=$1,password_hash=$2,is_active=FALSE,updated_at=NOW() WHERE id=$3', [fullName, passwordHash, userId]);
  }
  async saveUserOtp(userId: string, otpHash: string, expiresAt: Date, attempts: number, lockedUntil?: Date | null) {
    if (!this.pool) return;
    await this.pool.query(
      'UPDATE users SET otp_hash=$1,otp_expires_at=$2,otp_attempts=$3,otp_locked_until=$4,updated_at=NOW() WHERE id=$5',
      [otpHash, expiresAt, attempts, lockedUntil ?? null, userId],
    );
  }
  async updateOtpResend(userId: string, resendCount: number, windowStart: Date, otpHash: string, expiresAt: Date) {
    if (!this.pool) return;
    await this.pool.query(
      'UPDATE users SET otp_resend_count=$1,otp_resend_window_start=$2,otp_hash=$3,otp_expires_at=$4,otp_attempts=0,otp_locked_until=NULL,updated_at=NOW() WHERE id=$5',
      [resendCount, windowStart, otpHash, expiresAt, userId],
    );
  }
  async verifyUserEmail(userId: string) {
    if (!this.pool) return;
    await this.pool.query(
      "UPDATE users SET email_verified_at=NOW(),is_active=TRUE,otp_hash=NULL,otp_expires_at=NULL,otp_attempts=0,otp_locked_until=NULL,updated_at=NOW() WHERE id=$1",
      [userId],
    );
  }
  async saveSession(userId: string, refreshToken: string, expiresAt: Date) { if (!this.pool) return; await this.pool.query('INSERT INTO user_sessions (user_id,token_hash,expires_at) VALUES ($1,$2,$3)', [userId, digest(refreshToken), expiresAt]); }
  async hasSession(userId: string, refreshToken: string) { if (!this.pool) return true; const result = await this.pool.query('SELECT 1 FROM user_sessions WHERE user_id=$1 AND token_hash=$2 AND expires_at > NOW() LIMIT 1', [userId, digest(refreshToken)]); return result.rowCount === 1; }
  async revokeSession(refreshToken?: string) { if (this.pool && refreshToken) await this.pool.query('DELETE FROM user_sessions WHERE token_hash=$1', [digest(refreshToken)]); }
  private mapProduct(row: any): Product { return { id: row.id, supplierId: row.supplier_id, supplierName: row.business_name, name: row.name, description: row.description || '', price: Number(row.price), stockQuantity: row.stock_quantity, categoryId: row.category_id, categoryName: row.category_name, imageUrl: row.image_url || undefined, isActive: row.is_active }; }
  async listProducts(search = '', categoryId = '', page = 1, limit = 20) { if (!this.pool) return undefined; const values: unknown[] = []; const filters = ['p.is_active = TRUE', 'p.stock_quantity > 0']; if (search) { values.push(`%${search.toLowerCase()}%`); filters.push(`LOWER(p.name) LIKE $${values.length}`); } if (categoryId) { values.push(categoryId); filters.push(`p.category_id = $${values.length}`); } const where = filters.join(' AND '); const totalResult = await this.pool.query(`SELECT COUNT(*)::int AS total FROM products p WHERE ${where}`, values); values.push(limit, (page - 1) * limit); const result = await this.pool.query(`SELECT p.*, s.business_name, c.name AS category_name FROM products p JOIN supplier_profiles s ON s.id=p.supplier_id JOIN categories c ON c.id=p.category_id WHERE ${where} ORDER BY p.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values); return { data: result.rows.map(row => this.mapProduct(row)), pagination: { page, limit, total: totalResult.rows[0].total } }; }
  async findProduct(id: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT p.*, s.business_name, c.name AS category_name FROM products p JOIN supplier_profiles s ON s.id=p.supplier_id JOIN categories c ON c.id=p.category_id WHERE p.id=$1 AND p.is_active=TRUE AND p.stock_quantity>0', [id]); return result.rows[0] ? this.mapProduct(result.rows[0]) : undefined; }
  async categories() { if (!this.pool) return undefined; const result = await this.pool.query('SELECT id,name FROM categories ORDER BY name'); return result.rows as Category[]; }
  async getCart(userId: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT ci.id,ci.quantity,ci.delivery_slot,p.*,s.business_name,c.name AS category_name FROM carts ca JOIN cart_items ci ON ci.cart_id=ca.id JOIN products p ON p.id=ci.product_id JOIN supplier_profiles s ON s.id=p.supplier_id JOIN categories c ON c.id=p.category_id WHERE ca.user_id=$1 AND p.is_active=TRUE', [userId]); const items = result.rows.map(row => ({ id: row.id, product: this.mapProduct(row), quantity: Number(row.quantity), subtotal: Number(row.price) * Number(row.quantity), deliverySlot: (row.delivery_slot || 'morning') as 'morning' | 'evening' })); return { items, total: items.reduce((sum, item) => sum + item.subtotal, 0) } as Cart; }
  async saveCart(userId: string, cart: Cart) { if (!this.pool) return; const client = await this.pool.connect(); try { await client.query('BEGIN'); const cartResult = await client.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET updated_at=NOW() RETURNING id', [userId]); const cartId = cartResult.rows[0].id; await client.query('DELETE FROM cart_items WHERE cart_id=$1', [cartId]); for (const item of cart.items) await client.query('INSERT INTO cart_items (id,cart_id,product_id,quantity,delivery_slot) VALUES ($1,$2,$3,$4,$5)', [item.id, cartId, item.product.id, item.quantity, item.deliverySlot || 'morning']); await client.query('COMMIT'); } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); } }
  async createOrderFromCart(userId: string, body: any) { if (!this.pool) return undefined; const client = await this.pool.connect(); try { await client.query('BEGIN'); const result = await client.query('SELECT ci.id,ci.quantity,p.*,s.business_name,c.name AS category_name FROM carts ca JOIN cart_items ci ON ci.cart_id=ca.id JOIN products p ON p.id=ci.product_id JOIN supplier_profiles s ON s.id=p.supplier_id JOIN categories c ON c.id=p.category_id WHERE ca.user_id=$1 FOR UPDATE', [userId]); if (!result.rows.length) throw new Error('Cart is empty'); const fulfillmentType = body.fulfillmentType === 'pickup' ? 'pickup' : 'delivery'; if (!body.deliveryName || !body.deliveryPhone) throw new Error('Delivery details are required'); if (fulfillmentType === 'delivery' && (!body.deliveryAddress || String(body.deliveryAddress).length < 5)) throw new Error('Delivery address is required'); const deliveryAddress = fulfillmentType === 'pickup' ? (body.deliveryAddress || 'Pickup at DOVA hub') : body.deliveryAddress; const items = result.rows.map(row => ({ id: row.id, product: this.mapProduct(row), quantity: Number(row.quantity), subtotal: Number(row.price) * Number(row.quantity) })); if (items.some(item => item.quantity > item.product.stockQuantity)) throw new Error('Quantity exceeds available stock'); const total = items.reduce((sum, item) => sum + item.subtotal, 0); const shortfallMsg = minOrderMessage(total, fulfillmentType); if (shortfallMsg) throw new Error(shortfallMsg); const orderResult = await client.query('INSERT INTO orders (customer_id,order_number,status,total_amount,delivery_name,delivery_address,delivery_phone,fulfillment_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [userId, `DOVA-${Date.now().toString(36).toUpperCase()}`, 'pending', total, body.deliveryName, deliveryAddress, body.deliveryPhone, fulfillmentType]); const row = orderResult.rows[0]; const orderItems: Order['items'] = []; for (const item of items) { await client.query('UPDATE products SET stock_quantity=stock_quantity-$1,updated_at=NOW() WHERE id=$2', [item.quantity, item.product.id]); const oi = await client.query('INSERT INTO order_items (order_id,product_id,supplier_id,quantity,unit_price,subtotal) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [row.id, item.product.id, item.product.supplierId, item.quantity, item.product.price, item.subtotal]); orderItems.push({ id: oi.rows[0].id, product: item.product, quantity: Number(item.quantity), unitPrice: item.product.price, subtotal: item.subtotal, supplierOrderStatus: 'pending' }); } await client.query('DELETE FROM cart_items WHERE cart_id=(SELECT id FROM carts WHERE user_id=$1)', [userId]); await client.query('COMMIT'); return { id: row.id, orderNumber: row.order_number, customerId: row.customer_id, status: row.status, totalAmount: Number(row.total_amount), deliveryName: row.delivery_name, deliveryAddress: row.delivery_address, deliveryPhone: row.delivery_phone, fulfillmentType: row.fulfillment_type || fulfillmentType, items: orderItems, createdAt: new Date(row.created_at).toISOString() } as Order; } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); } }
  async recordPurchaseStock(orderId: string) { if (this.pool) await this.pool.query("INSERT INTO stock_adjustments (order_id,product_id,supplier_id,quantity,reason,stock_after) SELECT $1,oi.product_id,oi.supplier_id,-oi.quantity,'purchase',p.stock_quantity FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=$1 AND NOT EXISTS (SELECT 1 FROM stock_adjustments sa WHERE sa.order_id=$1 AND sa.product_id=oi.product_id AND sa.reason='purchase')", [orderId]); }
  async listOrders(userId: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT * FROM orders WHERE customer_id=$1 ORDER BY created_at DESC', [userId]); const orders: Order[] = []; for (const row of result.rows) { const itemResult = await this.pool.query('SELECT oi.*,p.*,s.business_name,c.name AS category_name FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN supplier_profiles s ON s.id=oi.supplier_id JOIN categories c ON c.id=p.category_id WHERE oi.order_id=$1 ORDER BY oi.created_at', [row.id]); orders.push({ id: row.id, orderNumber: row.order_number, customerId: row.customer_id, status: row.status, totalAmount: Number(row.total_amount), deliveryName: row.delivery_name, deliveryAddress: row.delivery_address, deliveryPhone: row.delivery_phone, fulfillmentType: row.fulfillment_type || 'delivery', paymentReference: row.payment_reference || undefined, paymentVerifiedAt: row.payment_verified_at ? new Date(row.payment_verified_at).toISOString() : undefined, items: itemResult.rows.map(item => ({ id: item.id, product: this.mapProduct(item), quantity: Number(item.quantity), unitPrice: Number(item.unit_price), subtotal: Number(item.subtotal), supplierOrderStatus: item.supplier_order_status })), createdAt: new Date(row.created_at).toISOString() }); } return orders; }
  async findOrder(userId: string, orderId: string) { const orders = await this.listOrders(userId); return orders?.find(order => order.id === orderId); }
  async findOrderByPaymentReference(reference: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT * FROM orders WHERE payment_reference=$1 LIMIT 1', [reference]); const row = result.rows[0]; if (!row) return undefined; const itemResult = await this.pool.query('SELECT oi.*,p.*,s.business_name,c.name AS category_name FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN supplier_profiles s ON s.id=oi.supplier_id JOIN categories c ON c.id=p.category_id WHERE oi.order_id=$1 ORDER BY oi.created_at', [row.id]); return { id: row.id, orderNumber: row.order_number, customerId: row.customer_id, status: row.status, totalAmount: Number(row.total_amount), deliveryName: row.delivery_name, deliveryAddress: row.delivery_address, deliveryPhone: row.delivery_phone, paymentReference: row.payment_reference || undefined, paymentVerifiedAt: row.payment_verified_at ? new Date(row.payment_verified_at).toISOString() : undefined, items: itemResult.rows.map(item => ({ id: item.id, product: this.mapProduct(item), quantity: Number(item.quantity), unitPrice: Number(item.unit_price), subtotal: Number(item.subtotal), supplierOrderStatus: item.supplier_order_status })), createdAt: new Date(row.created_at).toISOString() } as Order; }
  async markOrderPaid(orderId: string, reference: string) { if (this.pool) await this.pool.query("UPDATE orders SET status='paid',payment_reference=$1,payment_verified_at=NOW(),updated_at=NOW() WHERE id=$2", [reference, orderId]); }
  async setOrderPaymentReference(orderId: string, reference: string) { if (this.pool) await this.pool.query('UPDATE orders SET payment_reference=$1,updated_at=NOW() WHERE id=$2', [reference, orderId]); }
  async logPayment(orderId: string, reference: string, amount: number, status: string, response?: unknown) { if (this.pool) await this.pool.query('INSERT INTO payment_logs (order_id,payment_reference,amount,status,paystack_response) VALUES ($1,$2,$3,$4,$5)', [orderId, reference, amount, status, response ? JSON.stringify(response) : null]); }
  async findSupplierByUser(userId: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT * FROM supplier_profiles WHERE user_id=$1 LIMIT 1', [userId]); const row = result.rows[0]; return row ? { id: row.id, userId: row.user_id, businessName: row.business_name, phone: row.business_phone || '', status: row.verification_status, documentUrl: row.verification_doc_url, rejectionReason: row.rejection_reason } : undefined; }
  async findSupplierById(id: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT * FROM supplier_profiles WHERE id=$1 LIMIT 1', [id]); const row = result.rows[0]; return row ? { id: row.id, userId: row.user_id, businessName: row.business_name, phone: row.business_phone || '', status: row.verification_status, documentUrl: row.verification_doc_url, rejectionReason: row.rejection_reason } : undefined; }
  async insertSupplierProfile(profile: any) { if (this.pool) await this.pool.query('INSERT INTO supplier_profiles (id,user_id,business_name,business_phone,verification_status,verification_doc_url) VALUES ($1,$2,$3,$4,$5,$6)', [profile.id, profile.userId, profile.businessName, profile.phone, profile.status, profile.documentUrl || null]); }
  async listSupplierProducts(supplierId: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT p.*,s.business_name,c.name AS category_name FROM products p JOIN supplier_profiles s ON s.id=p.supplier_id AND s.id=$1 JOIN categories c ON c.id=p.category_id WHERE p.supplier_id=$1 ORDER BY p.created_at DESC', [supplierId]); return result.rows.map(row => this.mapProduct(row)); }
  async setSupplierProductActive(supplierId: string, productId: string, active: boolean) { if (this.pool) await this.pool.query('UPDATE products SET is_active=$1,updated_at=NOW() WHERE id=$2 AND supplier_id=$3', [active, productId, supplierId]); }
  async createSupplierProduct(supplierId: string, body: any) { if (!this.pool) return undefined; const result = await this.pool.query('INSERT INTO products (supplier_id,name,description,price,stock_quantity,category_id,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [supplierId, body.name, body.description, body.price, body.quantity, body.categoryId, body.imageUrl || null]); return this.findProduct(result.rows[0].id); }
  async updateSupplierProduct(supplierId: string, productId: string, body: any) { if (!this.pool) return undefined; const result = await this.pool.query('UPDATE products SET name=$1,description=$2,price=$3,stock_quantity=$4,category_id=$5,image_url=$6,updated_at=NOW() WHERE id=$7 AND supplier_id=$8 AND is_active=TRUE RETURNING id', [body.name, body.description, body.price, body.quantity, body.categoryId, body.imageUrl || null, productId, supplierId]); return result.rowCount ? this.findProduct(productId) : undefined; }
  async deleteSupplierProduct(supplierId: string, productId: string) { if (this.pool) await this.pool.query('UPDATE products SET is_active=FALSE,updated_at=NOW() WHERE id=$1 AND supplier_id=$2', [productId, supplierId]); }
  async adjustStock(supplierId: string, productId: string, quantity: number, reason: string) { if (!this.pool) return undefined; const client = await this.pool.connect(); try { await client.query('BEGIN'); const delta = reason === 'damage' ? -quantity : quantity; const result = await client.query('UPDATE products SET stock_quantity=stock_quantity+$1,updated_at=NOW() WHERE id=$2 AND supplier_id=$3 AND stock_quantity+$1>=0 RETURNING stock_quantity', [delta, productId, supplierId]); if (!result.rowCount) throw new Error('Product not found or insufficient stock'); await client.query('INSERT INTO stock_adjustments (product_id,supplier_id,quantity,reason,stock_after) VALUES ($1,$2,$3,$4,$5)', [productId, supplierId, delta, reason, result.rows[0].stock_quantity]); await client.query('COMMIT'); return result.rows[0].stock_quantity; } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); } }
  async stockHistory(supplierId: string, productId: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT id,quantity,reason,stock_after,created_at FROM stock_adjustments WHERE supplier_id=$1 AND product_id=$2 ORDER BY created_at DESC', [supplierId, productId]); return result.rows.map(row => ({ id: row.id, quantity: row.quantity, reason: row.reason, stockAfter: row.stock_after, createdAt: new Date(row.created_at).toISOString() })); }
  async supplierOrders(supplierId: string) { if (!this.pool) return undefined; const result = await this.pool.query('SELECT o.*,u.full_name AS customer_name,oi.id AS item_id,oi.quantity,oi.unit_price,oi.subtotal,oi.supplier_order_status,p.id AS product_id,p.name AS product_name FROM orders o JOIN users u ON u.id=o.customer_id JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id WHERE oi.supplier_id=$1 ORDER BY o.created_at DESC', [supplierId]); return result.rows.map(row => ({ orderId: row.id, orderNumber: row.order_number, customerName: row.customer_name, deliveryName: row.delivery_name, deliveryAddress: row.delivery_address, createdAt: new Date(row.created_at).toISOString(), itemId: row.item_id, productName: row.product_name, quantity: Number(row.quantity), unitPrice: Number(row.unit_price), subtotal: Number(row.subtotal), status: row.supplier_order_status })); }
  async updateSupplierOrderStatus(supplierId: string, itemId: string, status: string) { if (!this.pool) return undefined; const current = status === 'processing' ? ['pending', 'paid'] : status === 'shipped' ? ['processing'] : ['shipped']; const result = await this.pool.query('UPDATE order_items SET supplier_order_status=$1,updated_at=NOW() WHERE id=$2 AND supplier_id=$3 AND supplier_order_status = ANY($4::text[]) RETURNING id,order_id', [status, itemId, supplierId, current]); if (!result.rowCount) return false; const orderId = result.rows[0].order_id; const statuses = await this.pool.query('SELECT supplier_order_status FROM order_items WHERE order_id=$1', [orderId]); if (statuses.rows.length && statuses.rows.every((row: any) => row.supplier_order_status === status)) await this.pool.query('UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2', [status, orderId]); return true; }
  async adminDashboard() { if (!this.pool) return undefined; const [users, suppliers, products, orders, pending] = await Promise.all([this.pool.query('SELECT COUNT(*)::int AS count FROM users'), this.pool.query('SELECT COUNT(*)::int AS count FROM supplier_profiles'), this.pool.query('SELECT COUNT(*)::int AS count FROM products WHERE is_active=TRUE'), this.pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'"), this.pool.query("SELECT COUNT(*)::int AS count FROM supplier_profiles WHERE verification_status='pending'")]); return { users: users.rows[0].count, suppliers: suppliers.rows[0].count, products: products.rows[0].count, orders: orders.rows[0].count, pendingSuppliers: pending.rows[0].count }; }
  async pendingSuppliers() { if (!this.pool) return undefined; const result = await this.pool.query("SELECT sp.*,u.email,u.full_name FROM supplier_profiles sp JOIN users u ON u.id=sp.user_id WHERE sp.verification_status='pending' ORDER BY sp.created_at"); return result.rows.map(row => ({ id: row.id, userId: row.user_id, businessName: row.business_name, contactName: row.full_name, email: row.email, phone: row.business_phone, status: row.verification_status, documentUrl: row.verification_doc_url, createdAt: new Date(row.created_at).toISOString() })); }
  async setSupplierStatus(supplierId: string, status: string, reason?: string) { if (this.pool) await this.pool.query('UPDATE supplier_profiles SET verification_status=$1,rejection_reason=$2,verified_at=CASE WHEN $1=\'approved\' THEN NOW() ELSE NULL END,updated_at=NOW() WHERE id=$3', [status, reason || null, supplierId]); }
  async adminUsers() {
    if (!this.pool) return undefined;
    const result = await this.pool.query('SELECT id,email,full_name,role,is_active,email_verified_at,created_at FROM users ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      isActive: row.is_active,
      emailVerifiedAt: row.email_verified_at ? new Date(row.email_verified_at).toISOString() : undefined,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }
  async setUserActive(userId: string, active: boolean) { if (this.pool) await this.pool.query('UPDATE users SET is_active=$1,updated_at=NOW() WHERE id=$2', [active, userId]); }
  async adminProducts() { if (!this.pool) return undefined; const result = await this.pool.query('SELECT p.*,s.business_name,c.name AS category_name FROM products p JOIN supplier_profiles s ON s.id=p.supplier_id JOIN categories c ON c.id=p.category_id ORDER BY p.created_at DESC'); return result.rows.map(row => this.mapProduct(row)); }
  async setProductActive(productId: string, active: boolean) { if (this.pool) await this.pool.query('UPDATE products SET is_active=$1,updated_at=NOW() WHERE id=$2', [active, productId]); }
  async adminOrders(status = '', search = '') { if (!this.pool) return undefined; const values: unknown[] = []; const filters: string[] = []; if (status) { values.push(status); filters.push(`o.status=$${values.length}`); } if (search) { values.push(`%${search.toLowerCase()}%`); filters.push(`(LOWER(o.order_number) LIKE $${values.length} OR LOWER(u.full_name) LIKE $${values.length})`); } const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''; const result = await this.pool.query(`SELECT o.*,u.full_name AS customer_name FROM orders o JOIN users u ON u.id=o.customer_id ${where} ORDER BY o.created_at DESC`, values); return result.rows.map(row => ({ id: row.id, orderNumber: row.order_number, customerName: row.customer_name, status: row.status, totalAmount: Number(row.total_amount), createdAt: new Date(row.created_at).toISOString() })); }
  async insertContactSubmission(body: { name: string; email: string; message: string }) {
    if (!this.pool) return undefined;
    const result = await this.pool.query(
      'INSERT INTO contact_submissions (name,email,message) VALUES ($1,$2,$3) RETURNING id,status,created_at',
      [body.name, body.email, body.message],
    );
    const row = result.rows[0];
    return { id: row.id, status: row.status, createdAt: new Date(row.created_at).toISOString() };
  }
  async listContactSubmissions() {
    if (!this.pool) return undefined;
    const result = await this.pool.query('SELECT id,name,email,message,status,created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 100');
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }

  private mapFeedbackPost(row: any) {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      status: row.status,
      authorName: row.author_name,
      authorEmail: row.author_email || undefined,
      userId: row.user_id || undefined,
      votes: row.votes,
      voterIds: Array.isArray(row.voter_ids) ? row.voter_ids : JSON.parse(row.voter_ids || '[]'),
      commentCount: row.comment_count,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  async feedbackList(sort: 'votes' | 'new' = 'votes', search = '') {
    if (!this.pool) return undefined;
    const q = search.trim().toLowerCase();
    const order = sort === 'new' ? 'created_at DESC' : 'votes DESC, created_at DESC';
    const result = q
      ? await this.pool.query(
          `SELECT * FROM feedback_posts WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 ORDER BY ${order}`,
          [`%${q}%`],
        )
      : await this.pool.query(`SELECT * FROM feedback_posts ORDER BY ${order}`);
    return result.rows.map((row) => this.mapFeedbackPost(row));
  }

  async feedbackFind(id: string) {
    if (!this.pool) return undefined;
    const result = await this.pool.query('SELECT * FROM feedback_posts WHERE id=$1 LIMIT 1', [id]);
    return result.rows[0] ? this.mapFeedbackPost(result.rows[0]) : undefined;
  }

  async feedbackCreate(post: { id: string; slug: string; title: string; description: string; status: string; authorName: string; authorEmail?: string; userId?: string; votes: number; voterIds: string[] }) {
    if (!this.pool) return;
    await this.pool.query(
      'INSERT INTO feedback_posts (id,slug,title,description,status,author_name,author_email,user_id,votes,voter_ids) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [post.id, post.slug, post.title, post.description, post.status, post.authorName, post.authorEmail || null, post.userId || null, post.votes, JSON.stringify(post.voterIds)],
    );
  }

  async feedbackUpdateVotes(id: string, votes: number, voterIds: string[]) {
    if (!this.pool) return;
    await this.pool.query('UPDATE feedback_posts SET votes=$1,voter_ids=$2 WHERE id=$3', [votes, JSON.stringify(voterIds), id]);
  }

  async feedbackSetStatus(id: string, status: string) {
    if (!this.pool) return;
    await this.pool.query('UPDATE feedback_posts SET status=$1 WHERE id=$2', [status, id]);
  }

  async feedbackComments(postId: string) {
    if (!this.pool) return undefined;
    const result = await this.pool.query('SELECT * FROM feedback_comments WHERE post_id=$1 ORDER BY created_at', [postId]);
    return result.rows.map((row) => ({
      id: row.id,
      postId: row.post_id,
      body: row.body,
      authorName: row.author_name,
      userId: row.user_id || undefined,
      isOfficial: row.is_official,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }

  async feedbackAddComment(comment: { id: string; postId: string; body: string; authorName: string; userId?: string; isOfficial: boolean }) {
    if (!this.pool) return;
    await this.pool.query(
      'INSERT INTO feedback_comments (id,post_id,body,author_name,user_id,is_official) VALUES ($1,$2,$3,$4,$5,$6)',
      [comment.id, comment.postId, comment.body, comment.authorName, comment.userId || null, comment.isOfficial],
    );
    await this.pool.query('UPDATE feedback_posts SET comment_count=(SELECT COUNT(*)::int FROM feedback_comments WHERE post_id=$1) WHERE id=$1', [comment.postId]);
  }

  async feedbackChangelogs() {
    if (!this.pool) return undefined;
    const result = await this.pool.query('SELECT * FROM feedback_changelog ORDER BY published_at DESC');
    return result.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      body: row.body,
      publishedAt: new Date(row.published_at).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }

  async feedbackChangelogBySlug(slug: string) {
    if (!this.pool) return undefined;
    const result = await this.pool.query('SELECT * FROM feedback_changelog WHERE slug=$1 LIMIT 1', [slug]);
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      body: row.body,
      publishedAt: new Date(row.published_at).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  async feedbackCreateChangelog(entry: { id: string; slug: string; title: string; summary: string; body: string; publishedAt: string; createdAt: string }) {
    if (!this.pool) return;
    await this.pool.query(
      'INSERT INTO feedback_changelog (id,slug,title,summary,body,published_at,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [entry.id, entry.slug, entry.title, entry.summary, entry.body, entry.publishedAt, entry.createdAt],
    );
  }

  async feedbackSeedIfEmpty(seedPosts: Array<{ title: string; description: string; status: string; authorName: string; votes: number }>, seedChangelog: { slug: string; title: string; summary: string; body: string }) {
    if (!this.pool) return;
    const count = await this.pool.query('SELECT COUNT(*)::int AS count FROM feedback_posts');
    if (count.rows[0].count > 0) return;
    for (const item of seedPosts) {
      const id = randomUUID();
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80);
      await this.feedbackCreate({ id, slug, title: item.title, description: item.description, status: item.status, authorName: item.authorName, votes: item.votes, voterIds: [] });
    }
    const changelogId = randomUUID();
    const now = new Date().toISOString();
    await this.feedbackCreateChangelog({ id: changelogId, slug: seedChangelog.slug, title: seedChangelog.title, summary: seedChangelog.summary, body: seedChangelog.body, publishedAt: now, createdAt: now });
  }

  private async bootstrap() {
    if (!this.pool) return;
    const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD ?? 'admin1234', 12);
    const supplierPassword = bcrypt.hashSync(process.env.SUPPLIER_PASSWORD ?? 'supplier1234', 12);
    await this.pool.query(
      `INSERT INTO users (email,password_hash,full_name,role,is_active,email_verified_at)
       VALUES ('admin@dova.local',$1,'DOVA Admin','admin',TRUE,NOW())
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         is_active = TRUE,
         email_verified_at = COALESCE(users.email_verified_at, NOW()),
         updated_at = NOW()`,
      [adminPassword],
    );
    const supplierUser = await this.pool.query(
      `INSERT INTO users (email,password_hash,full_name,role,is_active,email_verified_at)
       VALUES ('supplier@dova.local',$1,'Demo Supplier','supplier',TRUE,NOW())
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         is_active = TRUE,
         email_verified_at = COALESCE(users.email_verified_at, NOW()),
         updated_at = NOW()
       RETURNING id`,
      [supplierPassword],
    );
    await this.pool.query(
      `INSERT INTO supplier_profiles (user_id,business_name,business_phone,verification_status)
       VALUES ($1,'Green Valley Farms','+62000000000','approved')
       ON CONFLICT (user_id) DO UPDATE SET verification_status='approved', updated_at=NOW()`,
      [supplierUser.rows[0].id],
    );
    await this.pool.query(
      `UPDATE products p SET category_id = c.id, updated_at = NOW()
       FROM categories c
       WHERE c.name = 'Meat'
         AND LOWER(p.name) LIKE '%chicken%breast%'
         AND p.category_id <> c.id`,
    );
    const products = await this.pool.query(
      'SELECT p.id, p.name, p.image_url, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id',
    );
    for (const row of products.rows) {
      const url = productImageUrl(row.name, row.category_name);
      if (shouldRefreshCatalogImage(row.name, row.image_url)) {
        await this.pool.query('UPDATE products SET image_url=$1, updated_at=NOW() WHERE id=$2', [url, row.id]);
      }
    }
    try {
      await this.feedbackSeedIfEmpty(
        [
          { title: 'Mobile app for suppliers', description: 'Native mobile dashboard for stock updates on the go.', status: 'planned', authorName: 'DOVA Community', votes: 12 },
          { title: 'Bulk order discounts', description: 'Tiered pricing when ordering large quantities weekly.', status: 'open', authorName: 'DOVA Community', votes: 8 },
          { title: 'Delivery slot reminders', description: 'SMS reminder before morning/evening delivery window.', status: 'in_progress', authorName: 'DOVA Community', votes: 15 },
        ],
        {
          slug: 'feedback-board-launch',
          title: 'Native feedback board is live',
          summary: 'Submit ideas, vote, and follow the public roadmap inside DOVA.',
          body: 'The DOVA feedback board replaces the external FeedLog app. Customers and suppliers can share ideas, vote when logged in, and track delivery on the roadmap and changelog.',
        },
      );
    } catch (error) {
      console.warn('[Database] feedback seed skipped:', (error as Error).message);
    }
  }
}
