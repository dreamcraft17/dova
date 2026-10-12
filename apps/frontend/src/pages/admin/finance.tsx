import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, CircleDollarSign, RefreshCw, WalletCards } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminFinance } from '../../hooks/admin/useAdminFinance';

function formatNaira(value: number | null | undefined) { return value == null ? 'Not tracked' : `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function tone(status: string): 'green' | 'yellow' | 'blue' | 'red' | 'gray' {
  if (['success', 'paid', 'delivered'].includes(status)) return 'green';
  if (['pending', 'processing', 'shipped'].includes(status)) return 'yellow';
  if (['failed', 'abandoned', 'reversed', 'cancelled'].includes(status)) return 'red';
  return 'gray';
}

function FinanceContent() {
  const { finance, loading, error, reload } = useAdminFinance();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const entries = useMemo(() => (finance?.ledger ?? []).filter((entry) => {
    const query = search.trim().toLowerCase();
    return (status === 'all' || entry.status === status) && (!query || `${entry.orderNumber} ${entry.customerName} ${entry.paymentReference ?? ''}`.toLowerCase().includes(query));
  }), [finance?.ledger, search, status]);
  const stats = finance?.summary;
  const cards = [
    { label: 'Gross sales · 30d', value: formatNaira(stats?.grossSales), icon: CircleDollarSign, tone: 'text-[#08744f]' },
    { label: 'Collected', value: formatNaira(stats?.collectedSales), icon: ArrowDownLeft, tone: 'text-[#205b9b]' },
    { label: 'Pending settlements', value: stats?.pendingSettlements ?? '—', icon: ArrowUpRight, tone: 'text-[#876b00]' },
    { label: 'Payment exceptions', value: finance?.exceptions.length ?? '—', icon: AlertTriangle, tone: 'text-[#9b3027]' },
  ];
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Financial Control</p><h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Finance &amp; Payouts</h1><p className="mt-2 max-w-[70ch] text-muted-foreground">Reconcile customer payments and see settlement exceptions before money moves out.</p></div><Button type="button" variant="outline" className="h-10 rounded-[12px] px-4 text-[13px] font-black" onClick={() => void reload()} disabled={loading}><RefreshCw className={loading ? 'animate-spin' : undefined} /> {loading ? 'Refreshing…' : 'Refresh ledger'}</Button></div>
    {error ? <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error} <button type="button" className="font-bold underline" onClick={() => void reload()}>Retry</button></Card> : null}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone: iconTone }) => <Card key={label} className="p-5"><div className="flex items-center justify-between"><p className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground">{label}</p><Icon className={`size-5 ${iconTone}`} /></div><p className="mt-2 text-2xl font-black text-primary">{loading ? '—' : value}</p></Card>)}</div>
    <Card className="border-[#d4af37]/30 bg-[#fffaf0] p-5"><div className="flex items-start gap-3"><WalletCards className="mt-0.5 size-5 shrink-0 text-[#876b00]" /><div><p className="font-black text-[#66551a]">Control boundary</p><p className="mt-1 text-sm leading-6 text-[#66551a]">{finance?.capabilities.note ?? 'Loading finance capabilities…'} Supplier and logistics totals will appear only after their payout ledgers are implemented.</p></div></div></Card>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
      <Card className="overflow-hidden p-0"><div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row md:items-center md:justify-between"><div><h2 className="text-lg font-black text-primary">Payment ledger</h2><p className="text-sm text-muted-foreground">Latest 100 orders and their last payment state.</p></div><div className="flex gap-2"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer…" className="w-full md:w-52" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-input bg-background px-3 text-sm"><option value="all">All status</option><option value="success">Success</option><option value="pending">Pending</option><option value="failed">Failed</option></select></div></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Recorded</TableHead><TableHead /></TableRow></TableHeader><TableBody>{entries.length === 0 ? <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">{loading ? 'Loading ledger…' : 'No payment records match this filter.'}</TableCell></TableRow> : entries.map((entry) => <TableRow key={entry.id}><TableCell className="font-bold">#{entry.orderNumber}</TableCell><TableCell>{entry.customerName}</TableCell><TableCell>{formatNaira(entry.amount)}</TableCell><TableCell><StatusBadge tone={tone(entry.status)}>{entry.status}</StatusBadge></TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(entry.createdAt)}</TableCell><TableCell><Link href={`/admin/orders/${entry.id}`} className="text-xs font-bold text-secondary hover:underline">Open</Link></TableCell></TableRow>)}</TableBody></Table></div></Card>
      <Card className="p-5"><div className="mb-4"><h2 className="text-lg font-black text-primary">Exceptions</h2><p className="text-sm text-muted-foreground">Failed or stalled payment events needing review.</p></div><div className="space-y-3">{finance?.exceptions.length ? finance.exceptions.map((item) => <div key={item.id} className="rounded-xl border border-border p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-primary">#{item.orderNumber}</p><p className="text-xs text-muted-foreground">{item.customerName}</p></div><StatusBadge tone={tone(item.status)}>{item.status}</StatusBadge></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p><p className="mt-2 text-xs font-bold text-primary">{item.amount == null ? '—' : formatNaira(item.amount)} · {formatDate(item.createdAt)}</p></div>) : <p className="py-8 text-center text-sm text-muted-foreground">No payment exceptions found.</p>}</div></Card>
    </div>
  </div>;
}

export default function AdminFinancePage() {
  return <Layout chrome="none"><RequireAuth roles={['admin']}><AdminLayout title="Finance & Payouts" subtitle="Payments, settlements & exceptions"><FinanceContent /></AdminLayout></RequireAuth></Layout>;
}
