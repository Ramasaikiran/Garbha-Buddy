'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { CheckIcon, AlertIcon, LockIcon } from '@/components/icons';

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
  const totalSteps = companionId ? 2 : 1;

  const [step, setStep] = useState(0);
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
  const [razorpayReady, setRazorpayReady] = useState(false);

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

  function stepOneValid() {
    return form.name && form.gender && form.phoneNumber && form.email && !genderBlocked;
  }

  function next() {
    if (genderBlocked) {
      setError(`${companionName} only accepts female clients.`);
      return;
    }
    if (!stepOneValid()) {
      setError('Fill in the required fields to continue.');
      return;
    }
    setError('');
    setStep(1);
  }

  async function payForBooking(bookingId: string) {
    if (!(window as any).Razorpay) {
      throw new Error('Payment is still loading — try again in a moment.');
    }

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
      <main
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: 'var(--paper)' }}
      >
        <div className="text-center">
          <CheckIcon className="mx-auto h-9 w-9" style={{ color: 'var(--gold)' }} />
          <h1 className="font-display mt-4 text-2xl font-medium">You're booked in</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-60)' }}>
            You'll get your OTP and payment confirmation on WhatsApp shortly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="card mx-auto max-w-md p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Garba Buddy
        </p>
        <h1 className="font-display mt-3 text-3xl font-medium leading-tight">
          {companionId ? 'One step to confirm' : 'Find your Garba buddy'}
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-60)' }}>
          {companionId
            ? 'A few details and your booking is set.'
            : 'Register to browse verified dance companions near you.'}
        </p>

        {totalSteps === 2 && (
          <div className="mt-6 h-1 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: step === 0 ? '50%' : '100%', background: 'var(--gold)' }}
            />
          </div>
        )}


        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {(step === 0 || totalSteps === 1) && (
            <>
              <Field label="Full name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="field-input"
                  placeholder="Your name"
                />
              </Field>
              <Field label="Gender">
                <select
                  required
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                  className="field-input"
                >
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              {genderBlocked && (
                <p
                  className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs"
                  style={{ background: 'rgba(122, 36, 56, 0.06)', color: 'var(--maroon)' }}
                >
                  <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {companionName} only accepts female clients. Payment is disabled —
                  try another companion on the browse page.
                </p>
              )}

              <Field label="Phone number">
                <input
                  required
                  value={form.phoneNumber}
                  onChange={(e) => update('phoneNumber', e.target.value)}
                  className="field-input"
                  placeholder="98765 43210"
                />
              </Field>

              <Field label="Email">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="field-input"
                  placeholder="you@example.com"
                />
              </Field>
            </>
          )}

          {(step === 1 || totalSteps === 1) && (
            <>
              <div className="rounded-xl p-5" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
                  Kept private — used only for on-site matching
                </p>
                <div className="space-y-4">
                  <Field label="Aadhaar front (upload link)">
                    <input
                      required
                      type="url"
                      value={form.aadhaarFrontUrl}
                      onChange={(e) => update('aadhaarFrontUrl', e.target.value)}
                      className="field-input"
                      placeholder="Link to Aadhaar front image"
                    />
                  </Field>
                  <Field label="Aadhaar back (upload link)">
                    <input
                      required
                      type="url"
                      value={form.aadhaarBackUrl}
                      onChange={(e) => update('aadhaarBackUrl', e.target.value)}
                      className="field-input"
                      placeholder="Link to Aadhaar back image"
                    />
                  </Field>
                  <Field label="Last 4 digits of Aadhaar">
                    <input
                      maxLength={4}
                      value={form.aadhaarLast4}
                      onChange={(e) => update('aadhaarLast4', e.target.value.replace(/\D/g, ''))}
                      className="field-input"
                      placeholder="1234"
                    />
                  </Field>
                  <Field label="Selfie (upload link)">
                    <input
                      required
                      type="url"
                      value={form.selfieUrl}
                      onChange={(e) => update('selfieUrl', e.target.value)}
                      className="field-input"
                      placeholder="Clear face photo, matched at check-in"
                    />
                  </Field>
                </div>
              </div>

              {companionId && !genderBlocked && (
                <label className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--ink-60)' }}>
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

              {companionId && (
                <p className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-40)' }}>
                  <LockIcon className="h-3.5 w-3.5" />
                  Payments secured by Razorpay, held in escrow until check-in
                </p>
              )}
            </>
          )}

          {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}

          <div className="flex gap-3">
            {totalSteps === 2 && step === 1 && (
              <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1">
                Back
              </button>
            )}
            {totalSteps === 2 && step === 0 ? (
              <button type="button" onClick={next} className="btn-primary flex-1">
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  status === 'submitting' ||
                  genderBlocked ||
                  (!!companionId && !razorpayReady)
                }
                className="btn-primary flex-1"
              >
                {status === 'submitting'
                  ? 'Submitting…'
                  : genderBlocked
                  ? 'Payment unavailable'
                  : companionId && !razorpayReady
                  ? 'Loading payment…'
                  : companionId
                  ? 'Confirm & pay'
                  : 'Register'}
              </button>
            )}
          </div>
        </form>
      </div>

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
