import Link from 'next/link';
import Script from 'next/script';

const TIERS = [
  {
    name: 'Gold',
    price: '₹999',
    duration: '2 hours',
    blurb: 'Standard social buddy. In-app profile unlock, venue gate check-in.',
  },
  {
    name: 'Silver',
    price: '₹1,499',
    duration: '4 hours',
    blurb: '2+ years experience. 5-min icebreaker call, 30-min garba crash course.',
  },
  {
    name: 'Diamond',
    price: '₹1,999',
    duration: 'Full night',
    blurb: 'Expert performer. Outfit coordination, reels, VIP escort to your cab.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Browse or share a link',
    body: 'Find a verified companion by city, or open a link a companion shared on their Instagram.',
  },
  {
    n: '02',
    title: 'Book & pay securely',
    body: "Register, confirm gender-match eligibility, pay the companion's fee — never the venue ticket.",
  },
  {
    n: '03',
    title: 'Match faces at the gate',
    body: "Compare your companion's registered selfie in person before you scan in. Wrong person shows up? Reject it, no questions asked.",
  },
  {
    n: '04',
    title: 'Dance the night away',
    body: 'OTP check-in confirms the booking. Coordinate ticket logistics right in the app chat beforehand.',
  },
];

const FAQS = [
  {
    q: 'Does Garba Buddy sell event tickets?',
    a: "No. Garba Buddy only books your dance companion's time. Venue entry passes are arranged separately, directly between you and your companion.",
  },
  {
    q: 'How are companions verified?',
    a: 'Every companion submits Aadhaar (front, back, last 4 digits) and a selfie, plus a dance proof video, all reviewed by our team before they go live.',
  },
  {
    q: 'What if a different person shows up instead of my booked companion?',
    a: "At check-in you compare the companion in front of you to their registered selfie. If it doesn't match, you reject it on the spot and the booking is cancelled.",
  },
  {
    q: 'Can I choose a companion who only accepts women?',
    a: "Yes. Some companions set a girls-only preference. If you don't match that preference, payment is disabled automatically before you can book.",
  },
];

export default function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main style={{ background: 'var(--ink)' }} className="relative overflow-hidden">
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Bandhani dot atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #ffb703 1.4px, transparent 1.4px), radial-gradient(circle, #ff3d6e 1.4px, transparent 1.4px)',
          backgroundSize: '26px 26px, 26px 26px',
          backgroundPosition: '0 0, 13px 13px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 -right-32 h-[28rem] w-[28rem] rounded-full opacity-25 blur-[110px]"
        style={{ background: 'var(--rani-pink)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full opacity-20 blur-[110px]"
        style={{ background: 'var(--marigold)' }}
      />

      {/* HERO */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center sm:pt-28">
        <DiyaMark className="reveal mx-auto h-16 w-16" style={{ animationDelay: '0ms' }} />

        <p
          className="reveal mt-6 text-xs font-semibold uppercase tracking-[0.4em]"
          style={{ color: 'var(--marigold)', animationDelay: '80ms' }}
        >
          This Navratri
        </p>

        <h1
          className="reveal font-display mt-4 text-[2.75rem] font-black leading-[1.05] sm:text-7xl"
          style={{ animationDelay: '150ms' }}
        >
          Never Garba
          <br />
          <span className="italic" style={{ color: 'var(--rani-pink)' }}>
            Alone.
          </span>
        </h1>

        <p
          className="reveal mx-auto mt-6 max-w-xl text-base text-white/60 sm:text-lg"
          style={{ animationDelay: '220ms' }}
        >
          Book a verified, ID-checked Garba dance companion for the night. Safe,
          chaperoned, face-matched at the gate — no standing alone on the sidelines.
        </p>

        <div
          className="reveal mt-9 flex flex-col justify-center gap-3 sm:flex-row"
          style={{ animationDelay: '300ms' }}
        >
          <Link
            href="/browse"
            className="rounded-full px-7 py-3 font-semibold text-[#1a0b2e] transition hover:-translate-y-0.5"
            style={{ background: 'var(--marigold)' }}
          >
            Find a companion
          </Link>
          <Link
            href="/companion/register"
            className="rounded-full border border-white/20 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Become a companion
          </Link>
        </div>

        <p
          className="reveal mt-6 text-xs uppercase tracking-widest text-white/35"
          style={{ animationDelay: '360ms' }}
        >
          Ahmedabad · Mumbai · Surat · Vadodara · Rajkot · Bengaluru · Delhi NCR
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section
        aria-labelledby="how-it-works"
        className="relative mx-auto max-w-5xl px-6 py-20"
      >
        <h2
          id="how-it-works"
          className="font-display text-center text-3xl font-bold sm:text-4xl"
        >
          How it works
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border p-6"
              style={{ borderColor: 'var(--thread)', background: 'rgba(255,255,255,0.03)' }}
            >
              <span
                className="font-display text-3xl font-black"
                style={{ color: 'var(--marigold)' }}
              >
                {s.n}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/55">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIERS */}
      <section aria-labelledby="tiers" className="relative mx-auto max-w-5xl px-6 py-20">
        <h2 id="tiers" className="font-display text-center text-3xl font-bold sm:text-4xl">
          Pick your tier
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {TIERS.map((t, i) => (
            <div
              key={t.name}
              className="relative rounded-3xl border p-7"
              style={{
                borderColor: i === 2 ? 'var(--marigold)' : 'var(--thread)',
                background:
                  i === 2
                    ? 'linear-gradient(160deg, rgba(255,183,3,0.12), rgba(255,61,110,0.08))'
                    : 'rgba(255,255,255,0.03)',
              }}
            >
              <p className="font-display text-xl font-bold" style={{ color: 'var(--marigold)' }}>
                {t.name}
              </p>
              <p className="mt-2 text-3xl font-black">{t.price}</p>
              <p className="text-sm text-white/45">{t.duration}</p>
              <p className="mt-4 text-sm text-white/60">{t.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY */}
      <section
        aria-labelledby="safety"
        className="relative mx-auto max-w-4xl px-6 py-20 text-center"
      >
        <h2 id="safety" className="font-display text-3xl font-bold sm:text-4xl">
          Built for safety, not just fun
        </h2>
        <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
          {[
            ['ID-verified', 'Aadhaar and selfie checked for every companion and attendee before booking.'],
            ['Face-matched', 'Compare your companion to their registered photo at the gate. Reject on mismatch.'],
            ['Escrow payments', "Money is held until the booking's completed — no upfront risk."],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="text-sm font-semibold" style={{ color: 'var(--mirror)' }}>
                {title}
              </p>
              <p className="mt-1 text-sm text-white/55">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="relative mx-auto max-w-3xl px-6 py-20">
        <h2 id="faq" className="font-display text-center text-3xl font-bold sm:text-4xl">
          Questions, answered
        </h2>
        <div className="mt-10 space-y-4">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border p-5"
              style={{ borderColor: 'var(--thread)' }}
            >
              <summary className="cursor-pointer list-none font-semibold marker:content-none">
                {f.q}
              </summary>
              <p className="mt-3 text-sm text-white/60">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/10 px-6 py-10 text-center">
        <p className="text-xs text-white/40">
          Garba Buddy is not responsible for venue entry passes. Ticket
          arrangements are settled directly between attendee and companion.
        </p>
        <nav className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-white/50">
          <Link href="/browse">Browse companions</Link>
          <Link href="/companion/register">Become a companion</Link>
          <Link href="/login">Log in</Link>
        </nav>
        <p className="mt-6 text-xs text-white/25">© {new Date().getFullYear()} Garba Buddy</p>
      </footer>
    </main>
  );
}

function DiyaMark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      role="img"
      aria-label="Garba Buddy diya lamp mark"
    >
      <ellipse cx="32" cy="46" rx="22" ry="8" fill="var(--rani-pink)" opacity="0.25" />
      <path d="M12 40 Q32 54 52 40 Q52 30 32 30 Q12 30 12 40Z" fill="var(--marigold)" />
      <ellipse cx="32" cy="30" rx="6" ry="3" fill="#1a0b2e" />
      <path
        d="M32 28 C29 22 30 16 32 10 C34 16 35 22 32 28Z"
        fill="var(--marigold-soft)"
        style={{ animation: 'flicker 2.4s ease-in-out infinite' }}
      />
    </svg>
  );
}
