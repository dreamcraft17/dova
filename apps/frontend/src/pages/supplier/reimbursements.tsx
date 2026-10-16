import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import { EmptyState, PageHead, Panel, StatusPill, buttonStyles, formatNaira } from '../../components/supplier/ui';
import { api, ApiError } from '../../lib/api';

type ReimbursementHistory = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  transferCode?: string;
  failureReason?: string;
  createdAt: string;
};

type ReimbursementSummary = {
  available: number;
  pending: number;
  paid: number;
  currency: string;
  minWithdrawal: number;
  payoutsEnabled: boolean;
  approvalRequired?: boolean;
  history: ReimbursementHistory[];
};

function statusTone(status: string): 'green' | 'yellow' | 'red' | 'gray' {
  if (status === 'success') return 'green';
  if (status === 'processing' || status === 'pending_transfer' || status === 'pending_approval' || status === 'awaiting_otp') return 'yellow';
  if (status === 'failed') return 'red';
  return 'gray';
}

function ReimbursementsContent() {
  const [summary, setSummary] = useState<ReimbursementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<ReimbursementSummary>('/suppliers/reimbursements');
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load reimbursement data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function withdraw() {
    setWithdrawing(true);
    setMessage('');
    setError('');
    try {
      const result = await api<{ status: string; amount: number; reference: string; message?: string }>(
        '/suppliers/reimbursements/withdraw',
        { method: 'POST' },
      );
      setMessage(
        result.message ??
          (result.status === 'success'
            ? `₦${result.amount.toLocaleString('en-NG')} sent to your bank (ref ${result.reference}).`
            : 'Payout initiated — Paystack is processing the transfer.'),
      );
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Withdrawal failed.');
    } finally {
      setWithdrawing(false);
    }
  }

  const min = summary?.minWithdrawal ?? 1000;
  const canWithdraw = Boolean(summary && summary.available >= min && !withdrawing);

  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Payouts"
        title="Product Reimbursements"
        lead="Earn credit when order lines are delivered. Request a payout; DOVA finance sends to your bank via Paystack."
        actions={
          <Button asChild variant="outline" className={buttonStyles.light}>
            <Link href="/supplier/settings">Payout settings</Link>
          </Button>
        }
      />

      <div className="grid gap-3.5 sm:grid-cols-3">
        <Panel title="Available">
          <p className="text-2xl font-black text-[var(--forest)]">{loading ? '—' : formatNaira(summary?.available ?? 0)}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Minimum withdrawal ₦{min.toLocaleString('en-NG')}</p>
        </Panel>
        <Panel title="Processing">
          <p className="text-2xl font-black">{loading ? '—' : formatNaira(summary?.pending ?? 0)}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Locked while Paystack completes transfer</p>
        </Panel>
        <Panel title="Paid out">
          <p className="text-2xl font-black">{loading ? '—' : formatNaira(summary?.paid ?? 0)}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Lifetime reimbursements for your products</p>
        </Panel>
      </div>

      <Panel title="Request payout">
        <p className="mb-3 text-xs text-muted-foreground">
          {summary?.approvalRequired !== false
            ? 'Submits your full available balance for finance review. You are not charged OTP steps — admin completes Paystack transfer.'
            : summary?.payoutsEnabled
              ? 'Instant test mode: sends Paystack transfer immediately.'
              : 'Paystack is not configured — payouts are simulated for testing.'}
        </p>
        <Button type="button" className={buttonStyles.primary} disabled={!canWithdraw} onClick={() => void withdraw()}>
          {withdrawing ? 'Submitting…' : 'Request payout'}
        </Button>
        {message ? <p className="mt-2 text-xs text-[var(--emerald)]">{message}</p> : null}
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </Panel>

      <Panel title="History">
        {!summary?.history.length ? (
          <EmptyState>{loading ? 'Loading…' : 'No reimbursements yet. Deliver order lines to accrue balance.'}</EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {summary.history.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs">
                <div>
                  <p className="font-bold">{formatNaira(row.amount)}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</p>
                  {row.failureReason ? <p className="text-[10px] text-destructive">{row.failureReason}</p> : null}
                </div>
                <StatusPill tone={statusTone(row.status)}>{row.status.replace(/_/g, ' ')}</StatusPill>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export default function SupplierReimbursementsPage() {
  return (
    <SupplierGate title="Reimbursements" subtitle="DOVA Supplier Dashboard">
      <ReimbursementsContent />
    </SupplierGate>
  );
}
