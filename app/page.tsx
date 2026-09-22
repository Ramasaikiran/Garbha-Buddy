import Link from 'next/link';
import Script from 'next/script';
import { ShieldIcon, MatchIcon, LockIcon, ArrowIcon } from '@/components/icons';

const TIERS = [
  {
    name: 'Gold',
    price: '₹999',
    duration: '2 hours',
    blurb: 'Standard companion. Simple booking. Gate check-in.',
  },
  {
    name: 'Silver',
    price: '₹1,499',
    duration: '4 hours',
    blurb: '2+ years experience. Icebreaker call first. Crash course on arrival.',
  },
  {
    name: 'Diamond',
    price: '₹1,999',
    duration: 'Full night',
    blurb: 'Expert performer. Coordinated outfits. Escorted out too.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Find them',
    body: 'Browse by city. Or tap a link they shared.',
  },
  {
    n: '02',
    title: 'Book & pay',
    body: "Their fee only. Never the venue ticket.",
  },
  {
    n: '03',
    title: 'Check the face',
    body: "Match them to their photo. Say no if it's wrong.",
  },
  {
    n: '04',
    title: 'Dance',
    body: 'One code. That\u2019s check-in. Done.',
  },
];

const FAQS = [
  {
    q: 'How much does it cost?',
    a: 'Gold ₹999, Silver ₹1,499, Diamond ₹1,999. Venue entry is separate, paid directly to the venue.',
  },
  {
    q: 'Does Garba Buddy sell event tickets?',
    a: "No. We handle the companion booking. Venue entry is separate, that's between you and them.",
  },
  {
    q: 'How are companions verified?',
    a: 'ID checked. Selfie checked. Dance video checked. Our team reviews all three before they go live.',
  },
  {
    q: "What if the person who shows up isn't who I booked?",
    a: "Compare them to their photo. Doesn't match? Decline on the spot. Booking's cancelled, refund follows.",
  },
  {
    q: 'Can a companion be booked by women only?',
    a: "Yes. Some set that rule. Don't meet it? Payment's blocked before you can proceed.",
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
    <main style={{ background: 'var(--paper)' }} className="pb-20 sm:pb-0">
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* NAV */}
      <header
        className="sticky top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5"
        style={{ background: 'rgba(250, 247, 241, 0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="Garba Buddy" className="h-8 w-8 object-contain" />
          <span className="font-display text-lg font-semibold">Garba Buddy</span>
        </div>
        <nav className="hidden items-center gap-7 text-sm sm:flex" style={{ color: 'var(--ink-60)' }}>
          <Link href="/companion/register" style={{ color: 'var(--ink)' }}>
            Become a companion
          </Link>
          <Link href="/login" style={{ color: 'var(--ink)' }}>
            Log in
          </Link>
          <Link href="/browse" className="btn-primary !px-5 !py-2.5 !text-sm">
            Find a companion
          </Link>
        </nav>
        <div className="flex items-center gap-3 sm:hidden">
          <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Log in
          </Link>
          <Link href="/browse" className="btn-primary !px-4 !py-2 !text-sm">
            Book
          </Link>
        </div>
      </header>

      {/* Mobile sticky bottom CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t p-3 sm:hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <Link
          href="/login"
          className="btn-secondary shrink-0 !px-4 text-center"
        >
          Log in
        </Link>
        <Link href="/browse" className="btn-primary flex-1 text-center">
          Find a companion
        </Link>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-2xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <p
          className="reveal text-xs font-semibold uppercase tracking-[0.28em]"
          style={{ color: 'var(--gold)', animationDelay: '0ms' }}
        >
          Navratri 2026
        </p>

        <h1
          className="reveal font-display mt-5 text-5xl font-medium leading-[1.08] sm:text-6xl"
          style={{ animationDelay: '90ms' }}
        >
          New in the city?
          <br />
          Don't know anyone
          <br />
          to dance <span style={{ color: 'var(--gold)' }}>Garba</span> with?
        </h1>

        <div
          className="reveal mx-auto mt-8 max-w-md space-y-1 text-lg leading-snug"
          style={{ color: 'var(--ink-60)', animationDelay: '170ms' }}
        >
          <p>Book a verified local Garba companion.</p>
          <p>ID-checked. Face-matched. Paid safely.</p>
          <p style={{ color: 'var(--ink)', fontWeight: 600 }}>Just someone to dance with, nothing else.</p>
        </div>

        <div
          className="reveal mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium"
          style={{ color: 'var(--ink-60)', animationDelay: '210ms' }}
        >
          <span className="flex items-center gap-1.5">
            <ShieldIcon className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
            ID-verified
          </span>
          <span className="flex items-center gap-1.5">
            <MatchIcon className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
            Face-matched at the gate
          </span>
          <span className="flex items-center gap-1.5">
            <LockIcon className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
            Money held in escrow
          </span>
        </div>

        <div
          className="reveal mx-auto mt-10 max-w-sm space-y-3 text-left"
          style={{ animationDelay: '250ms' }}
        >
          <Link
            href="/browse"
            className="flex items-center justify-between rounded-2xl px-5 py-4 font-semibold transition hover:-translate-y-0.5"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}
          >
            <span>Find my companion →</span>
            <ArrowIcon className="h-4 w-4 shrink-0" />
          </Link>
          <Link
            href="/companion/register"
            className="flex items-center justify-between rounded-2xl border px-5 py-4 font-semibold transition hover:bg-white/60"
            style={{ borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
          >
            <span>Earn as a companion →</span>
            <ArrowIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>

        <p
          className="reveal mt-3 text-xs font-medium"
          style={{ color: 'var(--gold)' }}
        >
          Spots fill fast closer to Navratri, book early
        </p>

        <p
          className="reveal mt-10 text-xs tracking-wide"
          style={{ color: 'var(--ink-40)', animationDelay: '320ms' }}
        >
          Mumbai · Delhi NCR · Bengaluru · Hyderabad · Ahmedabad · Chennai · Pune · Jaipur · Surat · +40 more cities
        </p>
      </section>

      {/* THE PROBLEM */}
      <section className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-medium leading-tight sm:text-4xl">
            You moved for work.
            <br />
            Your dance circle didn't.
          </h2>
          <div className="mx-auto mt-6 max-w-sm space-y-1 text-base leading-snug" style={{ color: 'var(--ink-60)' }}>
            <p>Your college friends are three cities away.</p>
            <p>You barely know your neighbors, let alone a Garba partner.</p>
            <p>Navratri's here anyway.</p>
          </div>
          <p className="font-display mt-6 text-2xl font-medium" style={{ color: 'var(--gold)' }}>
            You shouldn't have to skip it.
          </p>
        </div>
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
                className="card relative p-8"
                style={i === 1 ? { borderColor: 'var(--gold)' } : undefined}
              >
                {i === 1 && (
                  <span
                    className="absolute -top-3 left-8 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide"
                    style={{ background: 'var(--gold)', color: 'var(--paper)' }}
                  >
                    Most popular
                  </span>
                )}
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
            Built for safety.
            <br />
            Not just fun.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {[
              [ShieldIcon, 'ID-verified', 'Aadhaar checked. Selfie checked. Before anyone goes live.'],
              [MatchIcon, 'Face-matched', "See them. Match them. Or walk away, you're covered."],
              [LockIcon, 'Held in escrow', 'We hold the money. Until the dance actually happens.'],
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

      {/* CLOSING CTA */}
      <section className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-medium leading-tight sm:text-4xl">
            Navratri's coming.
            <br />
            Fast.
          </h2>
          <p className="mx-auto mt-4 max-w-xs text-base" style={{ color: 'var(--ink-60)' }}>
            Don't spend it on the sidelines.
          </p>

          <div className="mx-auto mt-8 max-w-sm space-y-3 text-left">
            <Link
              href="/browse"
              className="flex items-center justify-between rounded-2xl px-5 py-4 font-semibold transition hover:-translate-y-0.5"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
            >
              <span>Find my companion →</span>
              <ArrowIcon className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href="/companion/register"
              className="flex items-center justify-between rounded-2xl border px-5 py-4 font-semibold transition hover:bg-white/60"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
            >
              <span>Earn as a companion →</span>
              <ArrowIcon className="h-4 w-4 shrink-0" />
            </Link>
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="Garba Buddy" className="h-5 w-5 object-contain" />
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
