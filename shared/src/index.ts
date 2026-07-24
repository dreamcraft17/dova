export type Role = 'customer' | 'supplier' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type SupplierStatus = 'pending' | 'approved' | 'rejected';
export type FulfillmentType = 'pickup' | 'delivery';

export interface User { id: string; email: string; fullName: string; phoneNumber?: string; role: Role; isActive: boolean; createdAt: string; }
export interface Category { id: string; name: string; }
export interface Product { id: string; supplierId: string; supplierName: string; name: string; description: string; price: number; stockQuantity: number; categoryId: string; categoryName: string; imageUrl?: string; isActive: boolean; }
export interface CartItem { id: string; product: Product; quantity: number; subtotal: number; }
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
