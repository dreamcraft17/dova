import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ComingSoonSection } from '../../components/admin/ComingSoonSection';

export default function AdminAuditPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Audit Logs" subtitle="Administrative & security event history">
          <ComingSoonSection
            eyebrow="Security & Accountability"
            title="Audit Logs"
            lead="A chronological record of sensitive administrative actions, authentication events, changes and system events."
            sections={[
              {
                heading: 'Event types',
                items: ['Authentication', 'Product', 'Order', 'Supplier', 'Finance'],
              },
              {
                heading: 'Planned fields',
                items: ['Event, actor and resource search', 'Timestamp and actor filtering'],
              },
            ]}
          />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
