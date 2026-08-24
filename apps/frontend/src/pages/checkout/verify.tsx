import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { api } from '../../lib/api';

type VerifyResponse = {
  orderNumber: string;
  status: 'paid' | 'pending';
  paymentStatus?: string;
  message?: string;
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 15;

export default function Verify() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState<{ orderNumber: string }>();
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!router.isReady || typeof router.query.reference !== 'string') return;

    const reference = router.query.reference;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const verify = async () => {
      try {
        const result = await api<VerifyResponse>(
          `/payments/verify?reference=${encodeURIComponent(reference)}`,
        );

        if (cancelled) return;

        if (result.status === 'paid') {
          setOrder({ orderNumber: result.orderNumber });
          setStatus('success');
          setMessage('Payment successful.');
          return;
        }

        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
          setStatus('error');
          setMessage(result.message || 'Payment is still pending. Check your orders shortly.');
          return;
        }

        setStatus('pending');
        setMessage(result.message || 'Waiting for payment confirmation…');
        timer = setTimeout(verify, POLL_INTERVAL_MS);
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setMessage(e instanceof Error ? e.message : 'Payment verification failed');
      }
    };

    attemptsRef.current = 0;
    setStatus('loading');
    setMessage('');
    setOrder(undefined);
    void verify();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [router.isReady, router.query.reference]);

  return (
    <Layout>
      <section className="form-page">
        <p className="eyebrow">PAYMENT</p>
        {status === 'loading' || status === 'pending' ? (
          <Loading
            label={status === 'pending' ? message || 'Waiting for payment confirmation…' : 'Verifying payment…'}
            block
          />
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
