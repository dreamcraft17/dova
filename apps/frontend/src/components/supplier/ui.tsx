import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../admin/status-badge';
import { getProductTab } from 'dova-shared';
import type { Product } from 'dova-shared';

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const chars = parts.length > 1 ? [parts[0][0], parts[1][0]] : [parts[0]?.[0] ?? '?', parts[0]?.[1] ?? ''];
  return chars.join('').toUpperCase();
}

export const buttonStyles = {
  primary:
    'h-10 rounded-[12px] border-0 bg-gradient-to-br from-[var(--emerald)] to-[var(--bright)] px-4 text-xs font-extrabold text-white shadow-[0_10px_24px_rgba(8,127,91,0.18)] hover:opacity-90',
  light:
    'h-10 rounded-[12px] border border-border bg-white px-4 text-xs font-extrabold text-[var(--forest)] hover:bg-[var(--cream)]',
  gold: 'h-10 rounded-[12px] border-0 bg-[var(--gold)] px-4 text-xs font-extrabold text-[var(--near)] hover:opacity-90',
  danger:
    'h-10 rounded-[12px] border border-[#f0d2d2] bg-[#fff0f0] px-4 text-xs font-extrabold text-[#a33] hover:bg-[#ffe6e6]',
};

export const fieldStyles = {
  label: 'text-[11px] font-extrabold text-[var(--forest)]',
  control:
    'h-11 rounded-[11px] border-border bg-white px-3 text-xs text-foreground shadow-none focus-visible:border-[var(--emerald)] focus-visible:ring-[3px] focus-visible:ring-[rgba(8,127,91,0.08)]',
};

export function PageHead({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--emerald)] before:h-0.5 before:w-[22px] before:rounded-full before:bg-[var(--gold)] before:content-['']">
          {eyebrow}
        </p>
        <h1 className="mb-2.5 font-[family-name:var(--font-heading)] text-[clamp(28px,4vw,42px)] font-black leading-none tracking-[-0.045em] text-[var(--near)]">
          {title}
        </h1>
        {lead ? <p className="max-w-[650px] text-[13px] leading-relaxed text-muted-foreground">{lead}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function SupplierCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      {children}
    </Card>
  );
}

export function StatCard({
  label,
  value,
  note,
  loading,
}: {
  label: string;
  value: ReactNode;
  note: string;
  loading?: boolean;
}) {
  return (
    <SupplierCard className="p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="my-2 h-7 w-16" />
      ) : (
        <p className="my-1.5 text-[25px] font-black leading-tight text-[var(--forest)]">{value}</p>
      )}
      <p className="text-[10px] text-muted-foreground">{note}</p>
    </SupplierCard>
  );
}

export function Panel({
  title,
  link,
  className,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <SupplierCard className={cn('p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-[var(--near)]">{title}</h2>
        {link ? (
          <Link href={link.href} className="text-[11px] font-extrabold text-[var(--emerald)] hover:underline">
            {link.label} →
          </Link>
        ) : null}
      </div>
      {children}
    </SupplierCard>
  );
}

export function ListRow({
  thumb,
  title,
  subtitle,
  trailing,
}: {
  thumb: string;
  title: ReactNode;
  subtitle: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-[43px] shrink-0 place-items-center rounded-[12px] bg-gradient-to-br from-[#e8efe6] to-[#d8e6dc] text-[10px] font-black text-[var(--forest)]">
          {thumb}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-foreground">{title}</p>
          <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {trailing}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-xs text-muted-foreground">{children}</p>;
}

export function Timeline({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={item.title} className="relative grid grid-cols-[18px_1fr] gap-3 pb-5 last:pb-0">
          {index < items.length - 1 ? <span className="absolute bottom-0 left-[8px] top-5 w-px bg-border" /> : null}
          <span className="relative z-[1] mt-0.5 size-[18px] rounded-full border-[5px] border-white bg-[var(--lime)] shadow-[0_0_0_1px_#cfe07f]" />
          <div>
            <p className="text-[11px] font-bold text-foreground">{item.title}</p>
            <p className="text-[10px] text-muted-foreground">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <StatusBadge tone={tone} className="px-2 py-1 text-[10px] font-black capitalize">
      {children}
    </StatusBadge>
  );
}

export function orderStatusTone(status: string): Tone {
  if (status === 'delivered') return 'green';
  if (status === 'cancelled') return 'red';
  if (status === 'pending') return 'yellow';
  if (status === 'paid' || status === 'processing' || status === 'shipped') return 'blue';
  return 'gray';
}

export function OrderStatusBadge({ status }: { status: string }) {
  return <StatusPill tone={orderStatusTone(status)}>{status === 'delivered' ? 'Completed' : status}</StatusPill>;
}

export function ProductStatusBadge({ product }: { product: Product }) {
  const tab = getProductTab(product);
  if (tab === 'hidden') return <StatusPill tone="gray">Hidden</StatusPill>;
  if (tab === 'low_stock') return <StatusPill tone="yellow">Low Stock</StatusPill>;
  return <StatusPill tone="green">Available</StatusPill>;
}
