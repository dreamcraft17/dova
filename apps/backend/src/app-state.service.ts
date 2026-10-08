import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Cart, Category, Order, Product, SupplierStatus } from 'dova-shared';
import { StoredUser } from './database.service';
import { NotificationService } from './notification.service';

export type UserRecord = StoredUser;

export type Supplier = {
  id: string;
  userId: string;
  businessName: string;
  phone: string;
  status: SupplierStatus;
  documentUrl?: string;
  rejectionReason?: string;
};

export type PaymentRecord = { orderId: string; status: string; authorization_url?: string };

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
};

/**
 * Shared in-memory fallback state for every domain service (used when the
 * database is not enabled, e.g. local dev without Postgres). This class only
 * holds data — seeding and business logic live in the domain services that
 * were split out of the former AppService god class.
 */
@Injectable()
export class AppStateService {
  /**
   * Held here (not copied into each domain service's constructor) so that
   * reassigning it at runtime — e.g. `(service as any).notifications = mock`
   * in tests — is visible to every service that reads it.
   */
  notifications?: NotificationService;
  users: UserRecord[] = [];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  orders: Order[] = [];
  carts = new Map<string, Cart>();
  payments = new Map<string, PaymentRecord>();
  stockAdjustments: any[] = [];
  contacts: ContactSubmission[] = [];
  revokedTokens = new Set<string>(); // in-memory dev only (!database.enabled)
  categories: Category[] = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Beverages', 'Pantry'].map(
    (name) => ({ id: randomUUID(), name }),
  );
}
