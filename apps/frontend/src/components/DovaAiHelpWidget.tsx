import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import type { ChatMessage } from 'dova-shared';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';

type HelpMessage = ChatMessage & { local?: boolean };

const WELCOME: HelpMessage = {
  id: 'dova-ai-welcome',
  role: 'assistant',
  text: 'Hi! I can help you find products, understand delivery, or answer general farming questions.',
  createdAt: new Date(0).toISOString(),
};

const QUICK_HELP = [
  { label: 'What can I buy?', answer: 'DOVA lists curated agricultural food products. Open Products to browse what is currently available: /marketplace.' },
  { label: 'How does delivery work?', answer: 'Choose pickup or delivery during checkout. After ordering, customers can track status in Orders: /customer/history.' },
  { label: 'Ask about farming', answer: 'I can give general farming guidance. For crop or plant-health advice, share clear details and treat the response as an initial suggestion—not a diagnosis.' },
];
const PROGRAMMING_REFUSAL = 'I can only help with DOVA products, bundles, orders, delivery, and general farming questions. I cannot help with coding or programming questions.';
const PROGRAMMING_PATTERNS = /\b(coding|codingan|programming|pemrograman|source code|javascript|typescript|python|java|c\+\+|html|css|sql|api endpoint|function|syntax|debugging|algorithm)\b/i;

const GUEST_HELP_RULES = [
  { pattern: /product|produk|buy|beli|marketplace|catalog|katalog/i, answer: 'DOVA lists curated agricultural food products. Browse the live catalog on Products: /marketplace.' },
  { pattern: /bundle|paket/i, answer: 'You can find active product bundles on Bundles: /bundles. Each bundle shows its contents, price, and availability.' },
  { pattern: /delivery|deliver|pickup|pick up|antar|kirim/i, answer: 'Customers choose pickup or delivery during checkout. After ordering, status is available in Orders: /customer/history.' },
  { pattern: /checkout|payment|bayar|cart|keranjang/i, answer: 'Add products or bundles to Cart, then continue to Checkout to choose fulfillment and complete payment: /cart.' },
  { pattern: /order|pesanan|history|riwayat/i, answer: 'Log in to view your order history and status on Orders: /customer/history.' },
  { pattern: /farmer|supplier|petani|daftar.*jual|sell/i, answer: 'Farmers and suppliers can apply through the supplier registration page: /auth/supplier-register.' },
  { pattern: /contact|support|kontak|bantuan/i, answer: 'For questions that need the DOVA team, use Contact Us: /contact.' },
  { pattern: /about|dova chain|what is dova|tentang/i, answer: 'DOVA Chain connects farmers, food products, and customers through a technology-enabled agricultural marketplace. Learn more on About: /about.' },
];

export function DovaAiHelpWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<HelpMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const history = await api<{ messages: ChatMessage[] }>('/chat/history');
        if (!cancelled && history.messages.length) setMessages([WELCOME, ...history.messages]);
      } catch {
        // The widget remains usable with the welcome message if history is unavailable.
      }
    })();
    return () => { cancelled = true; };
  }, [open, user]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function addLocalHelp(label: string, answer: string) {
    setMessages((current) => [
      ...current,
      { id: `guest-question-${Date.now()}`, role: 'user', text: label, createdAt: new Date().toISOString(), local: true },
      { id: `guest-answer-${Date.now() + 1}`, role: 'assistant', text: answer, createdAt: new Date().toISOString(), local: true },
    ]);
  }

  function guestAnswer(text: string) {
    return GUEST_HELP_RULES.find((rule) => rule.pattern.test(text))?.answer
      || 'I can help with DOVA Products, Bundles, Cart, Checkout, Orders, delivery, farmer registration, Contact, and general farming. Try asking about one of those topics, or log in for full chat.';
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    if (!user) {
      if (PROGRAMMING_PATTERNS.test(text)) {
        addLocalHelp(text, PROGRAMMING_REFUSAL);
        return;
      }
      addLocalHelp(text, guestAnswer(text));
      return;
    }

    setMessages((current) => [...current, { id: `local-${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() }]);
    setLoading(true);
    try {
      const result = await api<{ messages: ChatMessage[] }>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setMessages((current) => [...current, ...result.messages]);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not reach DOVA AI.';
      showToast(message, 'error');
      setMessages((current) => [...current, { id: `error-${Date.now()}`, role: 'assistant', text: `⚠️ ${message}`, createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="dova-ai-widget" role="dialog" aria-label="DOVA AI help">
      <div className="dova-ai-widget__header">
        <span className="dova-ai-widget__icon" aria-hidden="true"><Sparkles size={17} /></span>
        <div><strong>DOVA AI Help</strong><small>{user ? 'Ask about DOVA or farming' : 'Quick help for visitors'}</small></div>
        <button type="button" className="dova-ai-widget__close" onClick={onClose} aria-label="Close DOVA AI help"><X size={18} /></button>
      </div>

      <div className="dova-ai-widget__messages" ref={listRef}>
        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble-row chat-bubble-row--${message.role}`}>
            <div className={`chat-bubble chat-bubble--${message.role}`}>
              {message.text.split('\n').map((line, index) => <p key={index}>{line}</p>)}
            </div>
          </div>
        ))}
        {loading ? <div className="dova-ai-widget__typing" aria-label="DOVA AI is typing"><span /><span /><span /></div> : null}
      </div>

      {!user ? (
        <div className="dova-ai-widget__quick-help">
          {QUICK_HELP.map((item) => <button type="button" key={item.label} onClick={() => addLocalHelp(item.label, item.answer)}>{item.label}</button>)}
          <a href="/auth/login">Log in for full chat</a>
        </div>
      ) : null}

      <form className="dova-ai-widget__composer" onSubmit={submit}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={user ? 'Ask DOVA AI…' : 'Ask a quick help question…'} disabled={loading} maxLength={2000} aria-label="Message DOVA AI" />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Send message"><Send size={16} /></button>
      </form>
    </div>
  );
}

export function DovaAiHelpTrigger({ onClick }: { onClick: () => void }) {
  return <button type="button" className="dova-ai-help-trigger" onClick={onClick}><MessageCircle size={17} aria-hidden="true" /> Explore DOVA AI</button>;
}
