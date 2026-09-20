'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TIER_LABEL: Record<string, string> = {
  gold: 'Gold — ₹999 / 2hr',
  silver: 'Silver — ₹1,499 / 4hr',
  diamond: 'Diamond — ₹1,999 / full night',
};

export default function CompanionProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  function load() {
    fetch('/api/companions/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setProfile(data.profile);
        setBio(data.profile.bio || '');
        setProfilePhotoUrl(data.profile.profile_photo_url || '');
      });
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (profile?.slug && typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/book/${profile.slug}`);
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/companions/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, profilePhotoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save');
      setSaved(true);
      load();
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareToWhatsApp() {
    const text = encodeURIComponent(`Book me for Garba this Navratri! ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  if (error && !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: 'var(--paper)' }}>
        <p style={{ color: 'var(--ink-60)' }}>
          {error} —{' '}
          <Link href="/login" className="underline" style={{ color: 'var(--gold-deep)' }}>
            log in
          </Link>
        </p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--paper)' }}>
        <p style={{ color: 'var(--ink-40)' }}>Loading…</p>
      </main>
    );
  }

  if (!profile.is_verified) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: 'var(--paper)' }}
      >
        <div className="card max-w-sm p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
            Verification pending
          </p>
          <h1 className="font-display mt-3 text-2xl font-medium">
            Your profile is under review
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
            Once our team approves your documents, you'll be able to add a
            photo and bio, and get your shareable booking link.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block text-sm underline"
            style={{ color: 'var(--gold-deep)' }}
          >
            ← Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl font-medium">Your profile</h1>
          <Link href="/dashboard" className="text-sm underline" style={{ color: 'var(--ink-40)' }}>
            ← Bookings
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Editable fields */}
          <form onSubmit={save} className="card space-y-4 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
              Edit
            </p>

            <label className="block">
              <span className="field-label">Profile photo (link)</span>
              <input
                type="url"
                value={profilePhotoUrl}
                onChange={(e) => setProfilePhotoUrl(e.target.value)}
                className="field-input"
                placeholder="A clear, public photo — shown to clients"
              />
            </label>

            <label className="block">
              <span className="field-label">Short bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                rows={4}
                className="field-input"
                placeholder="A line or two about your dance style, experience, or what makes booking you fun."
              />
              <span className="mt-1 block text-right text-xs" style={{ color: 'var(--ink-40)' }}>
                {bio.length}/500
              </span>
            </label>

            {error && <p className="text-sm" style={{ color: 'var(--maroon)' }}>{error}</p>}

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
            </button>
          </form>

          {/* Live preview */}
          <div className="card p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
              How clients see you
            </p>
            {profilePhotoUrl && (
              <img
                src={profilePhotoUrl}
                alt="Profile preview"
                className="mb-4 h-40 w-full rounded-xl object-cover"
                style={{ border: '1px solid var(--line)' }}
              />
            )}
            <p className="font-display text-xl font-medium">{profile.name}</p>
            <p className="text-sm" style={{ color: 'var(--ink-40)' }}>{profile.city}</p>
            <p className="mt-2 text-sm font-medium" style={{ color: 'var(--gold-deep)' }}>
              {TIER_LABEL[profile.tier]}
            </p>
            {bio && (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
                {bio}
              </p>
            )}
          </div>
        </div>

        {shareUrl && (
          <div className="card mt-6 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
              Your shareable link
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code
                className="rounded-lg px-3 py-2 text-xs"
                style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink-60)' }}
              >
                {shareUrl}
              </code>
              <button onClick={copyLink} className="btn-secondary !px-3 !py-1.5 !text-xs">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={shareToWhatsApp} className="btn-secondary !px-3 !py-1.5 !text-xs">
                Share on WhatsApp
              </button>
              <a href={shareUrl} target="_blank" rel="noreferrer" className="btn-secondary !px-3 !py-1.5 !text-xs">
                View public page
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
