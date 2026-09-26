import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Layout } from '../../../components/Layout';
import { RequireAuth } from '../../../components/RequireAuth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { StatusBadge } from '../../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminBundles } from '../../../hooks/admin/useAdminBundles';

function BundlesContent() {
  const { bundles, categories, loading, error, actionBusy, reload, deactivate, activate } = useAdminBundles();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = useMemo(
    () =>
      bundles
        .filter((b) => categoryFilter === 'all' || b.categoryId === categoryFilter)
        .filter((b) => statusFilter === 'all' || b.status === statusFilter)
        .filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [bundles, categoryFilter, statusFilter, search],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Bundle Catalog</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Bundles</h1>
          <p className="mt-2 max-w-[70ch] text-muted-foreground">
            Curate multi-product packages sold at a bundle price.
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/bundles/new">+ New Bundle</Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Retry
          </button>
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <Input placeholder="Search bundles…" value={search} onChange={(e) => setSearch(e.target.value)} className="md:max-w-xs" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bundle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Savings</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No bundles found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-bold">{b.name}</TableCell>
                  <TableCell>{b.categoryName ?? '—'}</TableCell>
                  <TableCell>₦{b.bundlePrice.toLocaleString('en-NG')}</TableCell>
                  <TableCell>{Math.round(b.computed.savingsPercentage)}%</TableCell>
                  <TableCell>{b.computed.isOutOfStock ? 'Out of stock' : b.computed.availableQuantity}</TableCell>
                  <TableCell>
                    <StatusBadge tone={b.status === 'active' ? 'green' : 'gray'}>{b.status}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/bundles/${b.id}`}>Edit</Link>
                      </Button>
                      {b.status === 'active' ? (
                        <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" disabled={actionBusy} onClick={() => void deactivate(b)}>
                          Deactivate
                        </Button>
                      ) : (
                        <Button size="sm" disabled={actionBusy} onClick={() => void activate(b)}>
                          Activate
                        </Button>
                      )}
                    </div>
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

export default function AdminBundlesPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Bundles" subtitle="Curated product packages">
          <BundlesContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
