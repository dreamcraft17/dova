import { AlertTriangle, CheckCircle2, CircleHelp, Clock3, RefreshCw, Server, XCircle } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type HealthStatus, useAdminSystemHealth } from '../../hooks/admin/useAdminSystemHealth';

const STATUS_LABEL: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
  not_configured: 'Not configured',
};

const STATUS_TONE: Record<HealthStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  healthy: 'green',
  degraded: 'yellow',
  down: 'red',
  not_configured: 'gray',
};

function StatusIcon({ status }: { status: HealthStatus }) {
  if (status === 'healthy') return <CheckCircle2 className="size-5 text-[#08744f]" aria-hidden="true" />;
  if (status === 'down') return <XCircle className="size-5 text-[#9b3027]" aria-hidden="true" />;
  if (status === 'degraded') return <AlertTriangle className="size-5 text-[#876b00]" aria-hidden="true" />;
  return <CircleHelp className="size-5 text-[#5f6b65]" aria-hidden="true" />;
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatCheckedAt(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function SystemHealthContent() {
  const { health, loading, error, reload } = useAdminSystemHealth();
  const overallStatus = health?.status ?? 'not_configured';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Platform Reliability</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">System Health</h1>
          <p className="mt-2 max-w-[70ch] text-muted-foreground">
            A live view of the services that keep DOVA online. Checks are read-only and never send test emails or payments.
          </p>
        </div>
        <Button type="button" variant="outline" className="h-10 rounded-[12px] px-4 text-[13px] font-black" onClick={() => void reload()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : undefined} />
          {loading ? 'Checking…' : 'Refresh checks'}
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="font-bold underline" onClick={() => void reload()}>Retry</button>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-r from-[#063b2a] to-[#087f5b] p-5 text-white md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/15">
              <Server className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d5ea72]">Overall status</p>
              <h2 className="mt-1 text-2xl font-black">{loading ? 'Checking services…' : STATUS_LABEL[overallStatus]}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 text-sm md:text-right">
            <div><p className="text-white/60">Environment</p><p className="font-bold">{health?.environment ?? '—'}</p></div>
            <div><p className="text-white/60">Uptime</p><p className="font-bold">{health ? formatUptime(health.uptimeSeconds) : '—'}</p></div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 text-xs text-muted-foreground md:px-6">
          <Clock3 className="size-3.5" aria-hidden="true" />
          Last checked: {health ? formatCheckedAt(health.checkedAt) : '—'}
          {health?.version && health.version !== 'unknown' ? <span>· build {health.version}</span> : null}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading && !health
          ? Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-[138px] rounded-xl" />)
          : health?.checks.map((check) => (
              <Card key={check.key} className="gap-3 p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3"><StatusIcon status={check.status} /><h3 className="text-sm font-black text-primary">{check.label}</h3></div>
                  <StatusBadge tone={STATUS_TONE[check.status]}>{STATUS_LABEL[check.status]}</StatusBadge>
                </div>
                <p className="min-h-10 text-xs leading-5 text-muted-foreground">{check.detail || 'Operational'}</p>
                {check.latencyMs !== undefined ? <p className="text-[11px] font-bold text-secondary">Response: {check.latencyMs}ms</p> : null}
              </Card>
            ))}
      </div>

      <Card className="border-[#d4af37]/30 bg-[#fffaf0] p-5 text-sm text-[#66551a]">
        <p className="font-black">How to read this page</p>
        <p className="mt-1 leading-6">“Not configured” is expected for optional local services. In production, PostgreSQL, email, storage, and Paystack should be configured; DOVA AI is optional.</p>
      </Card>
    </div>
  );
}

export default function AdminMonitoringPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="System Health" subtitle="Service health & reliability"><SystemHealthContent /></AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
