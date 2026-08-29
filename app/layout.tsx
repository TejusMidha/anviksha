import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Press_Start_2P, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { FEST } from '@/lib/content';
import MotionProvider from '@/components/MotionProvider';
import BootSequence from '@/components/BootSequence';
import './globals.css';

const pixel = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

const sans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

/* Branding hierarchy, applied to metadata exactly as it is applied on the
   page: fest first, theme second, the gaming eras only as a subtitle to the
   theme. "Evolution of gaming" is never a title or a standalone theme line. */
const TITLE = `${FEST.name} — ${FEST.subtitle} | ${FEST.venue}`;
const DESCRIPTION = `${FEST.theme}. ${FEST.themeSubtitle} ${FEST.date} at ${FEST.venue}.`;

/* The deployed origin. Link-preview cards (app/opengraph-image.tsx) must be
   advertised as ABSOLUTE URLs or WhatsApp, LinkedIn and most mail clients
   will not fetch them — so set NEXT_PUBLIC_SITE_URL in the deploy
   environment before sharing the link anywhere. Vercel's own VERCEL_URL is
   used when it is present, and the localhost fallback only ever applies to
   local development. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${FEST.name}`,
  },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  keywords: [
    'ANVIKSHA',
    'ANVIKSHA 2026',
    'The Epoch',
    'techfest',
    'STME',
    'NMIMS Chandigarh',
    'hackathon',
    'e-sports',
    'robotics',
  ],
  openGraph: {
    title: `${FEST.name} — ${FEST.subtitle}`,
    description: `${FEST.theme} · ${FEST.date} · ${FEST.venue}`,
    type: 'website',
    siteName: FEST.name,
    locale: 'en_IN',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${FEST.name} — ${FEST.subtitle}`,
    description: `${FEST.theme} · ${FEST.date} · ${FEST.venue}`,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#08090d',
  width: 'device-width',
  initialScale: 1,
  // Users must be able to zoom — the pixel type is small by design.
  maximumScale: 5,
};

/**
 * `modal` is the parallel slot that app/@modal/(.)events/[slug] renders into.
 * On a normal page render it resolves to app/@modal/default.tsx (null).
 */
export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html lang="en" className={`${pixel.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <MotionProvider>
          <BootSequence />
          {children}
          {modal}
        </MotionProvider>
      </body>
    </html>
  );
}
