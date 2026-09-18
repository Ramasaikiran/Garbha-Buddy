'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
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
        body: JSON.stringify({ email }),
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
        body: JSON.stringify({ email, otp }),
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
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'var(--paper)' }}
    >
      <form
        onSubmit={step === 'email' ? requestOtp : verifyOtp}
        className="card w-full max-w-sm space-y-5 p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Log in
        </p>
        <h1 className="font-display text-2xl font-medium">
          {step === 'email' ? 'Enter your email' : 'Enter the OTP'}
        </h1>

        {step === 'email' ? (
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="field-input"
          />
        ) : (
          <input
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
            className="field-input"
          />
        )}

        {devOtp && step === 'otp' && (
          <p
            className="rounded-lg px-3 py-2.5 text-xs"
            style={{ background: 'rgba(168, 117, 44, 0.08)', color: 'var(--gold-deep)' }}
          >
            Email isn't wired up yet — your test OTP is <strong>{devOtp}</strong>.
          </p>
        )}

        {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading
            ? 'Please wait…'
            : step === 'email'
            ? 'Send OTP'
            : 'Verify & log in'}
        </button>
      </form>
    </main>
  );
}
