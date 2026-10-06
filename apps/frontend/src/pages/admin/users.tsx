import { useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminUserDialog } from '../../components/admin/AdminUserDialog';
import { StatusBadge } from '../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers';
import { useAuth } from '../../context/AuthContext';

function UsersContent() {
  const { user: currentUser } = useAuth();
  const { users, loading, error, actionBusy, reload, toggleActive } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Access Control</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Users</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">Manage account access across the platform.</p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Retry
          </button>
        </Card>
      ) : null}

      <Card className="p-5">
        <Input
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 md:max-w-xs"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No users found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold">{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>
                    <StatusBadge tone={u.isActive ? 'green' : 'gray'}>{u.isActive ? 'Active' : 'Inactive'}</StatusBadge>
                  </TableCell>
                  <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-NG') : '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" disabled={actionBusy} onClick={() => setSelectedUserId(u.id)}>
                        Manage
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionBusy || (currentUser?.id === u.id && u.isActive)}
                        onClick={() => void toggleActive(u)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AdminUserDialog
        userId={selectedUserId}
        open={Boolean(selectedUserId)}
        currentUserId={currentUser?.id}
        onClose={() => setSelectedUserId(null)}
        onSaved={() => void reload()}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Users" subtitle="Account access management">
          <UsersContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
