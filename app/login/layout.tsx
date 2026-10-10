import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log in',
  description:
    'Log in to your Garba Buddy account to manage bookings.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
