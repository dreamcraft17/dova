import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminAuditLogs } from '../../hooks/admin/useAdminAuditLogs';

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'administration', label: 'Administration' },
  { value: 'security', label: 'Security' },
  { value: 'content', label: 'Content' },
];

function statusTone(statusCode: number) {
  if (statusCode >= 500) return 'text-destructive';
  if (statusCode >= 400) return 'text-amber-700';
  return 'text-emerald-700';
}

function AuditContent() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { logs, loading, error, reload } = useAdminAuditLogs(search, category);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Security & Accountability</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Audit Logs</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">A chronological record of administrative actions and authentication events.</p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>Retry</button>
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <Input
            placeholder="Search action, path, actor, or resource"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="md:max-w-md"
          />
          <select
            aria-label="Filter audit category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm md:w-52"
          >
            {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No audit events yet.'}
                </TableCell>
              </TableRow>
            ) : logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="font-bold">{log.action}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{log.method} {log.path}</div>
                </TableCell>
                <TableCell>
                  {log.actorName ? (
                    <div><div className="font-bold">{log.actorName}</div><div className="text-xs text-muted-foreground">{log.actorEmail}</div></div>
                  ) : <span className="text-muted-foreground">Anonymous</span>}
                </TableCell>
                <TableCell className="capitalize">{log.category}</TableCell>
                <TableCell className={`font-bold ${statusTone(log.statusCode)}`}>{log.statusCode}</TableCell>
                <TableCell>{log.resourceId || '—'}</TableCell>
                <TableCell className="whitespace-nowrap">{new Date(log.createdAt).toLocaleString('en-NG')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function AdminAuditPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Audit Logs" subtitle="Administrative & security event history">
          <AuditContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
