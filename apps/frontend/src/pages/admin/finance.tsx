import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ComingSoonSection } from '../../components/admin/ComingSoonSection';

export default function AdminFinancePage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Finance & Payouts" subtitle="Payments, settlements & exceptions">
          <ComingSoonSection
            eyebrow="Financial Control"
            title="Finance & Payouts"
            lead="Monitor customer payments, supplier settlements, logistics payouts, refunds and payment exceptions."
            sections={[
              {
                heading: 'Payment ledger',
                items: ['Gross sales', 'Supplier payouts', 'Logistics payouts', 'Refunds'],
              },
              {
                heading: 'Exceptions',
                items: ['Failed payments', 'Disputed charges', 'Pending settlements'],
              },
            ]}
          />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
