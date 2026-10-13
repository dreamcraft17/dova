import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import { PageHead, Panel, StatusPill, buttonStyles } from '../../components/supplier/ui';
import { api } from '../../lib/api';

type NotificationPreferences = {
  newOrderAlerts: boolean;
  orderStatusUpdates: boolean;
  productApprovalUpdates: boolean;
  marketingUpdates: boolean;
};

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

  useEffect(() => {
    void api<NotificationPreferences>('/settings/notifications').then(setNotifications).catch((error) => setNotificationError(error instanceof Error ? error.message : 'Unable to load notification settings'));
  }, []);

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
          <SettingRow title="Sessions" body="Review signed-in devices." />
        </Panel>

        <Panel title="Payout Preferences">
          <p className="mb-3.5 text-[11px] text-muted-foreground">
            Keep payout information private and encrypted. Only authorized account services should access it.
          </p>
          <StatusPill tone="gray">Coming soon</StatusPill>
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
