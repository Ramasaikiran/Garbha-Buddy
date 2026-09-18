import { ArrowIcon } from '@/components/icons';

const TIER_LABEL: Record<string, string> = {
  gold: 'Gold — ₹999',
  silver: 'Silver — ₹1,499',
  diamond: 'Diamond — ₹1,999',
};

export default function CompanionCard({
  companion,
}: {
  companion: { name: string; city: string; tier: string; slug: string };
}) {
  return (
    <a href={`/book/${companion.slug}`} className="card group flex items-center justify-between p-5">
      <div>
        <p className="font-display text-lg font-medium">{companion.name}</p>
        <p className="text-sm" style={{ color: 'var(--ink-40)' }}>{companion.city}</p>
        <p className="mt-2 text-sm font-medium" style={{ color: 'var(--gold)' }}>
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
