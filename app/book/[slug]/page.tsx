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
    `SELECT u.id, u.name, cm.city, cm.tier, cm.video_proof_url, cm.preference
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
    <main className="min-h-screen bg-[#1a0b2e] px-4 py-12 text-white">
      <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm font-semibold tracking-[0.3em] text-[#ffb703]">
          NAVRATRI · GARBA BUDDY
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">{companion.name}</h1>
        <p className="mt-1 text-white/60">{companion.city}</p>
        {companion.preference === 'girls_only' && (
          <span className="mt-2 inline-block rounded-full bg-[#ff4d6d]/15 px-3 py-1 text-xs font-semibold text-[#ff4d6d]">
            Girls only
          </span>
        )}

        <div className="mt-5 rounded-xl bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-white/50">Tier</p>
          <p className="mt-1 font-semibold text-[#ffb703]">{TIER_LABEL[companion.tier]}</p>
        </div>

        <a
          href={companion.video_proof_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block text-sm text-[#ff4d6d] underline"
        >
          Watch dance proof video →
        </a>

        <BookButton companionId={companion.id} companionName={companion.name} />
      </div>
    </main>
  );
}
