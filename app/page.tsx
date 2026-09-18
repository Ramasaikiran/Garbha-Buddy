import Link from 'next/link';
import Script from 'next/script';
import { ShieldIcon, MatchIcon, LockIcon, ArrowIcon, DiyaMark } from '@/components/icons';

const TIERS = [
  {
    name: 'Gold',
    price: '₹999',
    duration: '2 hours',
    blurb: 'A standard social companion. Profile unlocked in-app, met at the gate.',
  },
  {
    name: 'Silver',
    price: '₹1,499',
    duration: '4 hours',
    blurb: '2+ years of experience. A short call beforehand, a crash course on arrival.',
  },
  {
    name: 'Diamond',
    price: '₹1,999',
    duration: 'Full night',
    blurb: 'An expert performer — coordinated outfits, a few captured moments, escorted out.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Find your companion',
    body: 'Browse verified profiles by city, or open a link one has shared directly with you.',
  },
  {
    n: '02',
    title: 'Book and pay',
    body: "Register, confirm eligibility, and pay the companion's fee — never the venue ticket.",
  },
  {
    n: '03',
    title: 'Confirm in person',
    body: 'Compare the person in front of you to their registered photo before you check in.',
  },
  {
    n: '04',
    title: 'Dance',
    body: 'Check in with a one-time code. Everything else is settled — just be there.',
  },
];

const FAQS = [
  {
    q: 'Does Garba Buddy sell event tickets?',
    a: "No. We only handle your companion's booking. Venue entry is arranged separately, directly between you and them.",
  },
  {
    q: 'How are companions verified?',
    a: 'Every companion submits ID and a photo, plus a short video, all reviewed by our team before appearing publicly.',
  },
  {
    q: "What if the person who shows up isn't who I booked?",
    a: "Compare them to their registered photo before checking in. If it doesn't match, decline on the spot — the booking is cancelled immediately.",
  },
  {
    q: 'Can a companion be booked by women only?',
    a: "Yes. Some set that preference. If you don't meet it, payment is disabled before you can proceed.",
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
    <main style={{ background: 'var(--paper)' }}>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* NAV */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <DiyaMark className="h-6 w-6" />
          <span className="font-display text-lg font-semibold">Garba Buddy</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm sm:flex" style={{ color: 'var(--ink-60)' }}>
          <Link href="/browse" className="hover:text-current" style={{ color: 'var(--ink)' }}>
            Browse
          </Link>
          <Link href="/companion/register" style={{ color: 'var(--ink)' }}>
            Become a companion
          </Link>
          <Link href="/login" style={{ color: 'var(--ink)' }}>
            Log in
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-3xl px-6 pb-28 pt-16 text-center sm:pt-24">
        <p
          className="reveal text-xs font-semibold uppercase tracking-[0.28em]"
          style={{ color: 'var(--gold)', animationDelay: '0ms' }}
        >
          This Navratri
        </p>

        <h1
          className="reveal font-display mt-5 text-5xl font-medium leading-[1.06] sm:text-7xl"
          style={{ animationDelay: '90ms' }}
        >
          Never garba
          <br />
          <em className="not-italic" style={{ color: 'var(--gold)' }}>
            alone.
          </em>
        </h1>

        <p
          className="reveal mx-auto mt-7 max-w-lg text-lg leading-relaxed"
          style={{ color: 'var(--ink-60)', animationDelay: '170ms' }}
        >
          Book a verified dance companion for the night. Identity-checked,
          face-matched at the gate, and paid for safely — nothing more.
        </p>

        <div
          className="reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: '250ms' }}
        >
          <Link href="/browse" className="btn-primary">
            Find a companion
            <ArrowIcon className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/companion/register" className="btn-secondary">
            Become a companion
          </Link>
        </div>

        <p
          className="reveal mt-10 text-xs tracking-wide"
          style={{ color: 'var(--ink-40)', animationDelay: '320ms' }}
        >
          Ahmedabad · Mumbai · Surat · Vadodara · Rajkot · Bengaluru · Delhi NCR
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section aria-labelledby="how-it-works" className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 id="how-it-works" className="font-display text-3xl font-medium sm:text-4xl">
            How it works
          </h2>
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span
                  className="font-display block text-sm font-medium"
                  style={{ color: 'var(--gold)' }}
                >
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section aria-labelledby="tiers" className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 id="tiers" className="font-display text-3xl font-medium sm:text-4xl">
            Choose a tier
          </h2>
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {TIERS.map((t, i) => (
              <div
                key={t.name}
                className="card p-8"
                style={i === 2 ? { borderColor: 'var(--gold)' } : undefined}
              >
                <p className="font-display text-base font-medium" style={{ color: 'var(--gold)' }}>
                  {t.name}
                </p>
                <p className="font-display mt-3 text-4xl font-medium">{t.price}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--ink-40)' }}>
                  {t.duration}
                </p>
                <div className="my-5 h-px" style={{ background: 'var(--line)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
                  {t.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section aria-labelledby="safety" className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 id="safety" className="font-display max-w-md text-3xl font-medium sm:text-4xl">
            Built for safety, not just for fun
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {[
              [ShieldIcon, 'ID-verified', 'Government ID and a photo checked for every companion and attendee before booking.'],
              [MatchIcon, 'Face-matched', 'Compare your companion to their registered photo at the gate. Decline on mismatch.'],
              [LockIcon, 'Held in escrow', "Payment is released only once the booking's complete — no upfront risk."],
            ].map(([Icon, title, body]: any) => (
              <div key={title}>
                <Icon className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                <p className="mt-4 text-base font-semibold">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 id="faq" className="font-display text-3xl font-medium sm:text-4xl">
            Questions
          </h2>
          <div className="mt-10 divide-y" style={{ borderColor: 'var(--line)' }}>
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5" style={{ borderColor: 'var(--line)' }}>
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium marker:content-none">
                  {f.q}
                  <ArrowIcon className="h-4 w-4 rotate-90 transition-transform group-open:-rotate-90" style={{ color: 'var(--ink-40)' }} />
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="max-w-md text-xs leading-relaxed" style={{ color: 'var(--ink-40)' }}>
            Garba Buddy is not responsible for venue entry passes. Ticket
            arrangements are settled directly between attendee and companion.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <DiyaMark className="h-4 w-4" />
              <span className="text-sm font-medium">Garba Buddy</span>
            </div>
            <nav className="flex flex-wrap gap-6 text-xs" style={{ color: 'var(--ink-60)' }}>
              <Link href="/browse">Browse</Link>
              <Link href="/companion/register">Become a companion</Link>
              <Link href="/login">Log in</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/refund-policy">Refunds</Link>
            </nav>
            <p className="text-xs" style={{ color: 'var(--ink-40)' }}>
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
