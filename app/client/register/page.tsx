'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function ClientRegisterPage() {
  return (
    <Suspense fallback={null}>
      <ClientRegisterForm />
    </Suspense>
  );
}

function ClientRegisterForm() {
  const searchParams = useSearchParams();
  const companionId = searchParams.get('companionId');

  const [form, setForm] = useState({
    name: '',
    gender: '',
    email: '',
    phoneNumber: '',
    aadhaarFrontUrl: '',
    aadhaarBackUrl: '',
    aadhaarLast4: '',
    selfieUrl: '',
  });
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'done'>('idle');
  const [error, setError] = useState('');
  const [companionPreference, setCompanionPreference] = useState<string | null>(null);
  const [companionName, setCompanionName] = useState('');

  useEffect(() => {
    if (!companionId) return;
    fetch(`/api/companions/${companionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.companion) {
          setCompanionPreference(data.companion.preference);
          setCompanionName(data.companion.name);
        }
      });
  }, [companionId]);

  const genderBlocked =
    companionPreference === 'girls_only' &&
    form.gender !== '' &&
    form.gender !== 'female';

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function payForBooking(bookingId: string) {
    const orderRes = await fetch('/api/bookings/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    const order = await orderRes.json();
    if (!orderRes.ok) throw new Error(order.error || 'Could not start payment');

    return new Promise<void>((resolve, reject) => {
      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: 'INR',
        name: 'Garba Buddy',
        description: 'Companion booking',
        handler: () => resolve(),
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      });
      rzp.open();
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (genderBlocked) {
      setError(`${companionName} only accepts female clients.`);
      return;
    }
    if (companionId && !liabilityAccepted) {
      setError('Please confirm the ticket liability terms to continue');
      return;
    }
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch('/api/clients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          companionId,
          ticketLiabilityAccepted: liabilityAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.booking?.id) {
        await payForBooking(data.booking.id);
      }
      setStatus('done');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1a0b2e] px-4 text-white">
        <div className="text-center">
          <p className="text-4xl">💃</p>
          <h1 className="mt-3 font-serif text-2xl font-bold">You're booked in!</h1>
          <p className="mt-2 text-white/60">
            You'll get your OTP and payment link on WhatsApp shortly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0b2e] px-4 py-12 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm font-semibold tracking-[0.3em] text-[#ffb703]">
          NAVRATRI · GARBA BUDDY
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">
          {companionId ? 'One step to confirm' : "Find your Garba buddy"}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {companionId
            ? 'A few details and your booking is set.'
            : 'Register to browse verified dance companions near you.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input"
              placeholder="Your name"
            />
          </Field>
          <Field label="Gender">
            <select
              required
              value={form.gender}
              onChange={(e) => update('gender', e.target.value)}
              className="input"
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </Field>

          {genderBlocked && (
            <p className="rounded-lg bg-[#ff4d6d]/10 px-3 py-2 text-xs text-[#ff4d6d]">
              {companionName} only accepts female clients. Payment is disabled.
              Try another companion on the browse page.
            </p>
          )}
          <Field label="Phone number">
            <input
              required
              value={form.phoneNumber}
              onChange={(e) => update('phoneNumber', e.target.value)}
              className="input"
              placeholder="98765 43210"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </Field>

          <div className="rounded-xl border border-[#ffb703]/20 bg-black/20 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#ffb703]">
              Identity verification (kept private, used for on-site matching)
            </p>
            <div className="space-y-3">
              <Field label="Aadhaar front (upload link)">
                <input
                  required
                  value={form.aadhaarFrontUrl}
                  onChange={(e) => update('aadhaarFrontUrl', e.target.value)}
                  className="input"
                  placeholder="Link to Aadhaar front image"
                />
              </Field>
              <Field label="Aadhaar back (upload link)">
                <input
                  required
                  value={form.aadhaarBackUrl}
                  onChange={(e) => update('aadhaarBackUrl', e.target.value)}
                  className="input"
                  placeholder="Link to Aadhaar back image"
                />
              </Field>
              <Field label="Last 4 digits of Aadhaar">
                <input
                  maxLength={4}
                  value={form.aadhaarLast4}
                  onChange={(e) => update('aadhaarLast4', e.target.value.replace(/\D/g, ''))}
                  className="input"
                  placeholder="1234"
                />
              </Field>
              <Field label="Selfie (upload link)">
                <input
                  required
                  value={form.selfieUrl}
                  onChange={(e) => update('selfieUrl', e.target.value)}
                  className="input"
                  placeholder="Clear face photo, matched at check-in"
                />
              </Field>
            </div>
          </div>

          {companionId && !genderBlocked && (
            <label className="flex items-start gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={liabilityAccepted}
                onChange={(e) => setLiabilityAccepted(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                This payment covers the companion's fee only — not your Garba
                venue entry ticket. Garba Buddy is not responsible for venue
                passes; ticket arrangements are between me and my companion.
              </span>
            </label>
          )}

          {error && <p className="text-sm text-[#ff4d6d]">{error}</p>}

          <button
            type="submit"
            disabled={status === 'submitting' || genderBlocked}
            className="w-full rounded-xl bg-[#ffb703] py-3 font-semibold text-[#1a0b2e] transition hover:bg-[#ffc93c] disabled:opacity-50"
          >
            {status === 'submitting'
              ? 'Submitting…'
              : genderBlocked
              ? 'Payment unavailable'
              : companionId
              ? 'Confirm & pay'
              : 'Register'}
          </button>
        </form>
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(0, 0, 0, 0.25);
          padding: 0.65rem 0.9rem;
          color: white;
          font-size: 0.95rem;
        }
        .input:focus {
          outline: none;
          border-color: #ffb703;
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}
