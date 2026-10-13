import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { buttonStyles } from './ui';

export function SupplierFeedbackDialog({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState('Farmer experience');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      await api('/feedback/posts', { method: 'POST', body: JSON.stringify({ title: `${type}: ${feedback.trim().slice(0, 60)}`, description: feedback.trim(), authorName: user?.fullName, authorEmail: user?.email }) });
      setMessage('Thanks — your feedback has been recorded.');
      setFeedback('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send feedback.');
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,35,25,0.5)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="supplier-feedback-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-[22px] border border-border bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--emerald)]">Supplier feedback</p><h2 id="supplier-feedback-title" className="mt-1 text-xl font-black text-[var(--near)]">Tell DOVA what to improve</h2><p className="mt-1 text-xs text-muted-foreground">Send feedback without leaving your supplier dashboard.</p></div>
          <button type="button" aria-label="Close feedback" onClick={onClose} className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground hover:bg-[var(--cream)]"><X className="size-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-xs font-bold text-[var(--forest)]">Feedback type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 h-10 w-full rounded-[10px] border border-border bg-white px-3 text-xs"><option>Farmer experience</option><option>Product</option><option>Orders</option><option>Delivery</option><option>Payments</option><option>Support</option><option>Other</option></select></label>
          <label className="block text-xs font-bold text-[var(--forest)]">Your feedback<textarea required minLength={2} rows={5} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Share an issue, suggestion or idea…" className="mt-1 w-full rounded-[10px] border border-border p-3 text-xs outline-none focus:border-[var(--emerald)]" /></label>
          <div className="flex items-center justify-between gap-3"><p className="text-[10px] text-muted-foreground">Submitted as {user?.fullName ?? 'your supplier account'}.</p><div className="flex gap-2"><Button type="button" variant="outline" className={buttonStyles.light} onClick={onClose}>Cancel</Button><Button type="submit" className={buttonStyles.primary} disabled={busy}>{busy ? 'Sending…' : 'Send feedback'}</Button></div></div>
          {message ? <p className="text-[11px] text-[var(--emerald)]">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
