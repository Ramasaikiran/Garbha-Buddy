'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/components/PasswordInput';

export default function AdminSecretResetPage() {
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/secret-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed');
        return;
      }
      router.push('/admin/login');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'var(--paper)' }}
    >
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Admin
        </p>
        <h1 className="font-display text-2xl font-medium">Reset with secret</h1>
        <PasswordInput
          required
          value={secret}
          onChange={setSecret}
          placeholder="ADMIN_SECRET (from Vercel env vars)"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          className="field-input"
        />
        <PasswordInput
          required
          minLength={8}
          value={newPassword}
          onChange={setNewPassword}
          placeholder="New password (min 8 chars)"
        />
        {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </main>
  );
}
