'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-white/50',
  active: 'text-[#ffb703]',
  completed: 'text-green-400',
  cancelled: 'text-[#ff4d6d]',
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
      <main className="flex min-h-screen items-center justify-center bg-[#1a0b2e] text-white">
        <p>
          {error} —{' '}
          <Link href="/login" className="text-[#ffb703] underline">
            log in
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0b2e] px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-bold">Your bookings</h1>
        <div className="mt-6 space-y-3">
          {bookings.length === 0 && <p className="text-white/50">No bookings yet.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {b.client_name} × {b.companion_name}
                </p>
                <span className={`text-sm font-semibold ${STATUS_COLOR[b.status]}`}>
                  {b.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/50">
                ₹{b.amount_paid} · {new Date(b.booking_date).toLocaleDateString()}
              </p>
              {b.status === 'active' && (
                <Link
                  href={`/bookings/${b.id}/chat`}
                  className="mt-2 inline-block text-sm text-[#ffb703] underline"
                >
                  Coordinate tickets →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
