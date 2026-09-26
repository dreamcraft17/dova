import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import { PageHead, Panel, StatusPill, buttonStyles } from '../../components/supplier/ui';

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

function SettingsContent() {
  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Account Settings"
        title="Settings"
        lead="Manage notifications, security, payout preferences and supplier account controls."
      />

      <div className="grid gap-3.5 md:grid-cols-2">
        <Panel title="Notifications">
          <SettingRow title="New order alerts" body="Receive notifications when a customer places an order." />
          <SettingRow title="Order status updates" body="Receive updates about fulfillment and order changes." />
          <SettingRow title="Product approval" body="Know when a product is approved or requires changes." />
          <SettingRow title="Marketing updates" body="Optional DOVA announcements." />
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
