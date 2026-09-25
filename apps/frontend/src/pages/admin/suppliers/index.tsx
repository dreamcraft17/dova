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
import { useAdminSuppliers } from '../../../hooks/admin/useAdminSuppliers';
import type { SupplierStatus } from 'dova-shared';

const STATUS_TONE: Record<SupplierStatus, 'green' | 'yellow' | 'red'> = {
  approved: 'green',
  pending: 'yellow',
  rejected: 'red',
};

const STATUS_LABEL: Record<SupplierStatus, string> = {
  approved: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected',
};

function SuppliersContent() {
  const { suppliers, loading, error, reload } = useAdminSuppliers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupplierStatus>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.businessName.toLowerCase().includes(q) ||
        s.contactName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    });
  }, [suppliers, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: suppliers.length,
      pending: suppliers.filter((s) => s.status === 'pending').length,
      approved: suppliers.filter((s) => s.status === 'approved').length,
      rejected: suppliers.filter((s) => s.status === 'rejected').length,
    }),
    [suppliers],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Supplier Network</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Suppliers</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">
          Review supplier registrations, verification status, and product activity.
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
          { label: 'All Suppliers', value: counts.all, note: 'Registered' },
          { label: 'Pending', value: counts.pending, note: 'Verification queue' },
          { label: 'Verified', value: counts.approved, note: 'Approved suppliers' },
          { label: 'Rejected', value: counts.rejected, note: 'Needs follow-up' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-3xl font-black text-primary">{loading ? '—' : stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search supplier, contact, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-xs"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No suppliers found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-bold">{s.businessName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.contactName} · {s.email}
                    </p>
                  </TableCell>
                  <TableCell>{s.location ?? '—'}</TableCell>
                  <TableCell>{s.productsCount ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</StatusBadge>
                  </TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString('en-NG')}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/suppliers/${s.id}`}>Open</Link>
                    </Button>
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

export default function AdminSuppliersPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Suppliers" subtitle="Supplier network management">
          <SuppliersContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
