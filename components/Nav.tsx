'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { FEST } from '@/lib/content';
import { NavSocials } from './Socials';
import { FolderIcon } from './Icons';

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

  // 0..1 -> "0%".."100%" for the progress meter's width.
  const progressWidth = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? 'bg-void/85 backdrop-blur-md shadow-[inset_0_-1px_0_var(--chrome-line)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link
          href="/#top"
          className="focus-era flex min-h-[44px] items-center gap-2 rounded pr-2"
        >
          <span className="font-pixel text-[10px] leading-none text-holo sm:text-xs">
            ANVIKSHA
          </span>
          <span className="font-pixel text-[10px] leading-none text-arcade sm:text-xs">
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
              className="focus-era hidden min-h-[44px] items-center rounded px-2 font-mono
                         text-[10px] tracking-widest text-white/60 transition-colors
                         hover:text-holo md:inline-flex lg:px-2.5 lg:text-xs"
            >
              {l.label}
            </Link>
          ))}

          {/* Instagram sits in the bar itself, not buried in the footer. */}
          <div className="mr-1 sm:ml-2">
            <NavSocials />
          </div>

          {/* Two primary actions, ranked: the filled amber CTA is Register,
              the outlined one is the brochure folder. Same amber family so
              they read as a pair; only one of them is filled, so they do not
              compete. The outline drops to an icon square below `sm`. */}
          <a
            href={FEST.brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Event brochures and rules"
            className="cta-amber-ghost focus-era ml-1 flex min-h-[44px] items-center gap-2
                       rounded-sm px-2.5 font-pixel text-[8px] leading-none lg:px-3.5 lg:text-[10px]"
          >
            <FolderIcon size={14} />
            <span className="hidden lg:inline">BROCHURES</span>
          </a>

          <a
            href={FEST.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-amber focus-era flex min-h-[44px] items-center rounded-sm px-3.5
                       font-pixel text-[8px] leading-none transition-transform
                       hover:scale-[1.04] sm:text-[10px]"
          >
            REGISTER
          </a>
        </nav>
      </div>

      {/* Scroll progress, as an arcade power meter rather than a hairline: a
          bricked track, a segmented fill that runs brick -> magenta -> cyan,
          and a lit block riding the leading edge.

          Driven by `width`, not scaleX. scaleX would stretch the segment
          pattern and the leading block along with the bar, so the "pixels"
          would grow as you scroll; width keeps every segment the same size and
          the cap crisp. The element is absolutely positioned inside the track,
          so nothing else re-lays-out as it changes. */}
      <div aria-hidden className="scroll-progress">
        <motion.div style={{ width: progressWidth }} className="scroll-progress-fill">
          <span className="scroll-progress-cap" />
        </motion.div>
      </div>
    </header>
  );
}
