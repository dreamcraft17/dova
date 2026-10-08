import type { ReactNode } from 'react';
import { Layout } from '../Layout';
import { RequireAuth } from '../RequireAuth';
import { Loading } from '../Loading';
import { useSupplierInfo } from '../../hooks/supplier/useSupplierInfo';
import { SupplierLayout } from './SupplierLayout';

function SupplierGateInner({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { info, loading, error } = useSupplierInfo();

  if (loading) {
    return <Loading label="Loading supplier dashboard…" block />;
  }

  if (error) {
    return (
      <section className="form-page">
        <p className="error">{error}</p>
      </section>
    );
  }

  if (info && info.status !== 'approved') {
    return (
      <section className="form-page">
        <p className="eyebrow">Supplier application</p>
        <h1>{info.status === 'pending' ? 'Application under review' : 'Application not approved'}</h1>
        <p>
          {info.status === 'pending'
            ? 'Your supplier account is waiting for admin approval.'
            : info.rejectionReason || 'Please contact DOVA support for more information.'}
        </p>
      </section>
    );
  }

  return (
    <SupplierLayout title={title} subtitle={subtitle} supplierInfo={info}>
      {children}
    </SupplierLayout>
  );
}

export function SupplierGate({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['supplier']}>
        <SupplierGateInner title={title} subtitle={subtitle}>
          {children}
        </SupplierGateInner>
      </RequireAuth>
    </Layout>
  );
}
