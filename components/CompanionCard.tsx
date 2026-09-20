import { ArrowIcon } from '@/components/icons';

const TIER_LABEL: Record<string, string> = {
  gold: 'Gold — ₹999',
  silver: 'Silver — ₹1,499',
  diamond: 'Diamond — ₹1,999',
};

export default function CompanionCard({
  companion,
}: {
  companion: {
    name: string;
    city: string;
    tier: string;
    slug: string;
    profile_photo_url?: string;
    bio?: string;
  };
}) {
  return (
    <a href={`/book/${companion.slug}`} className="card group flex items-center gap-4 p-5">
      {companion.profile_photo_url ? (
        <img
          src={companion.profile_photo_url}
          alt={companion.name}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
          style={{ border: '1px solid var(--line)' }}
        />
      ) : (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-medium"
          style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--gold)' }}
        >
          {companion.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-display truncate text-lg font-medium">{companion.name}</p>
        <p className="text-sm" style={{ color: 'var(--ink-40)' }}>{companion.city}</p>
        <p className="mt-1 text-sm font-medium" style={{ color: 'var(--gold)' }}>
          {TIER_LABEL[companion.tier] ?? companion.tier}
        </p>
      </div>
      <ArrowIcon
        className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: 'var(--ink-40)' }}
      />
    </a>
  );
}
