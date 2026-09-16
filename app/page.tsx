import Link from 'next/link';

const TIERS = [
  { name: 'Gold', price: '₹999', duration: '2 hours' },
  { name: 'Silver', price: '₹1,499', duration: '4 hours' },
  { name: 'Diamond', price: '₹1,999', duration: 'Full night' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1a0b2e] px-4 py-16 text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, #ffb703 1.5px, transparent 1.5px), radial-gradient(circle, #ff4d6d 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px, 28px 28px',
          backgroundPosition: '0 0, 14px 14px',
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-[0.3em] text-[#ffb703]">
          THIS NAVRATRI
        </p>
        <h1 className="mt-3 font-serif text-5xl font-bold sm:text-6xl">
          Never Garba Alone.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          Book a verified local dance companion for the night. Safe, chaperoned,
          no awkward solo standing on the sidelines.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/browse"
            className="rounded-xl bg-[#ffb703] px-6 py-3 font-semibold text-[#1a0b2e] transition hover:bg-[#ffc93c]"
          >
            Find a companion
          </Link>
          <Link
            href="/companion/register"
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Become a companion
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="font-serif text-xl font-bold text-[#ffb703]">{t.name}</p>
              <p className="mt-1 text-2xl font-bold">{t.price}</p>
              <p className="mt-1 text-sm text-white/50">{t.duration}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-white/40">
          Garba Buddy is not responsible for venue entry passes. Ticket
          arrangements are settled between attendee and companion.
        </p>
      </div>
    </main>
  );
}
