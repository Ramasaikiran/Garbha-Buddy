import Link from 'next/link';

export const metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          About us
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium">Garba Buddy</h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed" style={{ color: 'var(--ink-60)' }}>
          <p>
            Garba Buddy is a Navratri dance-companion booking platform. We
            connect solo attendees — people new to a city, without a regular
            dance circle, or simply looking for a safe companion for the
            night — with verified local Garba and Dandiya dancers who want to
            earn from a skill they already have.
          </p>
          <p>
            Every companion on the platform is identity-verified before they
            go live: a government ID, a selfie, and a short dance video,
            reviewed by our team. That same selfie is shown to the attendee
            at check-in, so they can confirm in person that the right
            companion has shown up before the booking is marked complete.
          </p>
          <p>
            We handle only the companion's booking fee — never venue entry
            tickets, which are arranged directly between the attendee and
            their companion. Payments are held in escrow via Razorpay and
            released to the companion once the booking is confirmed
            complete.
          </p>
          <p>
            We currently operate across Ahmedabad, Mumbai, Surat, Vadodara,
            Rajkot, Bengaluru, and Delhi NCR.
          </p>
        </div>

        <p className="mt-10 text-sm" style={{ color: 'var(--ink-40)' }}>
          Questions or partnership enquiries — see our{' '}
          <Link href="/contact" className="underline" style={{ color: 'var(--gold-deep)' }}>
            Contact page
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
