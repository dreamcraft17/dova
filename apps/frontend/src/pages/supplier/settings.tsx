import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import { PageHead, Panel, StatusPill, buttonStyles } from '../../components/supplier/ui';
import { api } from '../../lib/api';
import { getRefreshToken } from '../../lib/auth-session';

type NotificationPreferences = {
  newOrderAlerts: boolean;
  orderStatusUpdates: boolean;
  productApprovalUpdates: boolean;
  marketingUpdates: boolean;
};
type Session = { id: string; createdAt: string; expiresAt: string; current: boolean };
type PayoutPreferences = { configured: boolean; bankName: string; accountName: string; accountNumber: string; payoutMethod: string };

function SettingRow({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs font-bold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{body}</p>
      </div>
      {action ?? <StatusPill tone="gray">Coming soon</StatusPill>}
    </div>
  );
}

function NotificationToggle({ title, body, value, onChange, disabled }: { title: string; body: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs font-bold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{body}</p>
      </div>
      <button type="button" role="switch" aria-checked={value} disabled={disabled} onClick={() => onChange(!value)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? 'bg-[var(--emerald)]' : 'bg-[#dfe7e1]'} disabled:opacity-60`}>
        <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function SettingsContent() {
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  const [savingNotification, setSavingNotification] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionMessage, setSessionMessage] = useState('');
  const [payout, setPayout] = useState<PayoutPreferences | null>(null);
  const [payoutForm, setPayoutForm] = useState({ bankName: '', accountName: '', accountNumber: '' });
  const [payoutMessage, setPayoutMessage] = useState('');
  const [savingPayout, setSavingPayout] = useState(false);

  useEffect(() => {
    void api<NotificationPreferences>('/settings/notifications').then(setNotifications).catch((error) => setNotificationError(error instanceof Error ? error.message : 'Unable to load notification settings'));
    void api<Session[]>('/settings/sessions').then(setSessions).catch(() => undefined);
    void api<PayoutPreferences>('/settings/payout').then((data) => { setPayout(data); setPayoutForm({ bankName: data.bankName, accountName: data.accountName, accountNumber: '' }); }).catch(() => undefined);
  }, []);

  async function revokeSession(id: string) {
    await api(`/settings/sessions/${id}`, { method: 'DELETE' });
    setSessions((current) => current.filter((session) => session.id !== id));
  }

  async function revokeOtherSessions() {
    await api('/settings/sessions/revoke-others', { method: 'POST', body: JSON.stringify({ refreshToken: getRefreshToken() }) });
    setSessions((current) => current.filter((session) => session.current));
    setSessionMessage('Other sessions have been signed out.');
  }

  async function savePayout(event: FormEvent) {
    event.preventDefault();
    setSavingPayout(true); setPayoutMessage('');
    try {
      const data = await api<PayoutPreferences>('/settings/payout', { method: 'PATCH', body: JSON.stringify(payoutForm) });
      setPayout(data); setPayoutForm({ bankName: data.bankName, accountName: data.accountName, accountNumber: '' }); setPayoutMessage('Payout preferences saved securely.');
    } catch (error) { setPayoutMessage(error instanceof Error ? error.message : 'Unable to save payout preferences.'); }
    finally { setSavingPayout(false); }
  }

  async function toggleNotification(key: keyof NotificationPreferences, value: boolean) {
    if (!notifications) return;
    setSavingNotification(key);
    setNotificationError('');
    const previous = notifications;
    setNotifications({ ...notifications, [key]: value });
    try {
      const updated = await api<NotificationPreferences>('/settings/notifications', { method: 'PATCH', body: JSON.stringify({ [key]: value }) });
      setNotifications(updated);
    } catch (error) {
      setNotifications(previous);
      setNotificationError(error instanceof Error ? error.message : 'Unable to save notification settings');
    } finally {
      setSavingNotification(null);
    }
  }

  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Account Settings"
        title="Settings"
        lead="Manage notifications, security, payout preferences and supplier account controls."
      />

      <div className="grid gap-3.5 md:grid-cols-2">
        <Panel title="Notifications">
          {notifications ? <>
            <NotificationToggle title="New order alerts" body="Receive notifications when a customer places an order." value={notifications.newOrderAlerts} onChange={(value) => void toggleNotification('newOrderAlerts', value)} disabled={savingNotification !== null} />
            <NotificationToggle title="Order status updates" body="Receive updates about fulfillment and order changes." value={notifications.orderStatusUpdates} onChange={(value) => void toggleNotification('orderStatusUpdates', value)} disabled={savingNotification !== null} />
            <NotificationToggle title="Product approval" body="Know when a product is approved or requires changes." value={notifications.productApprovalUpdates} onChange={(value) => void toggleNotification('productApprovalUpdates', value)} disabled={savingNotification !== null} />
            <NotificationToggle title="Marketing updates" body="Optional DOVA announcements." value={notifications.marketingUpdates} onChange={(value) => void toggleNotification('marketingUpdates', value)} disabled={savingNotification !== null} />
          </> : <p className="text-[11px] text-muted-foreground">Loading preferences…</p>}
          {notificationError ? <p className="mt-3 text-[11px] text-destructive">{notificationError}</p> : null}
        </Panel>

        <Panel title="Security">
          <SettingRow
            title="Password"
            body="Change your account password."
            action={
              <Button asChild variant="outline" className={buttonStyles.light}>
                <Link href="/supplier/profile">Change</Link>
              </Button>
            }
          />
          <div className="border-b border-border py-3 last:border-b-0">
            <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-foreground">Sessions</p><p className="text-[10px] text-muted-foreground">Review and revoke signed-in sessions.</p></div><Button type="button" variant="outline" className={buttonStyles.light} onClick={() => void revokeOtherSessions()} disabled={sessions.length < 2}>Sign out others</Button></div>
            <div className="space-y-2">{sessions.length ? sessions.map((session) => <div key={session.id} className="flex items-center justify-between rounded-[10px] bg-[var(--cream)] px-3 py-2"><div><p className="text-[11px] font-bold text-foreground">{session.current ? 'This device' : 'Signed-in device'}</p><p className="text-[10px] text-muted-foreground">Started {new Date(session.createdAt).toLocaleString()}</p></div>{session.current ? <StatusPill tone="green">Current</StatusPill> : <Button type="button" variant="ghost" className="h-7 px-2 text-[10px] font-bold text-destructive" onClick={() => void revokeSession(session.id)}>Revoke</Button>}</div>) : <p className="text-[11px] text-muted-foreground">No additional active sessions.</p>}</div>
            {sessionMessage ? <p className="mt-2 text-[10px] text-[var(--emerald)]">{sessionMessage}</p> : null}
          </div>
        </Panel>

        <Panel title="Payout Preferences">
          <p className="mb-3.5 text-[11px] text-muted-foreground">
            Keep payout information private and encrypted. Only authorized account services should access it.
          </p>
          {payout?.configured ? <p className="mb-3 text-[11px] text-[var(--emerald)]">{payout.bankName} · {payout.accountName} · {payout.accountNumber}</p> : null}
          <form className="space-y-2.5" onSubmit={savePayout}>
            <input required value={payoutForm.bankName} onChange={(event) => setPayoutForm({ ...payoutForm, bankName: event.target.value })} placeholder="Bank name" className="h-10 w-full rounded-[10px] border border-border px-3 text-xs" />
            <input required value={payoutForm.accountName} onChange={(event) => setPayoutForm({ ...payoutForm, accountName: event.target.value })} placeholder="Account name" className="h-10 w-full rounded-[10px] border border-border px-3 text-xs" />
            <input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={payoutForm.accountNumber} onChange={(event) => setPayoutForm({ ...payoutForm, accountNumber: event.target.value.replace(/\D/g, '') })} placeholder={payout?.configured ? 'Enter 10-digit number to replace' : '10-digit account number'} className="h-10 w-full rounded-[10px] border border-border px-3 text-xs" />
            <Button type="submit" variant="outline" className={buttonStyles.light} disabled={savingPayout}>{savingPayout ? 'Saving…' : 'Save payout details'}</Button>
          </form>
          {payoutMessage ? <p className="mt-2 text-[10px] text-[var(--emerald)]">{payoutMessage}</p> : null}
        </Panel>

        <Panel title="Account">
          <SettingRow title="Export my data" body="Download a copy of your supplier account data." />
          <SettingRow title="Request account closure" body="Closure requires secure confirmation by the DOVA team." />
        </Panel>
      </div>
    </div>
  );
}

export default function SupplierSettingsPage() {
  return (
    <SupplierGate title="Settings" subtitle="DOVA Supplier Dashboard">
      <SettingsContent />
    </SupplierGate>
  );
}
