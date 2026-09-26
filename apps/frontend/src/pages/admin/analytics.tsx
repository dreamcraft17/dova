import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ComingSoonSection } from '../../components/admin/ComingSoonSection';

export default function AdminAnalyticsPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Analytics" subtitle="Marketplace performance & trends">
          <ComingSoonSection
            eyebrow="Data & Insights"
            title="Analytics"
            lead="Turn marketplace, customer, supplier and fulfillment data into operational visibility. Every metric will be calculated from the backend."
            sections={[
              {
                heading: 'Key dimensions',
                items: ['Orders', 'Sales', 'Average order value', 'Completion rate'],
              },
              {
                heading: 'Planned views',
                items: ['Orders & sales trend over time', 'Breakdown by category, supplier and region'],
              },
            ]}
          />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
