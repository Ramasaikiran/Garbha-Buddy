'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--ink-40)',
  active: 'var(--gold-deep)',
  completed: '#3F7D4C',
  cancelled: 'var(--maroon)',
};

const PAYOUT_LABEL: Record<string, string> = {
  pending: 'Payout pending',
  escrow: 'Held in escrow',
  paid_out: 'Payout received',
  refunded: 'Refunded to client',
  failed: 'Payout failed',
};

export default function DashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [availabilityDates, setAvailabilityDates] = useState<string[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [stats, setStats] = useState<any>(null);

  function load() {
    fetch('/api/bookings/mine')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setBookings(data.bookings || []);
        setRole(data.role || null);
        setIsVerified(data.isVerified);
        setAvailabilityDates(data.availabilityDates || []);
        setSlug(data.slug || null);
        if (data.role === 'companion') {
          fetch('/api/companions/stats')
            .then((r) => r.json())
            .then((s) => setStats(s));
        }
      });
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (slug && typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/book/${slug}`);
    }
  }, [slug]);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareToWhatsApp() {
    const text = encodeURIComponent(`Book a Garba dance slot with me this Navratri! ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  async function cancelBooking(bookingId: string, hoursUntil: number) {
    const pct = hoursUntil <= 24 ? 70 : 80;
    if (!confirm(`Cancel this booking? You'll get a ${pct}% refund.`)) return;
    setActionBookingId(bookingId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
      const data = await res.json();
      setActionMessage(data.message || (res.ok ? 'Cancelled.' : 'Could not cancel.'));
      load();
    } finally {
      setActionBookingId(null);
    }
  }

  async function reportNoShow(bookingId: string) {
    if (!confirm("Report that your companion didn't show up? This cancels the booking and refunds you in full.")) return;
    setActionBookingId(bookingId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setActionMessage(data.message || (res.ok ? 'Reported.' : 'Could not report.'));
      load();
    } finally {
      setActionBookingId(null);
    }
  }

  if (error) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: 'var(--paper)' }}
      >
        <p style={{ color: 'var(--ink-60)' }}>
          {error}.{' '}
          <Link href="/login" className="underline" style={{ color: 'var(--gold-deep)' }}>
            log in
          </Link>
        </p>
      </main>
    );
  }

  if (role === 'companion' && isVerified === false) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: 'var(--paper)' }}
      >
        <div className="card max-w-sm p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
            Verification pending
          </p>
          <h1 className="font-display mt-3 text-2xl font-medium">
            Your profile is under review
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
            Our team is reviewing your documents. Once approved, you'll be able
            to view your dashboard, get your shareable link, and start
            receiving bookings.
          </p>
        </div>
      </main>
    );
  }

  const bookedDates = new Set(
    bookings
      .filter((b) => b.status !== 'cancelled')
      .map((b) => new Date(b.booking_date).toDateString())
  );

  const allDates = availabilityDates;

  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-medium">
          {role === 'companion' ? 'Who booked you' : 'Your bookings'}
        </h1>
        {role === 'companion' && (
          <Link href="/dashboard/profile" className="mt-2 inline-block text-sm underline" style={{ color: 'var(--gold-deep)' }}>
            Edit your profile →
          </Link>
        )}

        {role === 'companion' && shareUrl && (
          <div className="card mt-6 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
              Your profile link
            </p>
            <p className="text-sm" style={{ color: 'var(--ink-60)' }}>
              Share this with friends, family, or on social media. Anyone who opens it can book a slot with you directly.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code
                className="rounded-lg px-3 py-2 text-xs"
                style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink-60)' }}
              >
                {shareUrl}
              </code>
              <button onClick={copyLink} className="btn-secondary !px-3 !py-1.5 !text-xs">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={shareToWhatsApp} className="btn-secondary !px-3 !py-1.5 !text-xs">
                Share on WhatsApp
              </button>
            </div>
          </div>
        )}

        {role === 'companion' && stats && (
          <div className="card mt-6 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
              Your stats
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total bookings" value={stats.totalBookings} />
              <Stat label="Clients" value={stats.uniqueClients} />
              <Stat label="Today" value={stats.bookingsToday} />
              <Stat label="Last 7 days" value={stats.bookingsLast7Days} />
              <Stat label="Amount pending" value={`₹${stats.amountPending}`} />
              <Stat label="Amount received" value={`₹${stats.amountReceived}`} />
            </div>
            {stats.penaltiesPending > 0 && (
              <p className="mt-3 text-xs" style={{ color: 'var(--maroon)' }}>
                ₹{stats.penaltiesPending} in no-show penalties will be deducted from your next payout.
              </p>
            )}
          </div>
        )}

        {role === 'companion' && allDates.length > 0 && (
          <div className="card mt-6 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
              Your Navratri dates
            </p>
            <div className="flex flex-wrap gap-2">
              {allDates.map((d) => {
                const booked = bookedDates.has(new Date(d).toDateString());
                return (
                  <span
                    key={d}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={
                      booked
                        ? { background: 'rgba(122, 36, 56, 0.08)', color: 'var(--maroon)' }
                        : { background: 'rgba(63, 125, 76, 0.1)', color: '#3F7D4C' }
                    }
                  >
                    {d} · {booked ? 'Booked' : 'Free'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {actionMessage && (
          <p
            className="mt-6 rounded-lg px-4 py-3 text-sm"
            style={{ background: 'rgba(168, 117, 44, 0.08)', color: 'var(--gold-deep)' }}
          >
            {actionMessage}
          </p>
        )}

        <div className="mt-8 space-y-3">
          {bookings.length === 0 && <p style={{ color: 'var(--ink-40)' }}>No bookings yet.</p>}
          {bookings.map((b) => {
            const hoursUntil = (new Date(b.booking_date).getTime() - Date.now()) / (1000 * 60 * 60);
            return (
              <div key={b.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {role === 'companion' ? b.client_name : b.companion_name}
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
                {role === 'companion' && b.client_phone && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--ink-40)' }}>
                    {b.client_phone}
                  </p>
                )}
                {role === 'client' && b.companion_phone && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--ink-40)' }}>
                    {b.companion_phone}
                  </p>
                )}
                {role === 'companion' && b.payout_status && (
                  <p
                    className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink-60)' }}
                  >
                    {PAYOUT_LABEL[b.payout_status] || b.payout_status}
                  </p>
                )}
                {b.status === 'active' && (
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    <Link
                      href={`/bookings/${b.id}/chat`}
                      className="text-sm underline"
                      style={{ color: 'var(--gold-deep)' }}
                    >
                      Coordinate tickets →
                    </Link>
                    <Link
                      href={`/bookings/${b.id}/checkin`}
                      className="text-sm underline"
                      style={{ color: 'var(--gold-deep)' }}
                    >
                      Check in →
                    </Link>
                    {role === 'client' && (
                      <>
                        <button
                          onClick={() => cancelBooking(b.id, hoursUntil)}
                          disabled={actionBookingId === b.id}
                          className="text-sm underline"
                          style={{ color: 'var(--ink-40)' }}
                        >
                          Cancel booking
                        </button>
                        <button
                          onClick={() => reportNoShow(b.id)}
                          disabled={actionBookingId === b.id}
                          className="text-sm underline"
                          style={{ color: 'var(--maroon)' }}
                        >
                          Companion didn't show up
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-40)' }}>{label}</p>
      <p className="font-display mt-1 text-lg font-medium">{value}</p>
    </div>
  );
}
