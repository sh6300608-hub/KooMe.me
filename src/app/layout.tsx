import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koomi.me'),
  title: { default: 'KooMi — Hussain', template: '%s | KooMi' },
  description: 'Professional portfolio and private career workspace for Hussain.',
  openGraph: { title: 'KooMi — Hussain', description: 'Aspiring Software Developer', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
