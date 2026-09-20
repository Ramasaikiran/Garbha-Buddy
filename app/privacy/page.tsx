import Link from 'next/link';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Legal
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium">Privacy Policy</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-40)' }}>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>1. What we collect</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Name, gender, and phone number</li>
              <li>Aadhaar front and back images, and the last 4 digits only, never the full number</li>
              <li>A selfie, used to confirm identity in person at check-in</li>
              <li>For companions: a dance proof video, city, tier, and availability</li>
              <li>Booking details: dates, amounts, and status</li>
              <li>Messages exchanged in the in-app coordination chat, visible only to the two people on that booking</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>2. Why we collect it</h2>
            <p className="mt-2">
              Identity documents exist solely to verify who you are and to
              let the other party confirm they're meeting who they booked.
              We do not use your data for advertising, and we do not sell it
              to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>3. Who can see what</h2>
            <p className="mt-2">
              Your selfie is shown to the other party on a confirmed booking,
              for face-matching at check-in. Your Aadhaar images and last-4
              digits are visible only to our verification team, never to the
              other party. Our team reviews companion documents before
              approval.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>4. Payments</h2>
            <p className="mt-2">
              Payments are processed by Razorpay. We do not store your card
              or bank account details. That information is handled entirely
              by Razorpay's systems.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>5. How long we keep it</h2>
            <p className="mt-2">
              We retain identity and booking records for as long as your
              account is active and for a reasonable period after, to handle
              disputes, refunds, and legal obligations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>6. Your rights</h2>
            <p className="mt-2">
              Under India's Digital Personal Data Protection Act, you can ask
              us what personal data we hold about you, request corrections,
              or request deletion of your account and associated data,
              subject to our legal retention requirements. Reach us via the{' '}
              <Link href="/contact" className="underline" style={{ color: 'var(--gold-deep)' }}>
                Contact page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>7. Security</h2>
            <p className="mt-2">
              We use encrypted connections and access controls to protect
              your data. No system is perfectly secure, but we treat identity
              documents as our highest-sensitivity data category.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>8. Changes to this policy</h2>
            <p className="mt-2">
              We may update this policy from time to time. Material changes
              will be reflected here with an updated date at the top.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
