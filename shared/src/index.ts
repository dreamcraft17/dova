export type Role = 'customer' | 'supplier' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type SupplierStatus = 'pending' | 'approved' | 'rejected';
export type FulfillmentType = 'pickup' | 'delivery';

export interface User { id: string; email: string; fullName: string; phoneNumber?: string; role: Role; isActive: boolean; emailVerifiedAt?: string; createdAt: string; }
export interface Category { id: string; name: string; }
export interface Product { id: string; supplierId: string; supplierName: string; name: string; description: string; price: number; stockQuantity: number; categoryId: string; categoryName: string; imageUrl?: string; isActive: boolean; }
export type DeliverySlot = 'morning' | 'evening';
export interface CartItem { id: string; product: Product; quantity: number; subtotal: number; deliverySlot: DeliverySlot; }
export interface Cart { items: CartItem[]; total: number; }
export interface OrderItem { id: string; product: Product; quantity: number; unitPrice: number; subtotal: number; supplierOrderStatus: string; }
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryName: string;
  deliveryAddress: string;
  deliveryPhone: string;
  fulfillmentType?: FulfillmentType;
  paymentReference?: string;
  paymentVerifiedAt?: string;
  items: OrderItem[];
  createdAt: string;
}

export const ROLES: Role[] = ['customer', 'supplier', 'admin'];
export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
/** Minimum basket (NGN) by fulfillment type — stakeholder confirmed amounts. */
export const MIN_ORDER_PICKUP = 3000;
export const MIN_ORDER_DELIVERY = 5000;

export const minOrderFor = (fulfillment: FulfillmentType) =>
  fulfillment === 'pickup' ? MIN_ORDER_PICKUP : MIN_ORDER_DELIVERY;

export const minOrderShortfall = (total: number, fulfillment: FulfillmentType) => {
  const min = minOrderFor(fulfillment);
  return Math.max(0, min - total);
};

export const minOrderMessage = (total: number, fulfillment: FulfillmentType) => {
  const shortfall = minOrderShortfall(total, fulfillment);
  if (shortfall <= 0) return undefined;
  return `Add ₦${shortfall.toLocaleString('en-NG')} more to qualify for checkout.`;
};

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPassword = (password: string) => password.length >= 8;

/** Header cart badge = distinct line items, not total kg/L (BUG-011). */
export const cartBadgeCount = (cart: Cart | null | undefined) => cart?.items.length ?? 0;

export type PasswordToggleIcon = 'eye' | 'eye-off';

/** Password visibility UI contract — visible → Eye, hidden → EyeOff (BUG-010). */
export const passwordToggleState = (visible: boolean) => ({
  inputType: visible ? ('text' as const) : ('password' as const),
  icon: visible ? ('eye' as const) : ('eye-off' as const),
  ariaLabel: visible ? 'Hide password' : 'Show password',
});

/** Built-in DOVA feedback board (MVP — no external FeedLog app). */
export type FeedbackStatus = 'open' | 'planned' | 'in_progress' | 'done';

export interface FeedbackPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  authorName: string;
  authorEmail?: string;
  userId?: string;
  votes: number;
  voterIds: string[];
  commentCount: number;
  createdAt: string;
}

export interface FeedbackComment {
  id: string;
  postId: string;
  body: string;
  authorName: string;
  userId?: string;
  isOfficial: boolean;
  createdAt: string;
}

export interface ChangelogEntry {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  publishedAt: string;
  createdAt: string;
}

export const FEEDBACK_STATUSES: FeedbackStatus[] = ['open', 'planned', 'in_progress', 'done'];

export const feedbackStatusLabel = (status: FeedbackStatus) =>
  ({ open: 'Open', planned: 'Planned', in_progress: 'In progress', done: 'Done' })[status];

export { productImageUrl, PRODUCT_IMAGES, CATEGORY_IMAGES, isBrokenProductImageUrl, shouldRefreshCatalogImage } from './product-images';
export { getProductTab, LOW_STOCK_THRESHOLD } from './product-status';
export type { ProductStatusTab } from './product-status';
export {
  isValidOtpFormat,
  OTP_LENGTH,
  OTP_TTL_MS,
  OTP_MAX_ATTEMPTS,
  OTP_LOCK_MS,
  OTP_MAX_RESEND,
  OTP_RESEND_WINDOW_MS,
  OTP_RESEND_COOLDOWN_MS,
} from './otp';
export {
  productUnit,
  formatPricePerUnit,
  quantityFieldLabel,
  formatStockInUnit,
  formatStockAvailable,
  stockLimitMessage,
  formatQuantityWithUnit,
  type ProductUnit,
} from './product-units';
