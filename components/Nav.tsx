'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { FEST } from '@/lib/content';
import { NavSocials } from './Socials';
import { AnvikshaMark, NmimsLogo, PoweredByUnstop } from './Brand';
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
        {/* HOST INSTITUTION, LEFT. Not a link and not the home control — the
            Anviksha mark on the right is. This is a wide 578x132 lockup, so it
            is sized by HEIGHT only; `max-w` plus object-contain lets it scale
            itself down on a narrow phone instead of shoving the nav off the
            right edge, which is what a fixed width would do. */}
        <div className="flex min-w-0 shrink items-center sm:max-w-none">
          {/* The CAP lives on the wrapper and `max-w-full` on the image, not
              both on the image: at 320px the nav cluster leaves the logo ~70px,
              less than the 38vw cap, and an image capped only at 38vw keeps its
              own 105px width and runs under the nav. Tying it to the parent's
              ACTUAL width makes it shrink with the box; object-contain then
              scales the artwork instead of squashing it. */}
          <NmimsLogo className="h-6 w-auto max-w-full object-contain sm:h-8 lg:h-9" />
        </div>

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-2">
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
            className="cta-amber focus-era flex min-h-[44px] items-center rounded-sm px-3
                       font-pixel text-[8px] leading-none transition-transform
                       hover:scale-[1.04] sm:px-3.5 sm:text-[10px]"
          >
            REGISTER
          </a>

          {/* FEST BRAND, RIGHT — and the home control the wordmark used to be.
              The "Powered by Unstop" tag sits immediately before it so it reads
              as a tag ON the Anviksha mark, and so the mark itself stays the
              last thing in the bar. The tag is the one element that yields
              below `lg`: at that width the bar is already carrying two CTAs and
              a social icon, and the hero repeats the tag ~one screen down. */}
          <PoweredByUnstop size="sm" className="ml-1 hidden lg:inline-flex" />

          <Link
            href="/#top"
            aria-label={`${FEST.name} — ${FEST.subtitle}, back to top`}
            className="focus-era ml-1 flex min-h-[44px] shrink-0 items-center rounded sm:ml-2"
          >
            <AnvikshaMark className="h-8 w-auto sm:h-10 lg:h-11" />
          </Link>
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
