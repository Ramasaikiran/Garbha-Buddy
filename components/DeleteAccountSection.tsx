'use client';

import { useEffect, useState } from 'react';

export default function DeleteAccountSection() {
  const [pendingRequest, setPendingRequest] = useState<any>(undefined);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function load() {
    fetch('/api/account/delete-request')
      .then((r) => r.json())
      .then((data) => {
        setPendingRequest(data.request?.status === 'pending' ? data.request : null);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/account/delete-request', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit your request.');
      setConfirming(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelRequest() {
    setSubmitting(true);
    try {
      await fetch('/api/account/delete-request', { method: 'DELETE' });
      load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card mt-6 p-5" style={{ borderColor: 'rgba(122, 36, 56, 0.25)' }}>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--maroon)' }}>
        Danger zone
      </p>

      {pendingRequest === undefined ? null : pendingRequest ? (
        <>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
            Deletion requested on {new Date(pendingRequest.requested_at).toLocaleDateString()}.
            An admin will review it shortly.
          </p>
          <button
            type="button"
            onClick={handleCancelRequest}
            disabled={submitting}
            className="mt-4 text-sm underline"
            style={{ color: 'var(--ink-40)' }}
          >
            Cancel request
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
            Requesting deletion submits it for admin review. Once approved,
            it permanently removes your name, phone number, email, Aadhaar
            images, and selfie. Booking records are kept, without your
            personal details, for dispute and legal purposes, as described
            in our{' '}
            <a href="/privacy" className="underline" style={{ color: 'var(--gold-deep)' }}>
              privacy policy
            </a>
            . This can't be undone.
          </p>

          {error && <p className="mt-3 text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-4 text-sm font-medium underline"
              style={{ color: 'var(--maroon)' }}
            >
              Request account deletion
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Are you sure?</p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full px-4 py-2 text-xs font-semibold text-white"
                style={{ background: 'var(--maroon)' }}
              >
                {submitting ? 'Submitting…' : 'Yes, request deletion'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="text-xs underline"
                style={{ color: 'var(--ink-40)' }}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
