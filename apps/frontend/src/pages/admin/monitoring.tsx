import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ComingSoonSection } from '../../components/admin/ComingSoonSection';

export default function AdminMonitoringPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="System Monitoring" subtitle="Service health & reliability">
          <ComingSoonSection
            eyebrow="Platform Reliability"
            title="System Monitoring"
            lead="Monitor the technical services that keep DOVA online: API, database, authentication, payments, storage, webhooks and background jobs."
            sections={[
              {
                heading: 'Service health',
                items: ['API', 'Database', 'Authentication', 'Payments', 'Storage', 'Webhooks', 'Email', 'Background jobs'],
              },
              {
                heading: 'Alert rules',
                items: ['Uptime and latency thresholds', 'Incident notifications'],
              },
            ]}
          />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
