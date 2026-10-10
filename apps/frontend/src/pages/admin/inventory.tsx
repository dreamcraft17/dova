import { useMemo, useState } from 'react';
import { AlertTriangle, Boxes, Package, RefreshCw, Search } from 'lucide-react';
import type { Product } from 'dova-shared';
import { LOW_STOCK_THRESHOLD } from 'dova-shared';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminProducts } from '../../hooks/admin/useAdminProducts';

type InventoryTab = 'all' | 'low_stock' | 'out_of_stock' | 'hidden';

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

function stockState(product: Product): InventoryTab {
  if (!product.isActive) return 'hidden';
  if (product.stockQuantity === 0) return 'out_of_stock';
  if (product.stockQuantity < LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'all';
}

function InventoryContent() {
  const { products, loading, error, reload } = useAdminProducts();
  const [tab, setTab] = useState<InventoryTab>('all');
  const [search, setSearch] = useState('');

  const metrics = useMemo(() => {
    const active = products.filter((product) => product.isActive);
    return {
      skus: active.length,
      units: active.reduce((sum, product) => sum + product.stockQuantity, 0),
      lowStock: active.filter((product) => product.stockQuantity > 0 && product.stockQuantity < LOW_STOCK_THRESHOLD).length,
      outOfStock: active.filter((product) => product.stockQuantity === 0).length,
      stockValue: active.reduce((sum, product) => sum + product.price * product.stockQuantity, 0),
    };
  }, [products]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products
      .filter((product) => tab === 'all' || stockState(product) === tab)
      .filter((product) => !query || product.name.toLowerCase().includes(query) || product.supplierName.toLowerCase().includes(query) || product.categoryName.toLowerCase().includes(query))
      .sort((a, b) => a.stockQuantity - b.stockQuantity);
  }, [products, search, tab]);

  function badge(product: Product) {
    if (!product.isActive) return <StatusBadge tone="gray">Hidden</StatusBadge>;
    if (product.stockQuantity === 0) return <StatusBadge tone="red">Out of stock</StatusBadge>;
    if (product.stockQuantity < LOW_STOCK_THRESHOLD) return <StatusBadge tone="yellow">Low stock</StatusBadge>;
    return <StatusBadge tone="green">Healthy</StatusBadge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Inventory Control</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Inventory</h1>
          <p className="mt-2 max-w-[70ch] text-muted-foreground">Keep an eye on stock levels, low-stock products, and the value of inventory across the marketplace.</p>
        </div>
        <Button variant="outline" onClick={() => void reload()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh inventory
        </Button>
      </div>

      {error ? <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}{' '}<button type="button" className="underline" onClick={() => void reload()}>Retry</button></Card> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Active SKUs', value: metrics.skus, icon: Package },
          { label: 'Units in stock', value: metrics.units, icon: Boxes },
          { label: 'Low stock', value: metrics.lowStock, icon: AlertTriangle },
          { label: 'Out of stock', value: metrics.outOfStock, icon: AlertTriangle },
          { label: 'Stock value', value: money.format(metrics.stockValue), icon: Package },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5"><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">{label}</p><Icon className="size-4 text-secondary" /></div><p className="mt-2 text-2xl font-black text-primary">{loading ? '—' : value}</p></Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(value) => setTab(value as InventoryTab)}><TabsList className="flex-wrap"><TabsTrigger value="all">All ({products.length})</TabsTrigger><TabsTrigger value="low_stock">Low stock ({metrics.lowStock})</TabsTrigger><TabsTrigger value="out_of_stock">Out of stock ({metrics.outOfStock})</TabsTrigger><TabsTrigger value="hidden">Hidden ({products.filter((product) => !product.isActive).length})</TabsTrigger></TabsList></Tabs>
          <div className="relative w-full lg:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search product, supplier or category" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        </div>

        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Supplier</TableHead><TableHead>Category</TableHead><TableHead>Units</TableHead><TableHead>Stock value</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
          {visible.length === 0 ? <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">{loading ? 'Loading inventory…' : 'No inventory matches this view.'}</TableCell></TableRow> : visible.map((product) => <TableRow key={product.id}><TableCell className="font-bold">{product.name}</TableCell><TableCell>{product.supplierName}</TableCell><TableCell>{product.categoryName}</TableCell><TableCell className="font-semibold">{product.stockQuantity}</TableCell><TableCell>{money.format(product.price * product.stockQuantity)}</TableCell><TableCell>{badge(product)}</TableCell></TableRow>)}
        </TableBody></Table></div>
      </Card>
    </div>
  );
}

export default function AdminInventoryPage() {
  return <Layout chrome="none"><RequireAuth roles={['admin']}><AdminLayout title="Inventory" subtitle="Stock & availability monitoring"><InventoryContent /></AdminLayout></RequireAuth></Layout>;
}
