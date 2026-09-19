'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertIcon, CheckIcon } from '@/components/icons';

export default function CheckinPage({ params }: { params: { bookingId: string } }) {
  const [booking, setBooking] = useState<any>(null);
  const [step, setStep] = useState<'match' | 'otp' | 'rejected' | 'done'>('match');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [rejectMessage, setRejectMessage] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetch(`/api/bookings/${params.bookingId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setLoadError(
            r.status === 401
              ? 'Please log in to check in for this booking.'
              : data.error || 'Could not load this booking.'
          );
          return;
        }
        setBooking(data.booking);
      })
      .catch(() => setLoadError('Network error — try again.'));
  }, [params.bookingId]);

  async function confirmMatch() {
    setStep('otp');
  }

  async function reportMismatch() {
    const res = await fetch(`/api/bookings/${params.bookingId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Face did not match registered selfie' }),
    });
    const data = await res.json().catch(() => null);
    setRejectMessage(
      data?.message || 'Booking cancelled. Our team will follow up on your refund.'
    );
    setStep('rejected');
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/bookings/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: params.bookingId, enteredOtp: otp }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setStep('done');
  }

  if (loadError) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: 'var(--paper)' }}
      >
        <p style={{ color: 'var(--ink-60)' }}>
          {loadError}{' '}
          <Link href="/login" className="underline" style={{ color: 'var(--gold-deep)' }}>
            Log in
          </Link>
        </p>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--paper)' }}>
        <p style={{ color: 'var(--ink-40)' }}>Loading…</p>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'var(--paper)' }}
    >
      <div className="card w-full max-w-sm p-8 text-center">
        {step === 'match' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
              Check-in
            </p>
            <h1 className="font-display mt-2 text-2xl font-medium">Is this {booking.companion_name}?</h1>
            <img
              src={booking.selfie_url}
              alt="Registered companion selfie"
              className="mx-auto mt-5 h-48 w-48 rounded-xl object-cover"
              style={{ border: '1px solid var(--line)' }}
            />
            <p className="mt-4 text-sm" style={{ color: 'var(--ink-60)' }}>
              Compare this photo to who's in front of you.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button onClick={confirmMatch} className="btn-primary">
                Yes, this is them
              </button>
              <button
                onClick={reportMismatch}
                className="rounded-full border py-3 text-sm font-semibold"
                style={{ borderColor: 'var(--maroon)', color: 'var(--maroon)' }}
              >
                Different person showed up
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <form onSubmit={submitOtp} className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
              Check-in
            </p>
            <h1 className="font-display text-2xl font-medium">Enter the OTP</h1>
            <p className="text-sm" style={{ color: 'var(--ink-60)' }}>
              Ask {booking.companion_name} for the code.
            </p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="field-input text-center"
            />
            {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}
            <button className="btn-primary w-full">Confirm check-in</button>
          </form>
        )}

        {step === 'rejected' && (
          <>
            <AlertIcon className="mx-auto h-8 w-8" style={{ color: 'var(--maroon)' }} />
            <h1 className="font-display mt-4 text-2xl font-medium">Reported</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-60)' }}>
              {rejectMessage}
            </p>
          </>
        )}

        {step === 'done' && (
          <>
            <CheckIcon className="mx-auto h-8 w-8" style={{ color: 'var(--gold)' }} />
            <h1 className="font-display mt-4 text-2xl font-medium">Checked in</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-60)' }}>Have a great Garba night.</p>
          </>
        )}
      </div>
    </main>
  );
}
