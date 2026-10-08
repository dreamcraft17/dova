import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import {
  EmptyState,
  PageHead,
  ProductStatusBadge,
  SupplierCard,
  buttonStyles,
  fieldStyles,
  formatNaira,
} from '../../components/supplier/ui';
import { useSupplierProducts } from '../../hooks/supplier/useSupplierProducts';
import { getProductTab } from 'dova-shared';

type StatusFilter = 'all' | 'available' | 'low_stock' | 'hidden';

const miniButton = 'h-7 rounded-[8px] px-2.5 text-[10px] font-extrabold';

function ProductsContent() {
  const router = useRouter();
  const { products, loading, error, actionBusy, remove, activate, adjustStock } = useSupplierProducts();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (status === 'all' || getProductTab(p) === status) &&
        (!term || p.name.toLowerCase().includes(term) || p.categoryName.toLowerCase().includes(term)),
    );
  }, [products, search, status]);

  async function handleRemove(id: string) {
    if (
      !window.confirm(
        'Remove this product? It will only be hidden from customers — it stays in your own product list under "Hidden", where you can reactivate it anytime.',
      )
    )
      return;
    await remove(id);
  }

  async function handleStock(id: string, reason: 'restock' | 'damage') {
    const quantity = Number(window.prompt(`${reason === 'restock' ? 'Restock' : 'Remove'} quantity`, '1'));
    if (!quantity) return;
    await adjustStock(id, quantity, reason);
  }

  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Your Catalog"
        title="My Products"
        lead="View, manage and monitor every product you have listed on DOVA Chain."
        actions={
          <Button asChild className={buttonStyles.primary}>
            <Link href="/supplier/add-product">＋ Add Product</Link>
          </Button>
        }
      />

      {error ? (
        <SupplierCard className="border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">{error}</SupplierCard>
      ) : null}

      <SupplierCard className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search your products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${fieldStyles.control} flex-1`}
          />
          <Select value={status} onValueChange={(v: string) => setStatus(v as StatusFilter)}>
            <SelectTrigger className={`${fieldStyles.control} sm:w-44`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="low_stock">Low stock</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SupplierCard>

      {loading ? (
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[1/1.2] rounded-[20px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <SupplierCard>
          <EmptyState>{products.length === 0 ? 'No products yet. Add your first product.' : 'No products match your filters.'}</EmptyState>
        </SupplierCard>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <SupplierCard key={product.id}>
              <div className="relative grid aspect-[1/0.82] place-items-center bg-gradient-to-br from-[#edf3ec] to-[#dae6dc]">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="absolute inset-0 size-full object-cover" />
                ) : (
                  <span className="grid size-[55%] place-items-center rounded-[18px] bg-gradient-to-br from-[var(--forest)] to-[var(--emerald)] px-2 text-center text-[10px] font-extrabold text-white">
                    Product Image
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <p className="text-[9px] font-black uppercase tracking-wide text-[var(--emerald)]">{product.categoryName}</p>
                <h3 className="mt-1 truncate text-[13px] font-bold text-[var(--near)]">{product.name}</h3>
                <p className="text-[10px] text-muted-foreground">Stock: {product.stockQuantity}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <strong className="text-xs font-black text-[var(--forest)]">{formatNaira(product.price)}</strong>
                  <ProductStatusBadge product={product} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.isActive ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className={`${buttonStyles.light} ${miniButton}`}
                        disabled={actionBusy}
                        onClick={() => void router.push(`/supplier/add-product?id=${product.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`${buttonStyles.light} ${miniButton}`}
                        disabled={actionBusy}
                        onClick={() => void handleStock(product.id, 'restock')}
                      >
                        + Stock
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`${buttonStyles.light} ${miniButton}`}
                        disabled={actionBusy}
                        onClick={() => void handleStock(product.id, 'damage')}
                      >
                        − Stock
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`${buttonStyles.danger} ${miniButton}`}
                        disabled={actionBusy}
                        onClick={() => void handleRemove(product.id)}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      className={`${buttonStyles.primary} ${miniButton}`}
                      disabled={actionBusy}
                      onClick={() => void activate(product.id)}
                    >
                      Set to Active
                    </Button>
                  )}
                </div>
              </div>
            </SupplierCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SupplierProductsPage() {
  return (
    <SupplierGate title="Products" subtitle="DOVA Supplier Dashboard">
      <ProductsContent />
    </SupplierGate>
  );
}
