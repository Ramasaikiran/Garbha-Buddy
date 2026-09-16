import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Garba Buddy',
  description: 'Book your Navratri Garba dance partner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
