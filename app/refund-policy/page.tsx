import Link from 'next/link';

export const metadata = { title: 'Refund Policy' };

export default function RefundPolicyPage() {
  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Legal
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium">Refund Policy</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-40)' }}>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose mt-10 space-y-8 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>
              What this payment covers
            </h2>
            <p className="mt-2">
              The amount you pay through Garba Buddy is strictly the companion's
              fee for the tier you booked (Gold, Silver, or Diamond). It does
              not include, and is never applied toward, the venue's Garba or
              Dandiya entry ticket. Ticket arrangements are made separately,
              directly between you and your companion.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>
              When a refund is issued
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong style={{ color: 'var(--ink)' }}>Companion mismatch.</strong> If the
                person who arrives doesn't match the companion's registered
                photo and you report it at check-in, your booking is cancelled
                immediately and a full refund is processed.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Companion no-show.</strong> If your
                companion doesn't arrive within a reasonable window of the
                agreed time and doesn't respond in the in-app chat, contact us
                for a full refund.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Failed or duplicate payment.</strong>{' '}
                Any amount charged due to a payment gateway error that didn't
                result in an active booking is refunded automatically, or on
                request if it isn't.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Cancellation before check-in.</strong>{' '}
                If you cancel more than 24 hours before the booked date, you're
                eligible for a full refund. Cancellations within 24 hours are
                refunded at our discretion, since the companion has likely
                already reserved that time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>
              What isn't refundable
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Venue entry tickets — Garba Buddy never sells or holds these funds.</li>
              <li>
                A completed booking (checked in via OTP) where the companion
                attended as booked — the service was delivered.
              </li>
              <li>Amounts already paid out to a companion for a completed, undisputed booking.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>
              How to request one
            </h2>
            <p className="mt-2">
              Reach us via the details on our{' '}
              <Link href="/contact" className="underline" style={{ color: 'var(--gold-deep)' }}>
                Contact page
              </Link>
              . Refunds, once approved, are credited back to your original
              payment method within 5–7 business days, subject to your bank
              or payment provider's processing time.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
