import Link from 'next/link';

export const metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Get in touch
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium">Contact us</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
          For bookings, refunds, safety concerns, or anything else, call,
          WhatsApp, or email us directly.
        </p>

        <div className="card mt-8 p-6">
          <p className="field-label">Phone / WhatsApp</p>
          <a
            href="tel:+916303728397"
            className="font-display block text-2xl font-medium"
            style={{ color: 'var(--gold-deep)' }}
          >
            +91 63037 28397
          </a>
          <a
            href="https://wa.me/916303728397"
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-4 inline-block !px-5 !py-2.5 !text-sm"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="card mt-4 p-6">
          <p className="field-label">Email</p>
          <a
            href="mailto:contact@garbabuddy.lol"
            className="font-display block text-2xl font-medium"
            style={{ color: 'var(--gold-deep)' }}
          >
            contact@garbabuddy.lol
          </a>
        </div>

        <p className="mt-6 text-xs leading-relaxed" style={{ color: 'var(--ink-40)' }}>
          For a mismatched-companion report or a refund request, see our{' '}
          <Link href="/refund-policy" className="underline" style={{ color: 'var(--ink-60)' }}>
            Refund Policy
          </Link>{' '}
          for the fastest path to resolution.
        </p>
      </div>
    </main>
  );
}
