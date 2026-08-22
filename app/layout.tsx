import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Press_Start_2P, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { FEST } from '@/lib/content';
import MotionProvider from '@/components/MotionProvider';
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

export const metadata: Metadata = {
  title: `${FEST.name} — ${FEST.subtitle} | ${FEST.venue}`,
  description: `${FEST.motif}. ${FEST.theme}. ${FEST.date} at ${FEST.venue}.`,
  openGraph: {
    title: `${FEST.name} — ${FEST.subtitle}`,
    description: `${FEST.motif} · ${FEST.date} · ${FEST.venue}`,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#08090d',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
