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

const SITE_URL = 'https://www.garbabuddy.lol';

export const viewport = {
  themeColor: '#150826',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Garba Buddy: Book a Verified Garba Dance Companion This Navratri',
    template: '%s | Garba Buddy',
  },
  description:
    'No Garba partner this Navratri? Book a verified, ID-checked dance companion near you. Safe, chaperoned, face-matched at the gate. 10+ cities across India.',
  keywords: [
    'Garba companion',
    'Garba buddy',
    'Garba dance partner',
    'Navratri dance partner booking',
    'Dandiya partner for rent',
    'hire Garba dance partner',
    'Garba companion Ahmedabad',
    'Garba companion Hyderabad',
    'Garba companion Chennai',
    'Garba companion Mumbai',
    'Navratri companion app India',
    'solo Garba attendee',
    'verified dance companion India',
    'become a Garba companion',
  ],
  authors: [{ name: 'Garba Buddy' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Garba Buddy',
    title: 'Garba Buddy: Never Garba Alone',
    description:
      'Book a verified, ID-checked local dance companion for Navratri. Safe, chaperoned, no awkward solo standing on the sidelines.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Garba Buddy: book a verified Navratri dance companion' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garba Buddy: Never Garba Alone',
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
      { '@type': 'Country', name: 'India' },
      'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai',
      'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Noida', 'Gurugram',
      'Vadodara', 'Rajkot', 'Nagpur', 'Indore', 'Bhopal', 'Coimbatore', 'Kochi',
      'Chandigarh', 'Guwahati',
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
