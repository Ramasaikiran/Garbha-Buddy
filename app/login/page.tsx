'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const router = useRouter();

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send OTP');
        return;
      }
      setDevOtp(data.devOtp || null);
      setStep('otp');
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not verify OTP');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
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

        {devOtp && step === 'otp' && (
          <p className="rounded-lg bg-[#ffb703]/10 px-3 py-2 text-xs text-[#ffb703]">
            SMS isn't wired up yet — your test OTP is <strong>{devOtp}</strong>.
          </p>
        )}

        {error && <p className="text-sm text-[#ff4d6d]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#ffb703] py-3 font-semibold text-[#1a0b2e] disabled:opacity-50"
        >
          {loading
            ? 'Please wait…'
            : step === 'phone'
            ? 'Send OTP'
            : 'Verify & log in'}
        </button>
      </form>
    </main>
  );
}
