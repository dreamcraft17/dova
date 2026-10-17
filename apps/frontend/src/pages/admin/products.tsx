import { useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminProducts } from '../../hooks/admin/useAdminProducts';
import { getProductTab } from 'dova-shared';

type ProductTab = 'pending_approval' | 'available' | 'low_stock' | 'hidden';

function ProductsContent() {
  const { products, loading, error, actionBusy, reload, toggleActive, bulkSetActive, decide } = useAdminProducts();
  const [tab, setTab] = useState<ProductTab>('pending_approval');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const counts = useMemo(
    () => ({
      pending_approval: products.filter((p) => p.approvalStatus === 'pending').length,
      available: products.filter((p) => p.approvalStatus === 'approved' && getProductTab(p) === 'available').length,
      low_stock: products.filter((p) => p.approvalStatus === 'approved' && getProductTab(p) === 'low_stock').length,
      hidden: products.filter((p) => p.approvalStatus === 'approved' && getProductTab(p) === 'hidden').length,
    }),
    [products],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => (tab === 'pending_approval' ? p.approvalStatus === 'pending' : p.approvalStatus === 'approved' && getProductTab(p) === tab))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q));
  }, [products, tab, search]);

  function rejectProduct(id: string) {
    const reason = window.prompt('Rejection reason');
    if (!reason) return;
    void decide(id, 'reject', reason);
  }

  const visibleIds = visible.map((p) => p.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someSelected = visibleIds.some((id) => selected.has(id));
  const selectedCount = visibleIds.filter((id) => selected.has(id)).length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Catalog Control</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Products</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">
          Activate or deactivate marketplace products across every supplier.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Retry
          </button>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { key: 'pending_approval' as const, label: 'Pending Approval' },
          { key: 'available' as const, label: 'Available' },
          { key: 'low_stock' as const, label: 'Low Stock' },
          { key: 'hidden' as const, label: 'Hidden' },
        ].map((s) => (
          <Card key={s.key} className="p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-3xl font-black text-primary">{loading ? '—' : counts[s.key]}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Tabs value={tab} onValueChange={(v: string) => { setTab(v as ProductTab); setSelected(new Set()); }}>
            <TabsList>
              <TabsTrigger value="pending_approval">Pending Approval ({counts.pending_approval})</TabsTrigger>
              <TabsTrigger value="available">Available ({counts.available})</TabsTrigger>
              <TabsTrigger value="low_stock">Low Stock ({counts.low_stock})</TabsTrigger>
              <TabsTrigger value="hidden">Hidden ({counts.hidden})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            placeholder="Search product or supplier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-xs"
          />
        </div>

        {someSelected && tab !== 'pending_approval' ? (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-accent/20 px-4 py-2.5 text-sm">
            <span className="font-semibold">{selectedCount} selected</span>
            <Button size="sm" disabled={actionBusy} onClick={() => void bulkSetActive(Array.from(selected), true).then(() => setSelected(new Set()))}>
              Activate selected
            </Button>
            <Button size="sm" variant="outline" disabled={actionBusy} onClick={() => void bulkSetActive(Array.from(selected), false).then(() => setSelected(new Set()))}>
              Deactivate selected
            </Button>
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow>
              {tab !== 'pending_approval' ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAllVisible}
                  />
                </TableHead>
              ) : null}
              <TableHead>Product</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No products in this view.'}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((p) => (
                <TableRow key={p.id}>
                  {tab !== 'pending_approval' ? (
                    <TableCell>
                      <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleOne(p.id)} />
                    </TableCell>
                  ) : null}
                  <TableCell className="font-bold">{p.name}</TableCell>
                  <TableCell>{p.supplierName}</TableCell>
                  <TableCell>{p.stockQuantity}</TableCell>
                  <TableCell>
                    {tab === 'pending_approval' ? (
                      <StatusBadge tone="yellow">Pending Approval</StatusBadge>
                    ) : (
                      <StatusBadge tone={p.isActive ? 'green' : 'gray'}>{p.isActive ? 'Active' : 'Hidden'}</StatusBadge>
                    )}
                  </TableCell>
                  <TableCell>
                    {tab === 'pending_approval' ? (
                      <div className="flex gap-2">
                        <Button size="sm" disabled={actionBusy} onClick={() => void decide(p.id, 'approve')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" disabled={actionBusy} onClick={() => rejectProduct(p.id)}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" disabled={actionBusy} onClick={() => void toggleActive(p)}>
                        {p.isActive ? 'Deactivate' : 'Set to Active'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Products" subtitle="Marketplace catalog management">
          <ProductsContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
