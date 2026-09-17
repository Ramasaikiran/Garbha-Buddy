'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    const res = await fetch('/api/admin/companions');
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = await res.json();
    setPending(data.pending || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(companionId: string, approve: boolean) {
    const res = await fetch('/api/admin/companions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companionId, approve }),
    });
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    setPending((p) => p.filter((c) => c.id !== companionId));
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--ink)' }}>
        <p className="text-white/50">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 text-white" style={{ background: 'var(--ink)' }}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Pending companions</h1>
          <button onClick={logout} className="text-sm text-white/40 underline">
            Log out
          </button>
        </div>
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
