'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--ink-40)',
  active: 'var(--gold-deep)',
  completed: '#3F7D4C',
  cancelled: 'var(--maroon)',
};

export default function AdminPage() {
  const [tab, setTab] = useState<'companions' | 'bookings'>('companions');
  const [pending, setPending] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadCompanions() {
    const res = await fetch('/api/admin/companions');
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = await res.json();
    setPending(data.pending || []);
  }

  async function loadBookings() {
    const res = await fetch('/api/admin/bookings');
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = await res.json();
    setBookings(data.bookings || []);
    setStats(data.stats || null);
  }

  useEffect(() => {
    Promise.all([loadCompanions(), loadBookings()]).then(() => setLoading(false));
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
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-medium">Admin</h1>
          <button onClick={logout} className="text-sm underline" style={{ color: 'var(--ink-40)' }}>
            Log out
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTab('companions')}
            className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
            style={
              tab === 'companions'
                ? { background: 'var(--gold)', color: '#fff' }
                : { background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink-60)' }
            }
          >
            Pending companions ({pending.length})
          </button>
          <button
            onClick={() => setTab('bookings')}
            className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
            style={
              tab === 'bookings'
                ? { background: 'var(--gold)', color: '#fff' }
                : { background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink-60)' }
            }
          >
            Bookings & payments
          </button>
        </div>

        {tab === 'companions' && (
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
        )}

        {tab === 'bookings' && (
          <div className="mt-8">
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Total bookings" value={stats.total_bookings} />
                <Stat label="Total revenue" value={`₹${stats.total_revenue}`} />
                <Stat label="Active" value={stats.active_count} />
                <Stat label="Completed" value={stats.completed_count} />
                <Stat label="Pending" value={stats.pending_count} />
                <Stat label="Cancelled" value={stats.cancelled_count} />
                <Stat label="Payouts pending" value={stats.payout_pending_count} />
                <Stat label="In escrow" value={stats.payout_escrow_count} />
                <Stat label="Payouts paid" value={stats.payout_paid_count} />
                <Stat label="Refunded" value={stats.payout_refunded_count} />
              </div>
            )}

            <div className="mt-6 space-y-3">
              {bookings.length === 0 && <p style={{ color: 'var(--ink-40)' }}>No bookings yet.</p>}
              {bookings.map((b) => (
                <div key={b.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {b.client_name} × {b.companion_name}
                    </p>
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: STATUS_COLOR[b.status] }}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: 'var(--ink-40)' }}>
                    ₹{b.amount_paid} · {new Date(b.booking_date).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--ink-40)' }}>
                    Client: {b.client_phone} · Companion: {b.companion_phone}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--ink-40)' }}>
                    Payout: {b.payout_status || 'pending'}
                    {b.razorpay_payment_id && ` · ${b.razorpay_payment_id}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-40)' }}>{label}</p>
      <p className="mt-1 font-display text-xl font-medium">{value}</p>
    </div>
  );
}
