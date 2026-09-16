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
    <main className="flex min-h-screen flex-col bg-[#1a0b2e] text-white">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#ffb703]">
          COORDINATE TICKETS
        </p>
        <input
          value={senderId}
          onChange={(e) => setSenderId(e.target.value)}
          placeholder="Your user ID (from registration)"
          className="mt-1 w-full max-w-xs rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-xs"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
              m.sender_id === senderId
                ? 'ml-auto bg-[#ffb703] text-[#1a0b2e]'
                : 'bg-white/10 text-white'
            }`}
          >
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Sort out who's bringing tickets…"
          className="flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
        />
        <button className="rounded-xl bg-[#ffb703] px-4 py-2 text-sm font-semibold text-[#1a0b2e]">
          Send
        </button>
      </form>
    </main>
  );
}
