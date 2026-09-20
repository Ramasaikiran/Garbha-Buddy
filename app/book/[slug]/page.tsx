import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import BookButton from './book-button';

const TIER_LABEL: Record<string, string> = {
  gold: 'Gold — ₹999 / 2hr',
  silver: 'Silver — ₹1,499 / 4hr',
  diamond: 'Diamond — ₹1,999 / full night',
};

async function getCompanion(slug: string) {
  const result = await db.query(
    `SELECT u.id, u.name, cm.city, cm.tier, cm.video_proof_url, cm.preference,
            cm.profile_photo_url, cm.bio
     FROM companions_meta cm
     JOIN users u ON u.id = cm.id
     WHERE cm.slug = $1`,
    [slug]
  );
  return result.rows[0] || null;
}

export default async function BookCompanionPage({ params }: { params: { slug: string } }) {
  const companion = await getCompanion(params.slug);
  if (!companion) notFound();

  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="card mx-auto max-w-lg p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Garba Buddy
        </p>
        {companion.profile_photo_url && (
          <img
            src={companion.profile_photo_url}
            alt={companion.name}
            className="mt-4 h-56 w-full rounded-xl object-cover"
            style={{ border: '1px solid var(--line)' }}
          />
        )}
        <h1 className="font-display mt-3 text-3xl font-medium">{companion.name}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--ink-60)' }}>{companion.city}</p>
        {companion.preference === 'girls_only' && (
          <span
            className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: 'rgba(122, 36, 56, 0.08)', color: 'var(--maroon)' }}
          >
            Girls only
          </span>
        )}

        {companion.bio && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
            {companion.bio}
          </p>
        )}

        <div className="mt-6 rounded-xl p-4" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-40)' }}>Tier</p>
          <p className="mt-1 font-medium" style={{ color: 'var(--gold)' }}>{TIER_LABEL[companion.tier]}</p>
        </div>

        <a
          href={companion.video_proof_url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block text-sm underline"
          style={{ color: 'var(--gold-deep)' }}
        >
          Watch dance proof video →
        </a>

        <BookButton companionId={companion.id} companionName={companion.name} />
      </div>
    </main>
  );
}
