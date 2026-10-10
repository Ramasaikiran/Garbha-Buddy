import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Garba Companion',
  description:
    'Earn this Navratri. Register as an ID-verified Garba dance companion on Garba Buddy.',
  alternates: { canonical: 'https://garbabuddy.lol/companion/register' },
};

export default function CompanionRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
