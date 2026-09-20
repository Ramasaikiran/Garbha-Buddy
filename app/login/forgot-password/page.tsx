'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || 'Something went wrong');
      return;
    }
    setStep('reset');
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/login'), 1500);
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: 'var(--paper)' }}>
        <p className="font-display text-2xl font-medium">Password updated. Redirecting…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: 'var(--paper)' }}>
      <form
        onSubmit={step === 'email' ? requestReset : resetPassword}
        className="card w-full max-w-sm space-y-5 p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Garba Buddy
        </p>
        <h1 className="font-display text-2xl font-medium">
          {step === 'email' ? 'Reset password' : 'Enter code & new password'}
        </h1>

        {step === 'email' ? (
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="field-input"
          />
        ) : (
          <>
            <input
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Code from your email"
              className="field-input"
            />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="field-input"
            />
          </>
        )}

        {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Please wait…' : step === 'email' ? 'Send reset code' : 'Set new password'}
        </button>

        <Link href="/login" className="block text-center text-xs underline" style={{ color: 'var(--ink-40)' }}>
          Back to login
        </Link>
      </form>
    </main>
  );
}
