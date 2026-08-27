'use client';

/**
 * Hero.
 *
 * Priority order, and the rule that keeps it: everything a first-time visitor
 * must see — fest name, THE EPOCH, the Digital Voyage theme line, date, venue,
 * and the primary CTA — is plain server-rendered markup with NO entry
 * animation at all. It is legible on the first painted frame.
 *
 * Only the supporting furniture (the eyebrow, the countdown row, the scroll
 * hint) staggers in, and the last of those lands at 640ms. Nothing critical
 * is ever mid-animation.
 *
 * The glitch-in on the wordmark is kept but is a *decorative overlay* on
 * already-visible text — the letters are readable at t=0 and the chromatic
 * fringe settles over ~900ms on top of them.
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FEST, ALL_EVENTS, ERAS } from '@/lib/content';
import Countdown from './Countdown';
import { CalendarIcon, PinIcon } from './Icons';

// Supporting elements only. Capped so the whole sequence is done well inside 1s.
const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const gridOpacity = useTransform(scrollYProgress, [0, 0.12], [0.16, 0]);
  const lift = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  return (
    <section
      ref={ref}
      id="top"
      className="era-1 relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      <motion.div
        aria-hidden
        style={{ opacity: gridOpacity }}
        className="crt-grid pointer-events-none absolute inset-0"
      />
      {/* Contrast floor. The hero now carries far more copy than it used to,
          so the scrim is stronger and a flat wash backs the text column
          directly — body copy no longer relies on the radial falloff alone. */}
      <div aria-hidden className="hero-scrim pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-void/35" />

      <motion.div
        style={{ y: lift }}
        className="relative z-10 w-full max-w-4xl px-5 py-24 text-center sm:py-28"
      >
        <motion.p
          {...reveal(0.05)}
          className="mb-5 font-mono text-[10px] uppercase tracking-[0.4em] text-phosphor/80 sm:text-xs"
        >
          {FEST.institute}
        </motion.p>

        {/* ---- Critical block: no entry animation, readable at first paint ---- */}
        <h1 className="font-pixel text-[26px] leading-[1.4] text-white sm:text-5xl md:text-[3.4rem]">
          <span className="crt-aberrate block text-phosphor">ANVIKSHA &apos;26</span>
          <span className="mt-3 block text-holo [text-shadow:0_0_28px_rgba(76,224,255,0.45)]">
            THE EPOCH
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-balance text-lg font-medium leading-snug text-white/90 sm:text-xl">
          {FEST.theme}
        </p>
        <p className="mx-auto mt-2.5 max-w-xl text-balance text-sm leading-relaxed text-white/55">
          {FEST.themeSubtitle}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] sm:text-xs">
          <span className="era-chip inline-flex items-center gap-2 px-3 py-2">
            <CalendarIcon size={14} />
            {FEST.date}
          </span>
          <span className="era-chip inline-flex items-center gap-2 px-3 py-2">
            <PinIcon size={14} />
            {FEST.venue}
          </span>
          <span className="era-chip px-3 py-2">
            {ALL_EVENTS.length} Events · {ERAS.length} Tracks
          </span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={FEST.registerUrl}
            className="cta-amber focus-era tap-target px-7 py-4 font-pixel text-[11px] leading-none transition-transform hover:scale-[1.03]"
          >
            REGISTER NOW
          </a>
          <a
            href="#eras"
            className="arcade-cut focus-era tap-target border border-phosphor/40 px-7 py-4 font-pixel text-[11px] leading-none text-phosphor"
          >
            BROWSE EVENTS
          </a>
        </div>
        {/* ---- End critical block ---- */}

        <motion.div {...reveal(0.42)} className="mt-9 flex justify-center">
          <Countdown />
        </motion.div>

        <motion.p
          {...reveal(0.64)}
          className="mt-10 font-mono text-[10px] tracking-[0.3em] text-white/30"
        >
          SCROLL TO EVOLVE<span className="ml-1 animate-blink">_</span>
        </motion.p>
      </motion.div>
    </section>
  );
}
