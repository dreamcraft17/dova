import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Promotion } from 'dova-shared';

const SESSION_KEY = 'dova_promo_dismissed';
const AUTO_CLOSE_MS = 5000;

export function PromoModal() {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (typeof window === 'undefined' || sessionStorage.getItem(SESSION_KEY)) return;
    let cancelled = false;
    api<Promotion | null>('/promotions/active')
      .then((data) => {
        if (!cancelled && data?.imageUrl) {
          setPromo(data);
          sessionStorage.setItem(SESSION_KEY, '1');
        }
      })
      .catch(() => {
        /* a failed promo fetch should never block the storefront */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!promo) return;
    setSecondsLeft(5);
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const closeTimer = setTimeout(() => setPromo(null), AUTO_CLOSE_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(closeTimer);
    };
  }, [promo?.id]);

  if (!promo) return null;

  const banner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={promo.imageUrl} alt={promo.title} />
  );

  return (
    <div className="promo-modal-overlay" role="dialog" aria-modal="true" aria-label={promo.title}>
      <div className="promo-modal">
        <button type="button" className="promo-modal-close" aria-label="Close promotion" onClick={() => setPromo(null)}>
          ×
        </button>
        <span className="promo-modal-timer" aria-hidden="true">{secondsLeft}s</span>
        {promo.linkUrl ? (
          <a href={promo.linkUrl} target="_blank" rel="noopener noreferrer" onClick={() => setPromo(null)}>
            {banner}
          </a>
        ) : (
          banner
        )}
      </div>
    </div>
  );
}
