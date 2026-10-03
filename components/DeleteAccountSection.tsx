'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountSection() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete your account.');
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="card mt-6 p-5"
      style={{ borderColor: 'rgba(122, 36, 56, 0.25)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--maroon)' }}>
        Danger zone
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
        Deleting your account removes your name, phone number, email, Aadhaar
        images, and selfie permanently. Booking records are kept, without
        your personal details, for dispute and legal purposes, as described
        in our{' '}
        <a href="/privacy" className="underline" style={{ color: 'var(--gold-deep)' }}>
          privacy policy
        </a>
        . This can't be undone.
      </p>

      {error && (
        <p className="mt-3 text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>
      )}

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 text-sm font-medium underline"
          style={{ color: 'var(--maroon)' }}
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Are you sure?
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full px-4 py-2 text-xs font-semibold text-white"
            style={{ background: 'var(--maroon)' }}
          >
            {deleting ? 'Deleting…' : 'Yes, delete permanently'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="text-xs underline"
            style={{ color: 'var(--ink-40)' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
