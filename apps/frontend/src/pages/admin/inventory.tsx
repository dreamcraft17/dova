import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ComingSoonSection } from '../../components/admin/ComingSoonSection';

export default function AdminInventoryPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Inventory" subtitle="Stock & availability monitoring">
          <ComingSoonSection
            eyebrow="Inventory Control"
            title="Inventory"
            lead="Monitor stock, low-stock alerts, product availability and supplier inventory signals across the marketplace."
            sections={[
              {
                heading: 'Planned metrics',
                items: ['SKUs', 'Low stock', 'Out of stock', 'Stock value'],
              },
              {
                heading: 'Planned views',
                items: [
                  'Stock levels by product and supplier',
                  'Low-stock and out-of-stock alerts',
                  'Restock history and supplier inventory signals',
                ],
              },
            ]}
          />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
