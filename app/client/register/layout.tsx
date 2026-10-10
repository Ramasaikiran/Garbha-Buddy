import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Account',
  description:
    'Create a Garba Buddy account to book a verified dance companion this Navratri.',
  robots: { index: false, follow: false },
};

export default function ClientRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
