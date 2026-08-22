'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { FEST } from '@/lib/content';

const LINKS = [
  { href: '#about', label: 'BRIEF' },
  { href: '#eras', label: 'EVENTS' },
  { href: '#schedule', label: 'SCHEDULE' },
  { href: '#team', label: 'CREDITS' },
];

export default function Nav() {
  const { scrollYProgress, scrollY } = useScroll();
  const [solid, setSolid] = useState(false);

  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 40));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-void/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="group flex items-baseline gap-2">
          <span className="font-pixel text-[10px] leading-none text-phosphor sm:text-xs">
            ANVIKSHA
          </span>
          <span className="font-pixel text-[10px] leading-none text-holo sm:text-xs">&apos;26</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:inline">
            / {FEST.subtitle}
          </span>
        </a>

        <nav className="flex items-center gap-1 sm:gap-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded px-2 py-1 font-mono text-[10px] tracking-widest text-white/60 transition-colors hover:text-holo sm:text-xs"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#register"
            className="cta-amber ml-1 rounded-sm px-3 py-1.5 font-pixel text-[8px] leading-none transition-transform hover:scale-[1.04] sm:text-[10px]"
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
