import Link from 'next/link';

export const metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Legal
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium">Terms & Conditions</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-40)' }}>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>1. What Garba Buddy is</h2>
            <p className="mt-2">
              Garba Buddy connects solo Navratri attendees ("clients") with
              verified local dance companions ("companions") for paid,
              time-boxed bookings. We are a booking and matching platform;
              we are not an event organizer and do not sell venue tickets.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>2. Eligibility & identity verification</h2>
            <p className="mt-2">
              Both clients and companions must be 18 or older and must
              provide a government ID (Aadhaar) and a clear selfie for
              verification. Companions are additionally reviewed and approved
              by our team before appearing on the platform. Providing false
              identity information is grounds for immediate account
              termination.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>3. Ticket liability</h2>
            <p className="mt-2">
              Garba Buddy is not responsible for venue entry passes. All
              ticket arrangements are settled directly between the client and
              companion, independent of the fee paid on this platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>4. Gender-preference matching</h2>
            <p className="mt-2">
              Companions may restrict who can book them (e.g., "girls only").
              This preference is enforced automatically at booking, and
              payment is disabled for clients who don't meet it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>5. Payments & escrow</h2>
            <p className="mt-2">
              Payments are processed via Razorpay and held until the booking
              is marked complete at check-in. Companions are paid out
              afterward, minus the platform's commission. See our{' '}
              <Link href="/refund-policy" className="underline" style={{ color: 'var(--gold-deep)' }}>
                Refund Policy
              </Link>{' '}
              for cancellations and disputes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>6. On-site conduct & check-in</h2>
            <p className="mt-2">
              At check-in, clients confirm the companion's identity against
              their registered photo before entering the one-time code. A
              reported mismatch cancels the booking immediately. Both parties
              agree to behave respectfully; harassment, coercion, or unsafe
              conduct by either party may result in a permanent ban and, where
              applicable, referral to law enforcement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>7. Prohibited use</h2>
            <p className="mt-2">
              The platform may not be used for any purpose other than booking
              a dance companion for Navratri events, including, without
              limitation, solicitation of any other services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>8. Limitation of liability</h2>
            <p className="mt-2">
              Garba Buddy facilitates introductions and payments but is not
              party to, and disclaims liability for, the conduct of clients
              and companions once a booking is confirmed, to the maximum
              extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>9. Governing law</h2>
            <p className="mt-2">
              These terms are governed by the laws of India. Any dispute is
              subject to the exclusive jurisdiction of the courts where
              Garba Buddy is registered.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>10. Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use of
              the platform after changes take effect constitutes acceptance.
              Questions? Reach us on our{' '}
              <Link href="/contact" className="underline" style={{ color: 'var(--gold-deep)' }}>
                Contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
