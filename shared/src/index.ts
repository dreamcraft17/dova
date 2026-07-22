export type Role = 'customer' | 'supplier' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type SupplierStatus = 'pending' | 'approved' | 'rejected';

export interface User { id: string; email: string; fullName: string; phoneNumber?: string; role: Role; isActive: boolean; createdAt: string; }
export interface Category { id: string; name: string; }
export interface Product { id: string; supplierId: string; supplierName: string; name: string; description: string; price: number; stockQuantity: number; categoryId: string; categoryName: string; imageUrl?: string; isActive: boolean; }
export interface CartItem { id: string; product: Product; quantity: number; subtotal: number; }
export interface Cart { items: CartItem[]; total: number; }
export interface OrderItem { id: string; product: Product; quantity: number; unitPrice: number; subtotal: number; supplierOrderStatus: string; }
export interface Order { id: string; orderNumber: string; customerId: string; status: OrderStatus; totalAmount: number; deliveryName: string; deliveryAddress: string; deliveryPhone: string; paymentReference?: string; paymentVerifiedAt?: string; items: OrderItem[]; createdAt: string; }

export const ROLES: Role[] = ['customer', 'supplier', 'admin'];
export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPassword = (password: string) => password.length >= 8;
