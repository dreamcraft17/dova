import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { api } from '../../lib/api';

export default function Verify() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState<{ orderNumber: string }>();

  useEffect(() => {
    if (!router.isReady || typeof router.query.reference !== 'string') return;
    api<{ orderNumber: string }>(
      `/payments/verify?reference=${encodeURIComponent(router.query.reference)}`,
    )
      .then((r) => {
        setOrder(r);
        setStatus('success');
        setMessage('Payment successful.');
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e.message);
      });
  }, [router.isReady, router.query.reference]);

  return (
    <Layout>
      <section className="form-page">
        <p className="eyebrow">PAYMENT</p>
        {status === 'loading' ? (
          <Loading label="Verifying payment…" block />
        ) : (
          <>
            <h1>{message}</h1>
            {order ? (
              <>
                <p>
                  Your order number is <strong>{order.orderNumber}</strong>.
                </p>
                <Link className="button" href="/customer">
                  View my orders
                </Link>
              </>
            ) : null}
          </>
        )}
      </section>
    </Layout>
  );
}
