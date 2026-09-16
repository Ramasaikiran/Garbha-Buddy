'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [pending, setPending] = useState<any[]>([]);
  const [unlocked, setUnlocked] = useState(false);

  async function load(s: string) {
    const res = await fetch('/api/admin/companions', { headers: { 'x-admin-secret': s } });
    if (!res.ok) return false;
    const data = await res.json();
    setPending(data.pending);
    return true;
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (await load(secret)) setUnlocked(true);
  }

  async function decide(companionId: string, approve: boolean) {
    await fetch('/api/admin/companions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ companionId, approve }),
    });
    setPending((p) => p.filter((c) => c.id !== companionId));
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1a0b2e] text-white">
        <form onSubmit={unlock} className="space-y-3 text-center">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2"
          />
          <button className="ml-2 rounded-lg bg-[#ffb703] px-4 py-2 font-semibold text-[#1a0b2e]">
            Enter
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0b2e] px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-bold">Pending companions</h1>
        <div className="mt-6 space-y-4">
          {pending.length === 0 && <p className="text-white/50">Nothing to review.</p>}
          {pending.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold">{c.name} — {c.city}</p>
              <p className="text-sm text-white/50">{c.phone_number} · {c.tier}</p>
              <a href={c.video_proof_url} target="_blank" rel="noreferrer" className="text-sm text-[#ff4d6d] underline">
                Watch proof video →
              </a>
              <div className="mt-1 flex flex-wrap gap-3 text-sm">
                <a href={c.aadhaar_front_url} target="_blank" rel="noreferrer" className="text-[#ffb703] underline">
                  Aadhaar front
                </a>
                <a href={c.aadhaar_back_url} target="_blank" rel="noreferrer" className="text-[#ffb703] underline">
                  Aadhaar back
                </a>
                <a href={c.selfie_url} target="_blank" rel="noreferrer" className="text-[#ffb703] underline">
                  Selfie
                </a>
                {c.aadhaar_last4 && (
                  <span className="text-white/40">Aadhaar •••• {c.aadhaar_last4}</span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => decide(c.id, true)}
                  className="rounded-lg bg-[#ffb703] px-3 py-1.5 text-sm font-semibold text-[#1a0b2e]"
                >
                  Approve
                </button>
                <button
                  onClick={() => decide(c.id, false)}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
