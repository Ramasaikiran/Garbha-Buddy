'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Login failed');
      return;
    }
    router.push('/admin');
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--ink)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border p-8 backdrop-blur"
        style={{ borderColor: 'var(--thread)', background: 'rgba(255,255,255,0.04)' }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: 'var(--marigold)' }}
        >
          Admin
        </p>
        <h1 className="font-display text-2xl font-bold text-white">Sign in</h1>

        <input
          type="password"
          required
          autoFocus
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin secret"
          className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white"
        />

        {error && <p className="text-sm" style={{ color: 'var(--rani-pink)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3 font-semibold text-[#1a0b2e] disabled:opacity-50"
          style={{ background: 'var(--marigold)' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
