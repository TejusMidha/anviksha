'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { FEST } from '@/lib/content';
import { NavSocials } from './Socials';

const LINKS = [
  { href: '/#about', label: 'ABOUT' },
  { href: '/#eras', label: 'EVENTS' },
  { href: '/#schedule', label: 'SCHEDULE' },
  { href: '/#faq', label: 'FAQ' },
];

export default function Nav() {
  const { scrollYProgress, scrollY } = useScroll();
  const [solid, setSolid] = useState(false);

  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 40));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-void/85 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link
          href="/#top"
          className="focus-era flex min-h-[44px] items-center gap-2 rounded pr-2"
        >
          <span className="font-pixel text-[10px] leading-none text-phosphor sm:text-xs">
            ANVIKSHA
          </span>
          <span className="font-pixel text-[10px] leading-none text-holo sm:text-xs">
            &apos;26
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:inline">
            / {FEST.subtitle}
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-era hidden min-h-[44px] items-center rounded px-2.5 font-mono
                         text-[10px] tracking-widest text-white/60 transition-colors
                         hover:text-holo sm:inline-flex sm:text-xs"
            >
              {l.label}
            </Link>
          ))}

          {/* Instagram sits in the bar itself, not buried in the footer. */}
          <div className="mr-1 sm:ml-2">
            <NavSocials />
          </div>

          <a
            href={FEST.registerUrl}
            className="cta-amber focus-era flex min-h-[44px] items-center rounded-sm px-3.5
                       font-pixel text-[8px] leading-none transition-transform
                       hover:scale-[1.04] sm:text-[10px]"
          >
            REGISTER
          </a>
        </nav>
      </div>

      {/* progress bar: green at the top of the page, cyan by the bottom */}
      <motion.div
        aria-hidden
        style={{ scaleX: scrollYProgress }}
        className="h-[2px] origin-left bg-gradient-to-r from-phosphor via-arcade to-holo"
      />
    </header>
  );
}
