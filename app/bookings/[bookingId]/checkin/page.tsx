'use client';

import { useEffect, useState } from 'react';

export default function CheckinPage({ params }: { params: { bookingId: string } }) {
  const [booking, setBooking] = useState<any>(null);
  const [step, setStep] = useState<'match' | 'otp' | 'rejected' | 'done'>('match');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/bookings/${params.bookingId}`)
      .then((r) => r.json())
      .then((data) => setBooking(data.booking));
  }, [params.bookingId]);

  async function confirmMatch() {
    setStep('otp');
  }

  async function reportMismatch() {
    await fetch(`/api/bookings/${params.bookingId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Face did not match registered selfie' }),
    });
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

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1a0b2e] text-white">
        <p className="text-white/50">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1a0b2e] px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
        {step === 'match' && (
          <>
            <p className="text-sm font-semibold tracking-[0.3em] text-[#ffb703]">CHECK-IN</p>
            <h1 className="mt-2 font-serif text-2xl font-bold">Is this {booking.companion_name}?</h1>
            <img
              src={booking.selfie_url}
              alt="Registered companion selfie"
              className="mx-auto mt-4 h-48 w-48 rounded-xl object-cover"
            />
            <p className="mt-3 text-sm text-white/60">
              Compare this photo to who's in front of you.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={confirmMatch}
                className="rounded-xl bg-[#ffb703] py-3 font-semibold text-[#1a0b2e]"
              >
                Yes, this is them
              </button>
              <button
                onClick={reportMismatch}
                className="rounded-xl border border-[#ff4d6d]/40 py-3 font-semibold text-[#ff4d6d]"
              >
                Different person showed up
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <form onSubmit={submitOtp} className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] text-[#ffb703]">CHECK-IN</p>
            <h1 className="font-serif text-2xl font-bold">Enter the OTP</h1>
            <p className="text-sm text-white/60">Ask {booking.companion_name} for the code.</p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-center"
            />
            {error && <p className="text-sm text-[#ff4d6d]">{error}</p>}
            <button className="w-full rounded-xl bg-[#ffb703] py-3 font-semibold text-[#1a0b2e]">
              Confirm check-in
            </button>
          </form>
        )}

        {step === 'rejected' && (
          <>
            <p className="text-4xl">⚠️</p>
            <h1 className="mt-3 font-serif text-2xl font-bold">Reported</h1>
            <p className="mt-2 text-sm text-white/60">
              Booking cancelled. Our team will follow up on your refund.
            </p>
          </>
        )}

        {step === 'done' && (
          <>
            <p className="text-4xl">💃</p>
            <h1 className="mt-3 font-serif text-2xl font-bold">Checked in!</h1>
            <p className="mt-2 text-sm text-white/60">Have a great Garba night.</p>
          </>
        )}
      </div>
    </main>
  );
}
