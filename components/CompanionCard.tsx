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
    <a
      href={`/book/${companion.slug}`}
      className="block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-[#ffb703]/50 hover:bg-white/10"
    >
      <p className="font-serif text-lg font-bold text-white">{companion.name}</p>
      <p className="text-sm text-white/50">{companion.city}</p>
      <p className="mt-3 text-sm font-semibold text-[#ffb703]">
        {TIER_LABEL[companion.tier] ?? companion.tier}
      </p>
    </a>
  );
}
