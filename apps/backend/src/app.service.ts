import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Cart, Category, Order, Product, Role, SupplierStatus, User, minOrderMessage, FulfillmentType } from 'dova-shared';
import { DatabaseService, StoredUser } from './database.service';
import { RedisService } from './redis.service';
import { NotificationService } from './notification.service';
import { createHash, createHmac, timingSafeEqual } from 'crypto';

type UserRecord = StoredUser;
type Supplier = { id: string; userId: string; businessName: string; phone: string; status: SupplierStatus; documentUrl?: string; };
@Injectable()
export class AppService {
  users: UserRecord[] = []; suppliers: (Supplier & { rejectionReason?: string })[] = []; products: Product[] = []; orders: Order[] = []; carts = new Map<string, Cart>(); payments = new Map<string, { orderId: string; status: string }>(); stockAdjustments: any[] = [];
  contacts: { id: string; name: string; email: string; message: string; status: string; createdAt: string }[] = [];
  revokedTokens = new Set<string>();
  categories: Category[] = ['Vegetables','Fruits','Dairy','Grains','Meat','Seafood','Beverages','Pantry'].map(name => ({ id: randomUUID(), name }));
  constructor(private readonly jwt: JwtService, private readonly database: DatabaseService, private readonly redis: RedisService, @Optional() private readonly notifications?: NotificationService) {
    const admin = this.makeUser('admin@dova.local', 'DOVA Admin', 'admin', 'admin1234');
    this.users.push(admin);
    const supplierUser = this.makeUser('supplier@dova.local', 'Demo Supplier', 'supplier', 'supplier1234'); this.users.push(supplierUser);
    const supplier = { id: randomUUID(), userId: supplierUser.id, businessName: 'Green Valley Farms', phone: '+62000000000', status: 'approved' as SupplierStatus }; this.suppliers.push(supplier);
    const products: Array<[string, number, string]> = [
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
    products.forEach(([name, price, categoryName], index) => {
      const category = this.categories.find((item) => item.name === categoryName);
      if (!category) throw new Error(`Missing category: ${categoryName}`);
      this.products.push({ id: randomUUID(), supplierId: supplier.id, supplierName: supplier.businessName, name, description: 'Freshly sourced quality produce for your business.', price, stockQuantity: 20 + (index % 5) * 10, categoryId: category.id, categoryName: category.name, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', isActive: true });
    });
  }
  private makeUser(email: string, fullName: string, role: Role, password: string): UserRecord { return { id: randomUUID(), email, fullName, role, isActive: true, createdAt: new Date().toISOString(), passwordHash: bcrypt.hashSync(password, 12) }; }
  publicUser(u: UserRecord): User { const { passwordHash, ...user } = u; return user; }
  async findUser(emailOrId: string, byId = false) { const local = byId ? this.users.find(x => x.id === emailOrId) : this.users.find(x => x.email === emailOrId.toLowerCase()); if (!this.database.enabled) return local; return (byId ? await this.database.findUserById(emailOrId) : await this.database.findUserByEmail(emailOrId)) ?? local; }
  async register(body: any) { const { fullName, email, password, confirmPassword } = body; if (!fullName || !email || !/^\S+@\S+\.\S+$/.test(email) || !password || password !== confirmPassword || password.length < 8) throw new BadRequestException('Invalid registration data'); if (await this.findUser(email)) throw new BadRequestException('Email already registered'); const u = this.makeUser(email.toLowerCase(), fullName, 'customer', password); this.users.push(u); await this.database.insertUser(u); return this.publicUser(u); }
  private sessionKey(token: string) { return `dova:session:${createHash('sha256').update(token).digest('hex')}`; }
  private async cacheSession(userId: string, accessToken: string, refreshToken: string) { await this.redis.set(this.sessionKey(accessToken), userId, 900); await this.redis.set(this.sessionKey(refreshToken), userId, 604800); }
  async login(email: string, password: string) { const u = await this.findUser(email); if (!u || !bcrypt.compareSync(password, u.passwordHash) || !u.isActive) throw new UnauthorizedException('Invalid credentials'); const result = this.tokensFor(u); await this.database.saveSession(u.id, result.accessToken, new Date(Date.now() + 15 * 60 * 1000)); await this.database.saveSession(u.id, result.refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); await this.cacheSession(u.id, result.accessToken, result.refreshToken); return result; }
  tokensFor(u: UserRecord) { return { user: this.publicUser(u), accessToken: this.jwt.sign({ sub: u.id, email: u.email, role: u.role }), refreshToken: this.jwt.sign({ sub: u.id, type: 'refresh' }, { expiresIn: '7d' }) }; }
  async refresh(refreshToken?: string) { if (!refreshToken || this.revokedTokens.has(refreshToken)) throw new UnauthorizedException('Invalid refresh token'); try { const payload = this.jwt.verify<{sub:string;type?:string}>(refreshToken); if (payload.type !== 'refresh' || !(await this.database.hasSession(payload.sub, refreshToken)) || (this.redis.enabled && (await this.redis.get(this.sessionKey(refreshToken))) !== payload.sub)) throw new UnauthorizedException('Invalid refresh token'); const u = await this.findUser(payload.sub, true); if (!u) throw new UnauthorizedException('Invalid refresh token'); const result = this.tokensFor(u); await this.database.saveSession(u.id, result.accessToken, new Date(Date.now() + 15 * 60 * 1000)); await this.database.saveSession(u.id, result.refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); await this.cacheSession(u.id, result.accessToken, result.refreshToken); return result; } catch { throw new UnauthorizedException('Invalid refresh token'); } }
  async revoke(token?: string, refreshToken?: string) { if (token) this.revokedTokens.add(token); if (refreshToken) this.revokedTokens.add(refreshToken); await this.database.revokeSession(token); await this.database.revokeSession(refreshToken); if (token) await this.redis.del(this.sessionKey(token)); if (refreshToken) await this.redis.del(this.sessionKey(refreshToken)); }
  async userFromToken(token?: string): Promise<UserRecord> { if (!token || this.revokedTokens.has(token)) throw new UnauthorizedException(); try { const payload = this.jwt.verify<{sub:string}>(token); const u = await this.findUser(payload.sub, true); if (!u || !(await this.database.hasSession(u.id, token)) || (this.redis.enabled && (await this.redis.get(this.sessionKey(token))) !== u.id)) throw new UnauthorizedException(); return u; } catch { throw new UnauthorizedException(); } }
  requireRole(u: UserRecord, roles: Role[]) { if (!roles.includes(u.role)) throw new ForbiddenException(); }
  async listCategories() { return (await this.database.categories()) ?? this.categories; }
  async databaseOrders(userId: string) { return this.database.listOrders(userId); }
  async databaseOrder(userId: string, orderId: string) { return this.database.findOrder(userId, orderId); }
  async listProducts(search = '', categoryId = '', page = 1, limit = 20) { const stored = await this.database.listProducts(search, categoryId, page, limit); if (stored) return stored; const all = this.products.filter(p => p.isActive && p.stockQuantity > 0 && (!search || p.name.toLowerCase().includes(search.toLowerCase())) && (!categoryId || p.categoryId === categoryId)); const start = (page - 1) * limit; return { data: all.slice(start, start + limit), pagination: { page, limit, total: all.length } }; }
  async product(id: string) { const stored = await this.database.findProduct(id); const p = stored ?? this.products.find(x => x.id === id && x.isActive && x.stockQuantity > 0); if (!p) throw new NotFoundException('Product not found'); return p; }
  private cartKey(userId: string) { return `dova:cart:${userId}`; }
  async cart(userId: string): Promise<Cart> { const stored = await this.database.getCart(userId); if (stored) { this.carts.set(userId, stored); return stored; } const existing = this.carts.get(userId); if (existing) return existing; if (this.redis.enabled) { const cached = await this.redis.get(this.cartKey(userId)); if (cached) { const cart = JSON.parse(cached) as Cart; this.carts.set(userId, cart); return cart; } } return { items: [], total: 0 }; }
  private async saveCart(userId: string, cart: Cart) { this.carts.set(userId, cart); await this.database.saveCart(userId, cart); if (this.redis.enabled) await this.redis.set(this.cartKey(userId), JSON.stringify(cart), 604800); return cart; }
  async addCart(userId: string, productId: string, quantity: number, deliverySlot: 'morning' | 'evening') { const p = await this.product(productId); const cart = await this.cart(userId); const existing = cart.items.find(i => i.product.id === productId); const newQty = (existing?.quantity || 0) + quantity; if (!Number.isFinite(quantity) || quantity < 1 || newQty > p.stockQuantity) throw new BadRequestException('Quantity exceeds available stock'); if (existing) { existing.quantity = newQty; existing.deliverySlot = deliverySlot; } else cart.items.push({ id: randomUUID(), product: p, quantity, subtotal: 0, deliverySlot }); this.recalculate(cart); return this.saveCart(userId, cart); }
  recalculate(cart: Cart) { cart.items.forEach(i => i.subtotal = i.quantity * i.product.price); cart.total = cart.items.reduce((sum, i) => sum + i.subtotal, 0); }
  async updateCart(userId: string, itemId: string, quantity?: number, deliverySlot?: 'morning' | 'evening') { const cart = await this.cart(userId); const item = cart.items.find(i => i.id === itemId); if (!item) throw new NotFoundException('Cart item not found'); if (quantity !== undefined) { if (quantity < 1 || quantity > item.product.stockQuantity) throw new BadRequestException('Invalid quantity'); item.quantity = quantity; } if (deliverySlot !== undefined) { item.deliverySlot = deliverySlot; } this.recalculate(cart); return this.saveCart(userId, cart); }
  async removeCart(userId: string, itemId: string) { const cart = await this.cart(userId); cart.items = cart.items.filter(i => i.id !== itemId); this.recalculate(cart); return this.saveCart(userId, cart); }
  async createOrder(userId: string, body: any) {
    if (this.database.enabled) {
      try {
        const stored = await this.database.createOrderFromCart(userId, body);
        if (stored) {
          await this.database.recordPurchaseStock(stored.id);
          return stored;
        }
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException(error instanceof Error ? error.message : 'Unable to create order');
      }
    }
    const cart = await this.cart(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');
    const fulfillmentType: FulfillmentType = body.fulfillmentType === 'pickup' ? 'pickup' : 'delivery';
    if (!body.deliveryName || !body.deliveryPhone) throw new BadRequestException('Delivery details are required');
    if (fulfillmentType === 'delivery' && (!body.deliveryAddress || String(body.deliveryAddress).length < 5)) {
      throw new BadRequestException('Delivery address is required');
    }
    const shortfallMsg = minOrderMessage(cart.total, fulfillmentType);
    if (shortfallMsg) throw new BadRequestException(shortfallMsg);
    const deliveryAddress =
      fulfillmentType === 'pickup' ? body.deliveryAddress || 'Pickup at DOVA hub' : body.deliveryAddress;
    cart.items.forEach((i) => {
      const p = this.products.find((item) => item.id === i.product.id);
      if (p) {
        p.stockQuantity -= i.quantity;
        this.stockAdjustments.unshift({
          id: randomUUID(),
          orderId: undefined,
          productId: p.id,
          supplierId: p.supplierId,
          quantity: -i.quantity,
          reason: 'purchase',
          stockAfter: p.stockQuantity,
          createdAt: new Date().toISOString(),
        });
      }
    });
    const order: Order = {
      id: randomUUID(),
      orderNumber: `DOVA-${Date.now().toString(36).toUpperCase()}`,
      customerId: userId,
      status: 'pending',
      totalAmount: cart.total,
      deliveryName: body.deliveryName,
      deliveryAddress,
      deliveryPhone: body.deliveryPhone,
      fulfillmentType,
      items: cart.items.map((i) => ({
        id: i.id,
        product: i.product,
        quantity: i.quantity,
        unitPrice: i.product.price,
        subtotal: i.subtotal,
        supplierOrderStatus: 'pending',
      })),
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(order);
    this.stockAdjustments
      .filter(
        (entry) =>
          entry.reason === 'purchase' &&
          !entry.orderId &&
          order.items.some((item) => item.product.id === entry.productId),
      )
      .forEach((entry) => {
        entry.orderId = order.id;
      });
    await this.saveCart(userId, { items: [], total: 0 });
    return order;
  }

  async submitContact(body: { name: string; email: string; message: string }) {
    if (!body.name || !body.email || !body.message || !/^\S+@\S+\.\S+$/.test(body.email)) {
      throw new BadRequestException('All fields are required');
    }
    const stored = await this.database.insertContactSubmission(body);
    const entry = stored ?? {
      id: randomUUID(),
      status: 'received',
      createdAt: new Date().toISOString(),
    };
    if (!stored) {
      this.contacts.unshift({
        id: entry.id,
        name: body.name,
        email: body.email,
        message: body.message,
        status: entry.status,
        createdAt: entry.createdAt,
      });
    }
    const emailResult = await this.notifications?.contactMessage(body);
    return {
      message: 'Thank you for contacting us',
      id: entry.id,
      emailNotification: emailResult?.sent ? 'sent' : emailResult?.reason || 'queued',
    };
  }

  async listContacts() {
    return (await this.database.listContactSubmissions()) ?? this.contacts;
  }

  async initializePayment(userId: string, orderId: string, amount?: number) { const order = (await this.database.findOrder(userId, orderId)) ?? this.orders.find(item => item.id === orderId && item.customerId === userId); if (!order) throw new NotFoundException('Order not found'); if (order.status !== 'pending') throw new BadRequestException('Order is not payable'); if (amount !== undefined && Number(amount) !== order.totalAmount) throw new BadRequestException('Payment amount mismatch'); if (order.paymentReference && this.payments.get(order.paymentReference)?.status === 'pending' && !process.env.PAYSTACK_SECRET_KEY) return { authorization_url: `/checkout/verify?reference=${encodeURIComponent(order.paymentReference)}`, reference: order.paymentReference, mode: 'mock' }; const reference = `DOVA-${order.orderNumber}-${randomUUID().slice(0, 8)}`; this.payments.set(reference, { orderId, status: 'pending' }); order.paymentReference = reference; await this.database.setOrderPaymentReference(order.id, reference); await this.database.logPayment(order.id, reference, order.totalAmount, 'initiated'); const secret = process.env.PAYSTACK_SECRET_KEY; if (!secret) return { authorization_url: `/checkout/verify?reference=${encodeURIComponent(reference)}`, reference, mode: 'mock' };
    const customer = await this.findUser(userId, true); return fetch('https://api.paystack.co/transaction/initialize', { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: customer?.email, amount: Math.round(order.totalAmount * 100), currency: process.env.PAYSTACK_CURRENCY || 'NGN', reference, metadata: { orderId } }) }).then(async response => { const result = await response.json() as any; if (!response.ok || !result.status) throw new BadRequestException(result.message || 'Payment initialization failed'); return { authorization_url: result.data.authorization_url, reference: result.data.reference, mode: 'paystack' }; }); }
  async verifyPayment(userId: string, reference: string) { const payment = this.payments.get(reference); const storedOrders = await this.database.listOrders(userId); const order = payment ? ((await this.database.findOrder(userId, payment.orderId)) ?? this.orders.find(item => item.id === payment.orderId && item.customerId === userId)) : ((storedOrders?.find(item => item.paymentReference === reference)) ?? this.orders.find(item => item.paymentReference === reference && item.customerId === userId)); if (!order) throw new NotFoundException('Payment reference not found'); let successful = false; let response: unknown; if (!process.env.PAYSTACK_SECRET_KEY && (payment || order.paymentReference === reference)) successful = true; else if (process.env.PAYSTACK_SECRET_KEY) { const resultResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }); response = await resultResponse.json(); const result = response as any; successful = resultResponse.ok && result.status === true && result.data?.status === 'success'; } if (!successful) { await this.database.logPayment(order.id, reference, order.totalAmount, 'failed', response); throw new BadRequestException('Payment verification failed'); } order.status = 'paid'; order.paymentVerifiedAt = new Date().toISOString(); await this.database.markOrderPaid(order.id, reference); await this.database.logPayment(order.id, reference, order.totalAmount, 'success', response); if (payment) payment.status = 'success'; return { orderId: order.id, orderNumber: order.orderNumber, status: order.status }; }
  async handlePaystackWebhook(signature: string | undefined, body: any, rawBody?: Buffer) { const secret = process.env.PAYSTACK_SECRET_KEY; if (!secret) return { received: true, mode: 'mock' }; if (!signature) throw new UnauthorizedException('Missing Paystack signature'); const payload = rawBody?.toString('utf8') ?? JSON.stringify(body); const expected = createHmac('sha512', secret).update(payload).digest('hex'); const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); if (!valid) throw new UnauthorizedException('Invalid Paystack signature'); if (body.event !== 'charge.success') return { received: true }; const reference = body.data?.reference; const payment = this.payments.get(reference); if (payment?.status === 'success') return { received: true, duplicate: true }; const order = payment ? (this.orders.find(item => item.id === payment.orderId) ?? await this.database.findOrderByPaymentReference(reference)) : (this.orders.find(item => item.paymentReference === reference) ?? await this.database.findOrderByPaymentReference(reference)); if (!order) throw new NotFoundException('Order not found'); if (order.status === 'paid') return { received: true, duplicate: true }; return this.verifyPayment(order.customerId, reference); }
  async supplierFor(userId: string) { const stored = await this.database.findSupplierByUser(userId); const s = stored ?? this.suppliers.find(x => x.userId === userId); if (!s || s.status !== 'approved') throw new ForbiddenException('Supplier approval required'); return s; }
  async supplierStatus(userId: string) { const stored = await this.database.findSupplierByUser(userId); const s = stored ?? this.suppliers.find(x => x.userId === userId); if (!s) throw new NotFoundException('Supplier application not found'); return { id: s.id, businessName: s.businessName, status: s.status, rejectionReason: (s as any).rejectionReason, documentUrl: s.documentUrl }; }
  async supplierProducts(userId: string) { const s = await this.supplierFor(userId); return (await this.database.listSupplierProducts(s.id)) ?? this.products.filter(p => p.supplierId === s.id); }
  async addSupplierProduct(userId: string, body: any) { const s = await this.supplierFor(userId); this.validateProduct(body); const stored = await this.database.createSupplierProduct(s.id, body); if (stored) return stored; const category = this.categories.find(c => c.id === body.categoryId); if (!category) throw new BadRequestException('Invalid category'); const product: Product = { id: randomUUID(), supplierId: s.id, supplierName: s.businessName, name: body.name, description: body.description, price: Number(body.price), stockQuantity: Number(body.quantity), categoryId: category.id, categoryName: category.name, imageUrl: body.imageUrl, isActive: true }; this.products.unshift(product); return product; }
  async updateSupplierProduct(userId: string, productId: string, body: any) { const s = await this.supplierFor(userId); this.validateProduct(body); const stored = await this.database.updateSupplierProduct(s.id, productId, body); if (stored) return stored; const product = this.products.find(p => p.id === productId && p.supplierId === s.id && p.isActive); if (!product) throw new NotFoundException('Product not found'); const category = this.categories.find(c => c.id === body.categoryId); if (!category) throw new BadRequestException('Invalid category'); Object.assign(product, { name: body.name, description: body.description, price: Number(body.price), stockQuantity: Number(body.quantity), categoryId: category.id, categoryName: category.name, imageUrl: body.imageUrl }); return product; }
  async removeSupplierProduct(userId: string, productId: string) { const s = await this.supplierFor(userId); await this.database.deleteSupplierProduct(s.id, productId); const product = this.products.find(p => p.id === productId && p.supplierId === s.id); if (!product && !this.database.enabled) throw new NotFoundException('Product not found'); if (product) product.isActive = false; return { message: 'Product removed' }; }
  private validateProduct(body: any) { if (!body.name || !body.description || Number(body.price) < 1000 || !Number.isInteger(Number(body.quantity)) || Number(body.quantity) < 1 || !body.categoryId) throw new BadRequestException('Invalid product data'); }
  async adjustSupplierStock(userId: string, productId: string, quantity: number, reason: 'restock' | 'damage') { const s = await this.supplierFor(userId); const stored = await this.database.adjustStock(s.id, productId, quantity, reason); if (stored !== undefined) return { stockQuantity: stored }; const product = this.products.find(p => p.id === productId && p.supplierId === s.id && p.isActive); if (!product) throw new NotFoundException('Product not found'); const delta = reason === 'damage' ? -quantity : quantity; if (product.stockQuantity + delta < 0) throw new BadRequestException('Insufficient stock'); product.stockQuantity += delta; const entry = { id: randomUUID(), productId, supplierId: s.id, quantity: delta, reason, stockAfter: product.stockQuantity, createdAt: new Date().toISOString() }; this.stockAdjustments.unshift(entry); return { stockQuantity: product.stockQuantity }; }
  async supplierStockHistory(userId: string, productId: string) { const s = await this.supplierFor(userId); return (await this.database.stockHistory(s.id, productId)) ?? this.stockAdjustments.filter(x => x.supplierId === s.id && x.productId === productId); }
  async supplierOrders(userId: string) { const s = await this.supplierFor(userId); const stored = await this.database.supplierOrders(s.id); if (stored) return stored; return this.orders.flatMap(order => order.items.filter(item => item.product.supplierId === s.id).map(item => ({ orderId: order.id, orderNumber: order.orderNumber, customerName: this.users.find(u => u.id === order.customerId)?.fullName || order.deliveryName, deliveryName: order.deliveryName, deliveryAddress: order.deliveryAddress, createdAt: order.createdAt, itemId: item.id, productName: item.product.name, quantity: item.quantity, unitPrice: item.unitPrice, subtotal: item.subtotal, status: item.supplierOrderStatus }))); }
  async updateSupplierOrderStatus(userId: string, itemId: string, status: string) { const s = await this.supplierFor(userId); if (!['processing', 'shipped', 'delivered'].includes(status)) throw new BadRequestException('Invalid status'); const stored = await this.database.updateSupplierOrderStatus(s.id, itemId, status); if (stored !== undefined) { if (!stored) throw new BadRequestException('Invalid status transition'); return { status }; } const order = this.orders.find(o => o.items.some(i => i.id === itemId && i.product.supplierId === s.id)); const item = order?.items.find(i => i.id === itemId); if (!item || !order) throw new NotFoundException('Order item not found'); const next: Record<string, string> = { pending: 'processing', paid: 'processing', processing: 'shipped', shipped: 'delivered' }; if (next[item.supplierOrderStatus] !== status) throw new BadRequestException('Invalid status transition'); item.supplierOrderStatus = status; if (order.items.every(i => i.supplierOrderStatus === status)) order.status = status as Order['status']; return { status } }
  async adminDashboard() { return (await this.database.adminDashboard()) ?? { users: this.users.length, suppliers: this.suppliers.length, products: this.products.length, orders: this.orders.length, pendingSuppliers: this.suppliers.filter(s => s.status === 'pending').length }; }
  async pendingSuppliers() { return (await this.database.pendingSuppliers()) ?? this.suppliers.filter(s => s.status === 'pending').map(s => ({ ...s, email: this.users.find(u => u.id === s.userId)?.email, contactName: this.users.find(u => u.id === s.userId)?.fullName })); }
  async approveSupplier(id: string) { const s = this.suppliers.find(x => x.id === id) ?? await this.database.findSupplierById(id); if (!s) throw new NotFoundException('Supplier not found'); await this.database.setSupplierStatus(s.id, 'approved'); const local = this.suppliers.find(x => x.id === s.id); if (local) local.status = 'approved'; const user = this.users.find(u => u.id === s.userId); if (user) user.isActive = true; await this.notifications?.supplierStatus(user?.email, s.businessName, 'approved'); return { id: s.id, status: 'approved' }; }
  async rejectSupplier(id: string, reason: string) { const s = this.suppliers.find(x => x.id === id) ?? await this.database.findSupplierById(id); if (!s) throw new NotFoundException('Supplier not found'); await this.database.setSupplierStatus(s.id, 'rejected', reason); const local = this.suppliers.find(x => x.id === s.id); if (local) { local.status = 'rejected'; local.rejectionReason = reason; } const user = this.users.find(u => u.id === s.userId); if (user) user.isActive = false; await this.notifications?.supplierStatus(user?.email, s.businessName, 'rejected', reason); return { id: s.id, status: 'rejected', reason }; }
  async adminUsers() { return (await this.database.adminUsers()) ?? this.users.map(u => this.publicUser(u)); }
  async setUserActive(id: string, active: boolean) { await this.database.setUserActive(id, active); const user = this.users.find(u => u.id === id); if (user) user.isActive = active; return { id, isActive: active }; }
  async adminProducts() { return (await this.database.adminProducts()) ?? this.products; }
  async setProductActive(id: string, active: boolean) { await this.database.setProductActive(id, active); const product = this.products.find(p => p.id === id); if (product) product.isActive = active; return { id, isActive: active }; }
  async adminOrders(status = '', search = '') { const stored = await this.database.adminOrders(status, search); if (stored) return stored; return this.orders.filter(order => (!status || order.status === status) && (!search || order.orderNumber.toLowerCase().includes(search.toLowerCase()) || (this.users.find(user => user.id === order.customerId)?.fullName || '').toLowerCase().includes(search.toLowerCase()))); }
  async makeSupplierUser(body: any) { if (!body.businessName || !body.email || !body.password || body.password.length < 8) throw new BadRequestException('Invalid supplier data'); if (await this.findUser(body.email) || this.suppliers.some(s => this.users.find(u => u.id === s.userId)?.email === body.email.toLowerCase())) throw new BadRequestException('Email already registered'); const user = this.makeUser(body.email.toLowerCase(), body.contactName || body.businessName, 'supplier', body.password); this.users.push(user); const supplier = { id: randomUUID(), userId: user.id, businessName: body.businessName, phone: body.phone || '', status: 'pending' as SupplierStatus, documentUrl: body.documentUrl }; this.suppliers.push(supplier); await this.database.insertUser(user); await this.database.insertSupplierProfile(supplier); return { id: supplier.id, status: 'pending', message: "Application submitted. We'll review it shortly.", reference: supplier.id, emailNotification: 'queued' }; }
}
