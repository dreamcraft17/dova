import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import { PageHead, Panel, StatusPill, SupplierCard, buttonStyles, formatNaira, initialsOf } from '../../components/supplier/ui';
import { ProfileAccountEditor } from '../../components/ProfileAccountEditor';
import { useAuth } from '../../context/AuthContext';
import { useSupplierInfo } from '../../hooks/supplier/useSupplierInfo';
import { useSupplierProducts } from '../../hooks/supplier/useSupplierProducts';
import { useSupplierOrders } from '../../hooks/supplier/useSupplierOrders';

function verificationPill(status: string) {
  if (status === 'approved') return <StatusPill tone="green">Verified</StatusPill>;
  if (status === 'rejected') return <StatusPill tone="red">Rejected</StatusPill>;
  return <StatusPill tone="yellow">Verification pending</StatusPill>;
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[11px] bg-[var(--cream)] p-2.5">
      <small className="block text-[9px] text-muted-foreground">{label}</small>
      <strong className="block truncate text-xs text-foreground">{children}</strong>
    </div>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const { info } = useSupplierInfo();
  const { products } = useSupplierProducts();
  const { orders } = useSupplierOrders();

  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Supplier Account"
        title="Profile"
        lead="Manage your supplier identity, contact information and account security."
      />

      <div className="grid items-start gap-3.5 lg:grid-cols-[0.8fr_1.4fr]">
        <SupplierCard className="p-6">
          <span className="mb-3.5 grid size-[82px] place-items-center rounded-[24px] bg-gradient-to-br from-[var(--forest)] to-[var(--emerald)] text-[25px] font-black text-white">
            {info?.businessName ? initialsOf(info.businessName) : 'SU'}
          </span>
          <p className="text-[21px] font-black text-[var(--near)]">{info?.businessName ?? '—'}</p>
          <p className="mt-0.5 text-[11px] font-extrabold text-[var(--emerald)]">{user?.fullName ?? 'Supplier'}</p>
          <div className="mt-4 grid gap-2">
            <MetaItem label="Supplier ID">{info?.id ?? '—'}</MetaItem>
            <MetaItem label="Verification status">{info ? verificationPill(info.status) : '—'}</MetaItem>
            <MetaItem label="Member since">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
                : '—'}
            </MetaItem>
            <MetaItem label="Products listed">{products.length}</MetaItem>
            <MetaItem label="Order items received">{orders.length}</MetaItem>
            <MetaItem label="Total order value">{formatNaira(revenue)}</MetaItem>
          </div>
        </SupplierCard>

        {user ? <ProfileAccountEditor user={user} variant="supplier" /> : null}
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        <Panel title="Verification Documents">
          <p className="mb-3.5 text-[11px] text-muted-foreground">
            Documents submitted with your supplier application. Verification status is controlled by the DOVA team.
          </p>
          {info?.rejectionReason ? (
            <p className="mb-3.5 text-[11px] text-destructive">Rejection reason: {info.rejectionReason}</p>
          ) : null}
          {info?.documentUrl ? (
            <Button asChild variant="outline" className={buttonStyles.light}>
              <a href={info.documentUrl} target="_blank" rel="noreferrer">
                View Uploaded Document
              </a>
            </Button>
          ) : (
            <p className="text-[11px] text-muted-foreground">No document on file.</p>
          )}
        </Panel>

        <Panel title="Payout Information">
          <p className="mb-3.5 text-[11px] text-muted-foreground">
            Bank or payout details are stored securely and never exposed publicly. Payout setup isn&apos;t available yet.
          </p>
          <Button asChild variant="outline" className={buttonStyles.light}>
            <Link href="/supplier/settings">Manage Payout Settings</Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}

export default function SupplierProfilePage() {
  return (
    <SupplierGate title="Profile" subtitle="DOVA Supplier Dashboard">
      <ProfileContent />
    </SupplierGate>
  );
}
