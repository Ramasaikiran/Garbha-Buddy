'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(26, 20, 32, 0.08)', color: 'var(--ink-60)' },
  active: { bg: 'rgba(168, 117, 44, 0.12)', color: 'var(--gold-deep)' },
  completed: { bg: 'rgba(63, 125, 76, 0.12)', color: '#3F7D4C' },
  cancelled: { bg: 'rgba(122, 36, 56, 0.1)', color: 'var(--maroon)' },
};

const TABS = [
  { key: 'companions', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'deletions', label: 'Deletions' },
] as const;

type Tab = (typeof TABS)[number]['key'];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('companions');
  const [pending, setPending] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [deletionError, setDeletionError] = useState<Record<string, string>>({});
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
    setActive(data.active || []);
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

  async function loadDeletionRequests() {
    const res = await fetch('/api/admin/deletion-requests');
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = await res.json();
    setDeletionRequests(data.requests || []);
  }

  useEffect(() => {
    Promise.all([loadCompanions(), loadBookings(), loadDeletionRequests()]).then(() => setLoading(false));
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

  async function deactivate(companionId: string) {
    const res = await fetch('/api/admin/companions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companionId, approve: false }),
    });
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    setActive((a) => a.filter((c) => c.id !== companionId));
  }

  async function decideDeletion(requestId: string, approve: boolean) {
    setDeletionError((e) => ({ ...e, [requestId]: '' }));
    const res = await fetch('/api/admin/deletion-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, approve }),
    });
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setDeletionError((e) => ({ ...e, [requestId]: data.error || 'Could not process this request.' }));
      return;
    }
    setDeletionRequests((reqs) => reqs.filter((r) => r.id !== requestId));
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

  const tabCount: Record<Tab, number> = {
    companions: pending.length,
    active: active.length,
    bookings: bookings.length,
    deletions: deletionRequests.length,
  };

  return (
    <main className="min-h-screen px-4 pb-16 pt-8 sm:px-6" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-medium sm:text-3xl">Admin</h1>
          <button onClick={logout} className="text-sm underline" style={{ color: 'var(--ink-40)' }}>
            Log out
          </button>
        </div>

        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide"
              style={
                tab === t.key
                  ? { background: 'var(--gold)', color: '#fff' }
                  : { background: '#fff', border: '1px solid var(--line-strong)', color: 'var(--ink-60)' }
              }
            >
              {t.label} ({tabCount[t.key]})
            </button>
          ))}
        </div>

        {tab === 'companions' && (
          <div className="mt-6 space-y-3">
            {pending.length === 0 && <EmptyState text="No companions waiting on review." />}
            {pending.map((c) => (
              <div key={c.id} className="card p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium">{c.name}</p>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                    style={{ background: 'rgba(168, 117, 44, 0.12)', color: 'var(--gold-deep)' }}
                  >
                    {c.tier}
                  </span>
                </div>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--ink-40)' }}>
                  {c.city} · {c.phone_number}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                  <a href={c.video_proof_url} target="_blank" rel="noreferrer" className="underline" style={{ color: 'var(--maroon)' }}>
                    Proof video
                  </a>
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
                    <span style={{ color: 'var(--ink-40)' }}>•••• {c.aadhaar_last4}</span>
                  )}
                </div>

                <div className="mt-4 flex gap-2 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
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

        {tab === 'active' && (
          <div className="mt-6 space-y-3">
            {active.length === 0 && <EmptyState text="No approved companions yet." />}
            {active.map((c) => (
              <div key={c.id} className="card p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium">{c.name}</p>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                    style={{ background: 'rgba(168, 117, 44, 0.12)', color: 'var(--gold-deep)' }}
                  >
                    {c.tier}
                  </span>
                </div>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--ink-40)' }}>
                  {c.city} · {c.phone_number} · {c.email}
                </p>
                {c.slug && (
                  <a
                    href={`/book/${c.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm underline"
                    style={{ color: 'var(--gold-deep)' }}
                  >
                    View public profile
                  </a>
                )}
                <div className="mt-4 flex gap-2 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
                  <button onClick={() => deactivate(c.id)} className="btn-secondary !px-4 !py-1.5 !text-xs">
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'bookings' && (
          <div className="mt-6">
            {stats && (
              <div className="space-y-4">
                <StatGroup title="Bookings">
                  <Stat label="Total" value={stats.total_bookings} />
                  <Stat label="Revenue" value={`₹${stats.total_revenue}`} accent />
                  <Stat label="Active" value={stats.active_count} />
                  <Stat label="Completed" value={stats.completed_count} />
                  <Stat label="Pending" value={stats.pending_count} />
                  <Stat label="Cancelled" value={stats.cancelled_count} />
                </StatGroup>
                <StatGroup title="Payouts">
                  <Stat label="Awaiting payment" value={stats.payout_pending_count} />
                  <Stat label="In escrow" value={stats.payout_escrow_count} />
                  <Stat label="Paid out" value={stats.payout_paid_count} />
                  <Stat label="Refunded" value={stats.payout_refunded_count} />
                </StatGroup>
                <StatGroup title="Penalties">
                  <Stat label="Owed" value={`₹${stats.penalties_pending}`} />
                  <Stat label="Deducted" value={`₹${stats.penalties_deducted}`} />
                </StatGroup>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {bookings.length === 0 && <EmptyState text="No bookings yet." />}
              {bookings.map((b) => (
                <div key={b.id} className="card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">
                      {b.client_name} × {b.companion_name}
                    </p>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                      style={STATUS_STYLE[b.status] || STATUS_STYLE.pending}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--ink-60)' }}>
                    ₹{b.amount_paid} · {new Date(b.booking_date).toLocaleDateString()}
                  </p>
                  <div className="mt-2 space-y-0.5 text-xs" style={{ color: 'var(--ink-40)' }}>
                    <p>Client {b.client_phone} · Companion {b.companion_phone}</p>
                    <p>
                      Payout: {b.payout_status || 'pending'}
                      {b.razorpay_payment_id && ` · ${b.razorpay_payment_id}`}
                    </p>
                  </div>
                  {b.cancellation_reason && (
                    <p
                      className="mt-2 rounded-lg px-2.5 py-1.5 text-xs"
                      style={{ background: 'rgba(122, 36, 56, 0.06)', color: 'var(--maroon)' }}
                    >
                      {b.cancellation_reason.replace(/_/g, ' ')}
                      {b.refund_amount != null && ` · refunded ₹${b.refund_amount}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'deletions' && (
          <div className="mt-6 space-y-3">
            {deletionRequests.length === 0 && <EmptyState text="No deletion requests waiting on review." />}
            {deletionRequests.map((r) => (
              <div key={r.id} className="card p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium">{r.name}</p>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                    style={{ background: 'rgba(26, 20, 32, 0.08)', color: 'var(--ink-60)' }}
                  >
                    {r.role}
                  </span>
                </div>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--ink-40)' }}>
                  {r.email || 'no email'} · {r.phone_number || 'no phone'}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ink-40)' }}>
                  Requested {new Date(r.requested_at).toLocaleDateString()}
                </p>
                {deletionError[r.id] && (
                  <p
                    className="mt-2 rounded-lg px-2.5 py-1.5 text-xs"
                    style={{ background: 'rgba(122, 36, 56, 0.06)', color: 'var(--maroon)' }}
                  >
                    {deletionError[r.id]}
                  </p>
                )}
                <div className="mt-4 flex gap-2 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
                  <button onClick={() => decideDeletion(r.id, true)} className="btn-primary !px-4 !py-1.5 !text-xs">
                    Approve
                  </button>
                  <button onClick={() => decideDeletion(r.id, false)} className="btn-secondary !px-4 !py-1.5 !text-xs">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-40)' }}>
        {title}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className="card p-3">
      <p className="text-[0.65rem] font-medium uppercase leading-tight tracking-wide" style={{ color: 'var(--ink-40)' }}>
        {label}
      </p>
      <p
        className="font-display mt-1 text-lg font-medium leading-tight"
        style={accent ? { color: 'var(--gold-deep)' } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="card p-5 text-center text-sm" style={{ color: 'var(--ink-40)' }}>
      {text}
    </div>
  );
}
