'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--ink-40)',
  active: 'var(--gold-deep)',
  completed: '#3F7D4C',
  cancelled: 'var(--maroon)',
};

export default function DashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/bookings/mine')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setBookings(data.bookings || []);
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

  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-medium">Your bookings</h1>
        <div className="mt-8 space-y-3">
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
