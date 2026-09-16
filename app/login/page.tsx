'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const router = useRouter();

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setStep('otp');
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1a0b2e] px-4 text-white">
      <form
        onSubmit={step === 'phone' ? requestOtp : verifyOtp}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
      >
        <p className="text-sm font-semibold tracking-[0.3em] text-[#ffb703]">LOG IN</p>
        <h1 className="font-serif text-2xl font-bold">
          {step === 'phone' ? 'Enter your phone' : 'Enter the OTP'}
        </h1>

        {step === 'phone' ? (
          <input
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="98765 43210"
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2"
          />
        ) : (
          <input
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2"
          />
        )}

        {error && <p className="text-sm text-[#ff4d6d]">{error}</p>}

        <button className="w-full rounded-xl bg-[#ffb703] py-3 font-semibold text-[#1a0b2e]">
          {step === 'phone' ? 'Send OTP' : 'Verify & log in'}
        </button>
      </form>
    </main>
  );
}
