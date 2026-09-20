'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSetupPage() {
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Setup failed');
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
          One-time setup
        </p>
        <h1 className="font-display text-2xl font-medium">Create your admin account</h1>
        <p className="text-sm" style={{ color: 'var(--ink-40)' }}>
          This only works once. After this, log in at /admin/login with the email
          and password you set here.
        </p>

        <input
          required
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_SECRET (from Vercel env vars)"
          className="field-input"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your admin email"
          className="field-input"
        />
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password (min 8 chars)"
          className="field-input"
        />

        {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Create admin account'}
        </button>
      </form>
    </main>
  );
}
