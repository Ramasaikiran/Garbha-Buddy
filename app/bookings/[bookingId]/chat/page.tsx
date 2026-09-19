'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function BookingChatPage({ params }: { params: { bookingId: string } }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/bookings/${params.bookingId}/messages`);
    if (res.status === 401 || res.status === 403) {
      setAuthError(res.status === 401 ? 'Please log in to view this chat.' : 'Not authorized for this booking.');
      return;
    }
    const data = await res.json();
    setMessages(data.messages || []);
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setMyUserId(data.userId || null));
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [params.bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await fetch(`/api/bookings/${params.bookingId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    });
    setText('');
    load();
  }

  if (authError) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: 'var(--paper)' }}
      >
        <p style={{ color: 'var(--ink-60)' }}>
          {authError}{' '}
          <Link href="/login" className="underline" style={{ color: 'var(--gold-deep)' }}>
            Log in
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: 'var(--paper)' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Coordinate tickets
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-6 py-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm"
            style={
              m.sender_id === myUserId
                ? { marginLeft: 'auto', background: 'var(--ink)', color: 'var(--paper)' }
                : { background: 'var(--surface)', border: '1px solid var(--line)' }
            }
          >
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 p-6" style={{ borderTop: '1px solid var(--line)' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Sort out who's bringing tickets…"
          className="field-input flex-1"
        />
        <button className="btn-primary !px-5">Send</button>
      </form>
    </main>
  );
}
