import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const SITE_URL = 'https://garbabuddy.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Garba Buddy — Book a Verified Garba Dance Companion This Navratri',
    template: '%s | Garba Buddy',
  },
  description:
    'Find a verified, ID-checked Garba and Dandiya dance companion for Navratri. Safe, chaperoned bookings in Ahmedabad, Mumbai, Surat, Vadodara, Rajkot, Bengaluru and Delhi NCR.',
  keywords: [
    'Garba companion',
    'Garba buddy',
    'Navratri dance partner',
    'Dandiya partner booking',
    'Garba dance companion Ahmedabad',
    'Navratri companion app',
    'solo Garba attendee',
    'verified dance companion India',
  ],
  authors: [{ name: 'Garba Buddy' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Garba Buddy',
    title: 'Garba Buddy — Never Garba Alone',
    description:
      'Book a verified, ID-checked local dance companion for Navratri. Safe, chaperoned, no awkward solo standing on the sidelines.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Garba Buddy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garba Buddy — Never Garba Alone',
    description: 'Book a verified local Garba dance companion this Navratri.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Garba Buddy',
    serviceType: 'Dance companion booking',
    areaServed: [
      'Ahmedabad',
      'Mumbai',
      'Surat',
      'Vadodara',
      'Rajkot',
      'Bengaluru',
      'Delhi NCR',
    ],
    provider: { '@type': 'Organization', name: 'Garba Buddy', url: SITE_URL },
    offers: [
      { '@type': 'Offer', name: 'Gold', price: '999', priceCurrency: 'INR' },
      { '@type': 'Offer', name: 'Silver', price: '1499', priceCurrency: 'INR' },
      { '@type': 'Offer', name: 'Diamond', price: '1999', priceCurrency: 'INR' },
    ],
  };

  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
