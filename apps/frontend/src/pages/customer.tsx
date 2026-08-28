import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Legacy route — canonical order history lives at /customer/history */
export default function Customer() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/customer/history');
  }, [router]);
  return null;
}
