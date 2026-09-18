'use client';

import { useState } from 'react';

const CITIES = ['Ahmedabad', 'Mumbai', 'Surat', 'Vadodara', 'Rajkot', 'Bengaluru', 'Delhi NCR'];
const TIERS = [
  { value: 'gold', label: 'Gold — ₹999 / 2hr' },
  { value: 'silver', label: 'Silver — ₹1,499 / 4hr' },
  { value: 'diamond', label: 'Diamond — ₹1,999 / full night' },
];

export default function CompanionRegisterPage() {
  const [form, setForm] = useState({
    name: '',
    gender: '',
    email: '',
    phoneNumber: '',
    city: CITIES[0],
    tier: 'gold',
    videoProofUrl: '',
    preference: 'everyone',
    availabilityDates: '',
    aadhaarFrontUrl: '',
    aadhaarBackUrl: '',
    aadhaarLast4: '',
    selfieUrl: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ slug: string; shareableLink: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch('/api/companions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          availabilityDates: form.availabilityDates
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean),
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

  function copyLink() {
    if (!result) return;
    navigator.clipboard.writeText(result.shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[#1a0b2e] relative overflow-hidden px-4 py-12">
      {/* Bandhani-dot backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, #ffb703 1.5px, transparent 1.5px), radial-gradient(circle, #ff4d6d 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px, 28px 28px',
          backgroundPosition: '0 0, 14px 14px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#ff4d6d] blur-[100px] opacity-30" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#ffb703] blur-[100px] opacity-20" />

      <div className="relative mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold tracking-[0.3em] text-[#ffb703]">
            NAVRATRI · GARBA BUDDY
          </p>
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Dance for Money.
            <br />
            <span className="text-[#ff4d6d]">Get Discovered.</span>
          </h1>
          <p className="mt-3 text-white/60">
            Register as a companion. Get your own booking link to share.
          </p>
        </div>

        {result ? (
          <div className="rounded-2xl border border-[#ffb703]/30 bg-white/5 p-8 text-center backdrop-blur">
            <p className="text-4xl">🪩</p>
            <h2 className="mt-3 font-serif text-2xl font-bold text-white">You're live!</h2>
            <p className="mt-2 text-sm text-white/60">
              Share this link on Instagram, WhatsApp status, or your bio.
              Anyone who books through it comes straight to you.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-black/30 p-3">
              <code className="flex-1 truncate text-left text-sm text-[#ffb703]">
                {result.shareableLink}
              </code>
              <button
                onClick={copyLink}
                className="shrink-0 rounded-lg bg-[#ff4d6d] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#ff2e52]"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8"
          >
            <Field label="Full name">
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="input"
                placeholder="Priya Patel"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <select
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="input"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Your tier">
                <select
                  value={form.tier}
                  onChange={(e) => update('tier', e.target.value)}
                  className="input"
                >
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Dance proof video (link)">
              <input
                required
                value={form.videoProofUrl}
                onChange={(e) => update('videoProofUrl', e.target.value)}
                className="input"
                placeholder="Drive/Instagram link showing you dance"
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

            <Field label="Who can book you">
              <select
                value={form.preference}
                onChange={(e) => update('preference', e.target.value)}
                className="input"
              >
                <option value="everyone">Everyone</option>
                <option value="girls_only">Girls only</option>
              </select>
            </Field>

            <Field label="Available dates (comma-separated)">
              <input
                value={form.availabilityDates}
                onChange={(e) => update('availabilityDates', e.target.value)}
                className="input"
                placeholder="2026-10-12, 2026-10-13"
              />
            </Field>

            {error && <p className="text-sm text-[#ff4d6d]">{error}</p>}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-xl bg-[#ffb703] py-3 font-semibold text-[#1a0b2e] transition hover:bg-[#ffc93c] disabled:opacity-50"
            >
              {status === 'submitting' ? 'Registering…' : 'Get my booking link'}
            </button>
          </form>
        )}
      </div>

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
