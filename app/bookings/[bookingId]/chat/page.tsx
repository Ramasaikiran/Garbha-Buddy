'use client';

import { useEffect, useRef, useState } from 'react';

export default function BookingChatPage({ params }: { params: { bookingId: string } }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [senderId, setSenderId] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/bookings/${params.bookingId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [params.bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !senderId) return;
    await fetch(`/api/bookings/${params.bookingId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, body: text }),
    });
    setText('');
    load();
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: 'var(--paper)' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Coordinate tickets
        </p>
        <input
          value={senderId}
          onChange={(e) => setSenderId(e.target.value)}
          placeholder="Your user ID (from registration)"
          className="field-input mt-2 max-w-xs !py-1.5 !text-xs"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-6 py-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm"
            style={
              m.sender_id === senderId
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
