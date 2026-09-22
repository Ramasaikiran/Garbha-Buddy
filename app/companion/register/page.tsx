'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon } from '@/components/icons';

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Amritsar', 'Navi Mumbai', 'Prayagraj',
  'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
  'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Thiruvananthapuram', 'Kochi',
  'Mysuru', 'Dehradun', 'Noida', 'Gurugram', 'Gandhinagar', 'Anand', 'Bhavnagar', 'Jamnagar',
];
const TIERS = [
  { value: 'gold', label: 'Gold · ₹999 / 2hr' },
  { value: 'silver', label: 'Silver · ₹1,499 / 4hr' },
  { value: 'diamond', label: 'Diamond · ₹1,999 / full night' },
];
const STEP_LABELS = ['Basics', 'Dance & pricing', 'Verify identity'];

export default function CompanionRegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    city: CITIES[0],
    tier: 'gold',
    videoProofUrl: '',
    preference: 'everyone',
    availabilityDates: [''] as string[],
    aadhaarFrontUrl: '',
    aadhaarBackUrl: '',
    aadhaarLast4: '',
    selfieUrl: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ slug: string; shareableLink: string } | null>(null);

  const [emailOtpStatus, setEmailOtpStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailDevOtp, setEmailDevOtp] = useState<string | null>(null);
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  async function sendEmailOtp() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setEmailOtpError('Enter a valid email address first');
      return;
    }
    setEmailOtpStatus('sending');
    setEmailOtpError('');
    try {
      const res = await fetch('/api/auth/registration/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send code');
      setEmailDevOtp(data.devOtp || null);
      setEmailOtpStatus('sent');
    } catch (err: any) {
      setEmailOtpError(err.message);
      setEmailOtpStatus('idle');
    }
  }

  async function verifyEmailOtp() {
    setEmailOtpStatus('verifying');
    setEmailOtpError('');
    try {
      const res = await fetch('/api/auth/registration/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: emailOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not verify code');
      setEmailVerificationToken(data.verificationToken);
      setVerifiedEmail(form.email);
      setEmailOtpStatus('verified');
    } catch (err: any) {
      setEmailOtpError(err.message);
      setEmailOtpStatus('sent');
    }
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'email' && value !== verifiedEmail) {
      setEmailOtpStatus('idle');
      setEmailVerificationToken(null);
      setEmailOtp('');
    }
  }

  function updateDate(index: number, value: string) {
    setForm((f) => {
      const dates = [...f.availabilityDates];
      dates[index] = value;
      return { ...f, availabilityDates: dates };
    });
  }

  function addDateSlot() {
    setForm((f) => ({ ...f, availabilityDates: [...f.availabilityDates, ''] }));
  }

  function removeDateSlot(index: number) {
    setForm((f) => ({
      ...f,
      availabilityDates: f.availabilityDates.filter((_, i) => i !== index),
    }));
  }

  function stepValid(s: number) {
    if (s === 0)
      return (
        form.name &&
        form.gender &&
        form.phoneNumber.length === 10 &&
        form.email &&
        emailOtpStatus === 'verified' &&
        form.password.length >= 8 &&
        form.password === form.confirmPassword
      );
    if (s === 1) return form.videoProofUrl;
    if (s === 2) return form.aadhaarFrontUrl && form.aadhaarBackUrl && form.selfieUrl;
    return true;
  }

  function next() {
    if (!stepValid(step)) {
      setError('Fill in the required fields to continue.');
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, 2));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stepValid(2)) {
      setError('Fill in the required fields to continue.');
      return;
    }
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch('/api/companions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          availabilityDates: form.availabilityDates.filter(Boolean),
          emailVerificationToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setResult({ slug: data.slug, shareableLink: data.shareableLink });
      setStatus('idle');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
            Become a companion
          </p>
          <h1 className="font-display mt-4 text-4xl font-medium leading-tight">
            Dance for pay.
            <br />
            Get discovered.
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--ink-60)' }}>
            Three quick steps, then get your own booking link to share.
          </p>
        </div>

        {result ? (
          <div className="card p-8 text-center">
            <CheckIcon className="mx-auto h-8 w-8" style={{ color: 'var(--gold)' }} />
            <h2 className="font-display mt-4 text-2xl font-medium">Registration submitted</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-60)' }}>
              Our team reviews your ID and dance video before your profile goes
              live. You'll be able to get your shareable booking link and
              manage your profile once approved.
            </p>
            <p className="mt-6 text-sm" style={{ color: 'var(--ink-40)' }}>
              Log in anytime at{' '}
              <Link href="/login" className="underline" style={{ color: 'var(--gold-deep)' }}>
                garbabuddy.lol/login
              </Link>{' '}
              to check your approval status.
            </p>
          </div>
        ) : (
          <div className="card p-6 sm:p-8">
            {/* Progress */}
            <div className="mb-7">
              <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--ink-40)' }}>
                {STEP_LABELS.map((label, i) => (
                  <span key={label} style={i === step ? { color: 'var(--gold-deep)' } : undefined}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / 3) * 100}%`, background: 'var(--gold)' }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 0 && (
                <>
                  <Field label="Full name">
                    <input
                      required
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className="field-input"
                      placeholder="Priya Patel"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
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
                    <Field label="Phone number">
                      <input
                        required
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phoneNumber}
                        onChange={(e) =>
                          update('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        className="field-input"
                        placeholder="9876543210"
                      />
                      {form.phoneNumber.length > 0 && form.phoneNumber.length < 10 && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--ink-40)' }}>
                          Enter all 10 digits
                        </p>
                      )}
                    </Field>
                  </div>
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

                  {emailOtpStatus === 'verified' ? (
                    <p className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gold-deep)' }}>
                      <CheckIcon className="h-3.5 w-3.5" /> Email verified
                    </p>
                  ) : emailOtpStatus === 'sent' || emailOtpStatus === 'verifying' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="field-input flex-1"
                          placeholder="6-digit code"
                        />
                        <button
                          type="button"
                          onClick={verifyEmailOtp}
                          disabled={emailOtpStatus === 'verifying' || emailOtp.length !== 6}
                          className="btn-primary !px-4 !text-xs"
                        >
                          {emailOtpStatus === 'verifying' ? 'Verifying…' : 'Verify'}
                        </button>
                      </div>
                      {emailDevOtp && (
                        <p className="text-xs" style={{ color: 'var(--gold-deep)' }}>
                          Email not connected yet. Your test code is <strong>{emailDevOtp}</strong>.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={sendEmailOtp}
                        className="text-xs underline"
                        style={{ color: 'var(--ink-40)' }}
                      >
                        Resend code
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={sendEmailOtp}
                      disabled={emailOtpStatus === 'sending' || !form.email}
                      className="btn-secondary !px-4 !py-2 !text-xs"
                    >
                      {emailOtpStatus === 'sending' ? 'Sending…' : 'Send verification code'}
                    </button>
                  )}
                  {emailOtpError && <p className="text-xs" style={{ color: 'var(--maroon)' }}>{emailOtpError}</p>}

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Password">
                      <input
                        required
                        type="password"
                        minLength={8}
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        className="field-input"
                        placeholder="Min 8 characters"
                      />
                    </Field>
                    <Field label="Confirm password">
                      <input
                        required
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        className="field-input"
                        placeholder="Re-enter password"
                      />
                    </Field>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs" style={{ color: 'var(--maroon)' }}>Passwords don't match</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City">
                      <select
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        className="field-input"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Who can book you">
                      <select
                        value={form.preference}
                        onChange={(e) => update('preference', e.target.value)}
                        className="field-input"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="girls_only">Girls only</option>
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Your tier">
                    <select
                      value={form.tier}
                      onChange={(e) => update('tier', e.target.value)}
                      className="field-input"
                    >
                      {TIERS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Dance proof video (link)">
                    <input
                      required
                      type="url"
                      value={form.videoProofUrl}
                      onChange={(e) => update('videoProofUrl', e.target.value)}
                      className="field-input"
                      placeholder="Drive/Instagram link showing you dance"
                    />
                  </Field>
                  <div>
                    <span className="field-label">Available dates</span>
                    <div className="space-y-2">
                      {form.availabilityDates.map((date, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => updateDate(i, e.target.value)}
                            className="field-input flex-1"
                          />
                          {form.availabilityDates.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDateSlot(i)}
                              className="btn-secondary !px-3"
                              aria-label="Remove date"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addDateSlot}
                      className="mt-2 text-xs font-medium underline"
                      style={{ color: 'var(--gold-deep)' }}
                    >
                      + Add another date
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="rounded-xl p-5" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
                    Kept private, used only for on-site matching
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
              )}

              {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}

              <div className="flex gap-3 pt-1">
                {step > 0 && (
                  <button type="button" onClick={back} className="btn-secondary flex-1">
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button type="button" onClick={next} className="btn-primary flex-1">
                    Continue
                  </button>
                ) : (
                  <button type="submit" disabled={status === 'submitting'} className="btn-primary flex-1">
                    {status === 'submitting' ? 'Registering…' : 'Get my booking link'}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
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
