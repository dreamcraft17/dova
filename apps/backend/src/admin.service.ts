import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Role, SupplierStatus } from 'dova-shared';
import { bcryptCost } from './bcrypt-cost';
import { DatabaseService } from './database.service';
import { notifySafely } from './notify-safely.util';
import { AppStateService } from './app-state.service';
import { AuthService } from './auth.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly database: DatabaseService,
    private readonly state: AppStateService,
    private readonly auth: AuthService,
  ) {}

  async adminDashboard() {
    return (
      (await this.database.adminDashboard()) ?? {
        users: this.state.users.length,
        suppliers: this.state.suppliers.length,
        products: this.state.products.length,
        orders: this.state.orders.length,
        pendingSuppliers: this.state.suppliers.filter((s) => s.status === 'pending').length,
      }
    );
  }

  async pendingSuppliers() {
    return (
      (await this.database.pendingSuppliers()) ??
      this.state.suppliers
        .filter((s) => s.status === 'pending')
        .map((s) => ({
          ...s,
          email: this.state.users.find((u) => u.id === s.userId)?.email,
          contactName: this.state.users.find((u) => u.id === s.userId)?.fullName,
        }))
    );
  }

  async approveSupplier(id: string) {
    const s = this.state.suppliers.find((x) => x.id === id) ?? (await this.database.findSupplierById(id));
    if (!s) throw new NotFoundException('Supplier not found');
    await this.database.setSupplierStatus(s.id, 'approved');
    const local = this.state.suppliers.find((x) => x.id === s.id);
    if (local) local.status = 'approved';
    const user = this.state.users.find((u) => u.id === s.userId);
    if (user) user.isActive = true;
    await notifySafely(this.state.notifications?.supplierStatus(user?.email, s.businessName, 'approved'));
    return { id: s.id, status: 'approved' };
  }

  async rejectSupplier(id: string, reason: string) {
    const s = this.state.suppliers.find((x) => x.id === id) ?? (await this.database.findSupplierById(id));
    if (!s) throw new NotFoundException('Supplier not found');
    await this.database.setSupplierStatus(s.id, 'rejected', reason);
    const local = this.state.suppliers.find((x) => x.id === s.id);
    if (local) {
      local.status = 'rejected';
      local.rejectionReason = reason;
    }
    const user = this.state.users.find((u) => u.id === s.userId);
    if (user) user.isActive = false;
    await notifySafely(this.state.notifications?.supplierStatus(user?.email, s.businessName, 'rejected', reason));
    return { id: s.id, status: 'rejected', reason };
  }

  async adminUsers() {
    return (
      (await this.database.adminUsers()) ??
      this.state.users.map((u) => ({
        ...this.auth.publicUser(u),
        emailVerifiedAt: u.emailVerifiedAt,
        createdAt: u.createdAt,
      }))
    );
  }

  async adminUser(id: string) {
    const stored = await this.database.adminUserById(id);
    if (stored) return stored;
    const user = this.state.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    const supplierProfile = this.state.suppliers.find((s) => s.userId === id);
    const orderCount = this.state.orders.filter((order) => order.customerId === id).length;
    const supplierOrderCount = supplierProfile
      ? this.state.orders.reduce(
          (count, order) => count + order.items.filter((item) => item.product.supplierId === supplierProfile.id).length,
          0,
        )
      : 0;
    return {
      ...this.auth.publicUser(user),
      emailVerifiedAt: user.emailVerifiedAt,
      orderCount,
      supplierOrderCount,
      canDelete: true,
      supplier: supplierProfile
        ? { id: supplierProfile.id, businessName: supplierProfile.businessName, status: supplierProfile.status }
        : undefined,
    };
  }

  async updateAdminUser(
    id: string,
    body: { fullName: string; email: string; phoneNumber?: string; role: Role; isActive: boolean },
    actorId: string,
  ) {
    const user = await this.auth.findUser(id, true);
    if (!user) throw new NotFoundException('User not found');
    if (id === actorId) {
      if (body.role !== user.role) throw new BadRequestException('You cannot change your own role');
      if (!body.isActive) throw new BadRequestException('You cannot deactivate your own account');
    }
    const normalizedEmail = body.email.toLowerCase();
    if (normalizedEmail !== user.email) {
      const existing = await this.auth.findUser(normalizedEmail);
      if (existing && existing.id !== id) throw new BadRequestException('Email already registered');
    }
    if (!body.fullName || body.fullName.length < 2 || !['customer', 'supplier', 'admin'].includes(body.role)) {
      throw new BadRequestException('Invalid user data');
    }
    user.fullName = body.fullName;
    user.email = normalizedEmail;
    user.role = body.role;
    user.isActive = Boolean(body.isActive);
    user.phoneNumber = body.phoneNumber?.trim() || undefined;
    await this.database.updateUserProfile(id, {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
    });
    return this.adminUser(id);
  }

  async adminResetPassword(id: string, password: string) {
    if (!password || password.length < 8) throw new BadRequestException('Password must be at least 8 characters');
    const user = await this.auth.findUser(id, true);
    if (!user) throw new NotFoundException('User not found');
    user.passwordHash = bcrypt.hashSync(password, bcryptCost());
    await this.database.updateUserPassword(id, user.passwordHash);
    return { message: 'Password updated successfully' };
  }

  async setUserActive(id: string, active: boolean, actorId?: string) {
    if (actorId && id === actorId && !active) throw new BadRequestException('You cannot deactivate your own account');
    await this.database.setUserActive(id, active);
    const user = this.state.users.find((u) => u.id === id);
    if (user) user.isActive = active;
    return { id, isActive: active };
  }

  private purgeUserFromMemory(userId: string, supplierId?: string) {
    this.state.orders = this.state.orders
      .filter((order) => order.customerId !== userId)
      .map((order) => ({
        ...order,
        items: supplierId ? order.items.filter((item) => item.product.supplierId !== supplierId) : order.items,
      }))
      .filter((order) => order.items.length > 0);
    if (supplierId) {
      this.state.products = this.state.products.filter((product) => product.supplierId !== supplierId);
    }
    this.state.users = this.state.users.filter((entry) => entry.id !== userId);
    this.state.suppliers = this.state.suppliers.filter((entry) => entry.userId !== userId);
    this.state.carts.delete(userId);
  }

  async deleteAdminUser(id: string, actorId: string) {
    if (id === actorId) throw new BadRequestException('You cannot delete your own account');
    const user = await this.auth.findUser(id, true);
    if (!user) throw new NotFoundException('User not found');
    const supplier =
      this.state.suppliers.find((entry) => entry.userId === id) ??
      (this.database.enabled ? await this.database.findSupplierByUser(id) : undefined);
    const result = await this.database.deleteUser(id);
    if (result === 'not_found') throw new NotFoundException('User not found');
    if (result === 'skipped') await this.database.revokeAllUserSessions(id);
    this.purgeUserFromMemory(id, supplier?.id);
    console.info(`[Admin] Deleted user ${user.email} (${id}) by admin ${actorId}`);
    return { message: 'User deleted successfully' };
  }

  async adminProducts() {
    return (await this.database.adminProducts()) ?? this.state.products;
  }

  async setProductActive(id: string, active: boolean) {
    await this.database.setProductActive(id, active);
    const product = this.state.products.find((p) => p.id === id);
    if (product) product.isActive = active;
    return { id, isActive: active };
  }

  async adminOrders(status = '', search = '') {
    const stored = await this.database.adminOrders(status, search);
    if (stored) return stored;
    return this.state.orders.filter(
      (order) =>
        (!status || order.status === status) &&
        (!search ||
          order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          (this.state.users.find((user) => user.id === order.customerId)?.fullName || '')
            .toLowerCase()
            .includes(search.toLowerCase())),
    );
  }

  async makeSupplierUser(body: any) {
    if (!body.businessName || !body.email || !body.password || body.password.length < 8) {
      throw new BadRequestException('Invalid supplier data');
    }
    const normalizedEmail = body.email.toLowerCase();
    if (
      (await this.auth.findUser(normalizedEmail)) ||
      this.state.suppliers.some((s) => this.state.users.find((u) => u.id === s.userId)?.email === normalizedEmail)
    ) {
      throw new BadRequestException('Email already registered');
    }
    const user = this.auth.makeUser(normalizedEmail, body.contactName || body.businessName, 'supplier', body.password);
    this.state.users.push(user);
    const supplier = {
      id: randomUUID(),
      userId: user.id,
      businessName: body.businessName,
      phone: body.phone || '',
      status: 'pending' as SupplierStatus,
      documentUrl: body.documentUrl,
    };
    this.state.suppliers.push(supplier);
    await this.database.insertUser(user);
    await this.database.insertSupplierProfile(supplier);
    return {
      id: supplier.id,
      status: 'pending',
      message: "Application submitted. We'll review it shortly.",
      reference: supplier.id,
      emailNotification: 'queued',
    };
  }
}
