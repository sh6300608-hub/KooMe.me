import type { Metadata } from 'next';
import './globals.css';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim() || 'https://koomi.me';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'KooMi — Hussain', template: '%s | KooMi' },
  description: 'Professional portfolio and private career workspace for Hussain.',
  openGraph: { title: 'KooMi — Hussain', description: 'Aspiring Software Developer', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
