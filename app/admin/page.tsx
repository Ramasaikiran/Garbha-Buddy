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
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--paper)' }}>
        <p style={{ color: 'var(--ink-40)' }}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-medium">Pending companions</h1>
          <button onClick={logout} className="text-sm underline" style={{ color: 'var(--ink-40)' }}>
            Log out
          </button>
        </div>
        <div className="mt-8 space-y-4">
          {pending.length === 0 && <p style={{ color: 'var(--ink-40)' }}>Nothing to review.</p>}
          {pending.map((c) => (
            <div key={c.id} className="card p-5">
              <p className="font-medium">{c.name} — {c.city}</p>
              <p className="text-sm" style={{ color: 'var(--ink-40)' }}>{c.phone_number} · {c.tier}</p>
              <a
                href={c.video_proof_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
                style={{ color: 'var(--maroon)' }}
              >
                Watch proof video →
              </a>
              <div className="mt-1 flex flex-wrap gap-3 text-sm">
                <a href={c.aadhaar_front_url} target="_blank" rel="noreferrer" className="underline" style={{ color: 'var(--gold-deep)' }}>
                  Aadhaar front
                </a>
                <a href={c.aadhaar_back_url} target="_blank" rel="noreferrer" className="underline" style={{ color: 'var(--gold-deep)' }}>
                  Aadhaar back
                </a>
                <a href={c.selfie_url} target="_blank" rel="noreferrer" className="underline" style={{ color: 'var(--gold-deep)' }}>
                  Selfie
                </a>
                {c.aadhaar_last4 && (
                  <span style={{ color: 'var(--ink-40)' }}>Aadhaar •••• {c.aadhaar_last4}</span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => decide(c.id, true)} className="btn-primary !px-4 !py-1.5 !text-xs">
                  Approve
                </button>
                <button onClick={() => decide(c.id, false)} className="btn-secondary !px-4 !py-1.5 !text-xs">
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
