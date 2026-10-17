export type Role = 'customer' | 'supplier' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type SupplierStatus = 'pending' | 'approved' | 'rejected';
export type FulfillmentType = 'pickup' | 'delivery';

export interface User { id: string; email: string; fullName: string; phoneNumber?: string; whatsappNumber?: string; role: Role; isActive: boolean; emailVerifiedAt?: string; createdAt: string; }
export interface Category { id: string; name: string; }
export interface Product { id: string; supplierId: string; supplierName: string; name: string; description: string; price: number; stockQuantity: number; categoryId: string; categoryName: string; imageUrl?: string; imageUrls?: string[]; unitLabel?: string; isActive: boolean; approvalStatus: SupplierStatus; rejectionReason?: string; }

export const MAX_PRODUCT_IMAGES = 6;

export interface Promotion {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export type DeliverySlot = 'morning' | 'evening';
/** bundleId/bundleContents are set only for a bundle cart line — `product` is still always populated
 * (a synthesized bundle-as-product view: id/name/price/stock of the bundle itself) so existing code
 * that reads `item.product.*` keeps working unchanged for both products and bundles. */
export interface BundleCartContent { productId: string; productName: string; quantity: number; }
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  subtotal: number;
  deliverySlot: DeliverySlot;
  bundleId?: string;
  bundleContents?: BundleCartContent[];
}
export interface Cart { items: CartItem[]; total: number; }
/** bundleId/bundleName/bundleQuantity are set only when this order item is one component of a
 * bundle purchase — `product`/`supplierOrderStatus` stay real per-product fields so supplier
 * fulfillment (adjustStock, order status transitions) is unaffected by bundle purchases. */
export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  supplierOrderStatus: string;
  bundleId?: string;
  bundleName?: string;
  bundleQuantity?: number;
}
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryName: string;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
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

export type DeliveryZone = 'yenagoa' | 'outside_yenagoa';

export const DELIVERY_ZONES: { value: DeliveryZone; label: string }[] = [
  { value: 'yenagoa', label: 'Within Yenagoa' },
  { value: 'outside_yenagoa', label: 'Outside Yenagoa' },
];

/** Delivery fee (NGN) by zone — ops-confirmed pricing, Mbiama hub as reference point. */
export const DELIVERY_FEE_BY_ZONE: Record<DeliveryZone, number> = {
  yenagoa: 1200,
  outside_yenagoa: 1600,
};

export const deliveryFeeFor = (fulfillment: FulfillmentType, zone?: DeliveryZone) =>
  fulfillment === 'pickup' ? 0 : DELIVERY_FEE_BY_ZONE[zone ?? 'outside_yenagoa'];

/** Paystack NGN local-card pricing: 1.5% + ₦100, flat fee waived at/under ₦2,500, fee capped at ₦2,000.
 * DOVA's Paystack account is configured so the customer bears this fee, so the amount charged on the
 * Paystack page is higher than the order total — this estimates that so checkout can disclose it upfront. */
export const estimatePaystackFee = (amount: number): number => {
  if (amount <= 0) return 0;
  const flatFee = amount > 2500 ? 100 : 0;
  const grossed = (amount + flatFee) / (1 - 0.015);
  return Math.min(Math.round((grossed - amount) * 100) / 100, 2000);
};

export const estimatePaystackChargeTotal = (amount: number): number =>
  Math.round((amount + estimatePaystackFee(amount)) * 100) / 100;

export const minOrderFor = (fulfillment: FulfillmentType) =>
  fulfillment === 'pickup' ? MIN_ORDER_PICKUP : MIN_ORDER_DELIVERY;

export const minOrderShortfall = (total: number, fulfillment: FulfillmentType) => {
  const min = minOrderFor(fulfillment);
  return Math.max(0, min - total);
};

export const minOrderMessage = (total: number, fulfillment: FulfillmentType) => {
  const shortfall = minOrderShortfall(total, fulfillment);
  if (shortfall <= 0) return undefined;
  return `Add ₦${shortfall.toLocaleString('en-NG')} more to reach the minimum order value for this fulfillment option.`;
};

export const NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
  'Zamfara', 'FCT',
];

/** States DOVA currently delivers/sells to. Starting with Bayelsa only; add more here as coverage expands. */
export const ALLOWED_DELIVERY_STATES = ['Bayelsa'];

export const isAllowedDeliveryState = (state: string) =>
  ALLOWED_DELIVERY_STATES.some((allowed) => allowed.toLowerCase() === state.trim().toLowerCase());

export const deliveryStateRestrictionMessage = () =>
  `We currently only deliver within ${ALLOWED_DELIVERY_STATES.join(', ')} State${ALLOWED_DELIVERY_STATES.length > 1 ? 's' : ''}. More states coming soon!`;

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

/** DOVA AI assistant, backed by a Botpress bot via the Botpress Chat API. */
export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
  createdAt: string;
}

/** Admin-curated product bundles (Bundle Feature, see DOVA_Bundle_*.md). */
export type BundleStatus = 'active' | 'inactive';

export interface Bundle {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  bundlePrice: number;
  isFeatured: boolean;
  status: BundleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BundleContent { id: string; bundleId: string; productId: string; quantity: number; position: number; }
export interface BundleContentWithProduct extends BundleContent { product: Product; }

export interface BundleComputed {
  individualTotal: number;
  savingsAmount: number;
  savingsPercentage: number;
  availableQuantity: number;
  isOutOfStock: boolean;
}

export type BundleSummary = Bundle & { computed: BundleComputed };
export type BundleDetail = Bundle & { contents: BundleContentWithProduct[]; computed: BundleComputed };
export interface BundleListResponse { data: BundleSummary[]; pagination: { page: number; limit: number; total: number }; }

/** floor(stock / quantity-per-bundle), min across components. Inactive or out-of-stock
 * components make the whole bundle unavailable (FR-005). */
export function computeBundleAvailability(
  contents: Array<{ quantity: number; product: Pick<Product, 'stockQuantity' | 'isActive'> }>,
): { availableQuantity: number; isOutOfStock: boolean } {
  if (!contents.length) return { availableQuantity: 0, isOutOfStock: true };
  let min = Infinity;
  for (const content of contents) {
    if (!content.product.isActive || content.product.stockQuantity <= 0) {
      return { availableQuantity: 0, isOutOfStock: true };
    }
    const units = Math.floor(content.product.stockQuantity / content.quantity);
    if (units < min) min = units;
  }
  const availableQuantity = Number.isFinite(min) ? min : 0;
  return { availableQuantity, isOutOfStock: availableQuantity <= 0 };
}

export function computeBundlePricing(
  bundlePrice: number,
  contents: Array<{ quantity: number; product: Pick<Product, 'price'> }>,
): { individualTotal: number; savingsAmount: number; savingsPercentage: number } {
  const individualTotal = contents.reduce((sum, content) => sum + content.product.price * content.quantity, 0);
  const savingsAmount = Math.max(0, Number((individualTotal - bundlePrice).toFixed(2)));
  const savingsPercentage = individualTotal > 0 ? Number(((savingsAmount / individualTotal) * 100).toFixed(2)) : 0;
  return { individualTotal: Number(individualTotal.toFixed(2)), savingsAmount, savingsPercentage };
}

/** Allocates the bundle's selling price across its component products, proportional to each
 * component's share of the individual (non-bundle) price — so per-product order_items subtotals
 * sum exactly to bundlePrice*bundleQuantity while still crediting each supplier fairly. The last
 * component absorbs the rounding remainder so the sum reconciles exactly. */
export function allocateBundlePrice(
  bundlePrice: number,
  bundleQuantity: number,
  contents: Array<{ productId: string; quantity: number; product: Pick<Product, 'price'> }>,
): Array<{ productId: string; totalQuantity: number; unitPrice: number; subtotal: number }> {
  const perUnitIndividualTotal = contents.reduce((sum, content) => sum + content.product.price * content.quantity, 0);
  const totalCharge = Number((bundlePrice * bundleQuantity).toFixed(2));
  let allocated = 0;
  return contents.map((content, index) => {
    const totalQuantity = Number((content.quantity * bundleQuantity).toFixed(2));
    const share =
      perUnitIndividualTotal > 0 ? (content.product.price * content.quantity) / perUnitIndividualTotal : 1 / contents.length;
    let subtotal = Number((totalCharge * share).toFixed(2));
    if (index === contents.length - 1) subtotal = Number((totalCharge - allocated).toFixed(2));
    allocated = Number((allocated + subtotal).toFixed(2));
    const unitPrice = totalQuantity > 0 ? Number((subtotal / totalQuantity).toFixed(2)) : 0;
    return { productId: content.productId, totalQuantity, unitPrice, subtotal };
  });
}

export { productImageUrl, publicCatalogImageUrl, PRODUCT_IMAGES, CATEGORY_IMAGES, isBrokenProductImageUrl, shouldRefreshCatalogImage } from './product-images';
export { SEED_PRODUCT_CATALOG, SEED_CATALOG_SIZE, type SeedCatalogItem } from './seed-catalog';
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
  productUnitLabel,
  formatPricePerUnit,
  formatPricePerUnitLabel,
  quantityFieldLabel,
  formatStockInUnit,
  formatStockAvailable,
  formatStockAvailableLabel,
  stockLimitMessage,
  formatQuantityWithUnit,
  type ProductUnit,
} from './product-units';
