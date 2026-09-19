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
  const [availabilityDates, setAvailabilityDates] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/bookings/mine')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setBookings(data.bookings || []);
        setRole(data.role || null);
        setAvailabilityDates(data.availabilityDates || []);
      });
  }, []);

  if (error) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: 'var(--paper)' }}
      >
        <p style={{ color: 'var(--ink-60)' }}>
          {error} —{' '}
          <Link href="/login" className="underline" style={{ color: 'var(--gold-deep)' }}>
            log in
          </Link>
        </p>
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

        <div className="mt-8 space-y-3">
          {bookings.length === 0 && <p style={{ color: 'var(--ink-40)' }}>No bookings yet.</p>}
          {bookings.map((b) => (
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
                <div className="mt-3 flex gap-5">
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
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
