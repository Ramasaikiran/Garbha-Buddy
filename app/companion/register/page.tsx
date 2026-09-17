'use client';

import { useState } from 'react';
import { CheckIcon } from '@/components/icons';

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
            Register once, get your own booking link to share.
          </p>
        </div>

        {result ? (
          <div className="card p-8 text-center">
            <CheckIcon className="mx-auto h-8 w-8" style={{ color: 'var(--gold)' }} />
            <h2 className="font-display mt-4 text-2xl font-medium">You're live</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-60)' }}>
              Share this link on Instagram, WhatsApp status, or your bio.
              Anyone who books through it comes straight to you.
            </p>
            <div
              className="mt-6 flex items-center gap-2 rounded-xl p-3"
              style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
            >
              <code className="flex-1 truncate text-left text-sm" style={{ color: 'var(--ink)' }}>
                {result.shareableLink}
              </code>
              <button onClick={copyLink} className="btn-primary shrink-0 !px-4 !py-1.5 !text-xs">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
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
                  value={form.phoneNumber}
                  onChange={(e) => update('phoneNumber', e.target.value)}
                  className="field-input"
                  placeholder="98765 43210"
                />
              </Field>
            </div>

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
            </div>

            <Field label="Dance proof video (link)">
              <input
                required
                value={form.videoProofUrl}
                onChange={(e) => update('videoProofUrl', e.target.value)}
                className="field-input"
                placeholder="Drive/Instagram link showing you dance"
              />
            </Field>

            <div className="rounded-xl p-5" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
                Identity verification — kept private, used for on-site matching
              </p>
              <div className="space-y-4">
                <Field label="Aadhaar front (upload link)">
                  <input
                    required
                    value={form.aadhaarFrontUrl}
                    onChange={(e) => update('aadhaarFrontUrl', e.target.value)}
                    className="field-input"
                    placeholder="Link to Aadhaar front image"
                  />
                </Field>
                <Field label="Aadhaar back (upload link)">
                  <input
                    required
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
                    value={form.selfieUrl}
                    onChange={(e) => update('selfieUrl', e.target.value)}
                    className="field-input"
                    placeholder="Clear face photo, matched at check-in"
                  />
                </Field>
              </div>
            </div>

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

            <Field label="Available dates (comma-separated)">
              <input
                value={form.availabilityDates}
                onChange={(e) => update('availabilityDates', e.target.value)}
                className="field-input"
                placeholder="2026-10-12, 2026-10-13"
              />
            </Field>

            {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}

            <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
              {status === 'submitting' ? 'Registering…' : 'Get my booking link'}
            </button>
          </form>
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
