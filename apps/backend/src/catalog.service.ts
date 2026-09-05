import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { AppStateService } from './app-state.service';

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly database: DatabaseService,
    private readonly state: AppStateService,
  ) {}

  async listCategories() {
    return (await this.database.categories()) ?? this.state.categories;
  }

  async listProducts(search = '', categoryId = '', page = 1, limit = 50) {
    const stored = await this.database.listProducts(search, categoryId, page, limit);
    if (stored) return stored;
    const all = this.state.products.filter(
      (p) =>
        p.isActive &&
        p.stockQuantity > 0 &&
        (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
        (!categoryId || p.categoryId === categoryId),
    );
    const start = (page - 1) * limit;
    return { data: all.slice(start, start + limit), pagination: { page, limit, total: all.length } };
  }

  async product(id: string) {
    if (!isUuid(id)) throw new NotFoundException('Product not found');
    const stored = await this.database.findProduct(id);
    const p = stored ?? this.state.products.find((x) => x.id === id && x.isActive && x.stockQuantity > 0);
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }
}
