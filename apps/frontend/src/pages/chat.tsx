import { FormEvent, useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { RequireAuth } from '../components/RequireAuth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import type { ChatMessage } from 'dova-shared';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Hello! I'm the DOVA AI assistant. Ask me about products, orders, delivery, or farming advice.",
  createdAt: new Date(0).toISOString(),
};

function ChatPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const history = await api<{ conversationId: string | null; messages: ChatMessage[] }>('/chat/history');
        if (!cancelled && history.messages.length) {
          setMessages([WELCOME, ...history.messages]);
        }
      } catch {
        // No prior conversation yet, or the assistant isn't configured — keep the welcome message.
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);
    try {
      const result = await api<{ conversationId: string; messages: ChatMessage[] }>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      if (result.messages.length) {
        setMessages((prev) => [...prev, ...result.messages]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `timeout-${Date.now()}`,
            role: 'assistant',
            text: "I'm taking longer than usual to respond. Please try again in a moment.",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not reach the AI assistant.';
      showToast(message, 'error');
      setMessages((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, role: 'assistant', text: `⚠️ ${message}`, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="chat-page">
      <div className="chat-card">
        <header className="chat-header">
          <span className="chat-header-icon" aria-hidden="true">
            <Sparkles size={18} />
          </span>
          <div>
            <h1>DOVA AI Assistant</h1>
            <p>Ask about products, orders, delivery, or farming advice.</p>
          </div>
        </header>

        <div className="chat-messages" ref={listRef}>
          {loadingHistory ? (
            <Loading label="Loading your conversation…" block size="sm" />
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`chat-bubble-row chat-bubble-row--${message.role}`}>
                <div className={`chat-bubble chat-bubble--${message.role}`}>
                  {message.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))
          )}
          {sending ? (
            <div className="chat-bubble-row chat-bubble-row--assistant">
              <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}
        </div>

        <form className="chat-composer" onSubmit={submit}>
          <input
            type="text"
            placeholder={`Message the assistant${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            maxLength={2000}
          />
          <button type="submit" disabled={sending || !input.trim()} aria-label="Send message">
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}

export default function Chat() {
  return (
    <Layout>
      <RequireAuth>
        <ChatPage />
      </RequireAuth>
    </Layout>
  );
}
