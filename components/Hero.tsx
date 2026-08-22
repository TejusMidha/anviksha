'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { FEST } from '@/lib/content';

export default function Hero() {
  const { scrollYProgress } = useScroll();
  // The CRT grid is an era-1 artefact — it burns off as the page evolves.
  const gridOpacity = useTransform(scrollYProgress, [0, 0.12], [0.16, 0]);
  const lift = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  return (
    <section
      id="top"
      className="era-1 relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      <motion.div
        aria-hidden
        style={{ opacity: gridOpacity }}
        className="crt-grid pointer-events-none absolute inset-0"
      />
      <div aria-hidden className="hero-scrim pointer-events-none absolute inset-0" />

      <motion.div style={{ y: lift }} className="relative z-10 w-full max-w-5xl px-5 py-28 text-center">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.45em] text-phosphor/80 sm:text-xs">
          {FEST.institute}
        </p>

        <h1 className="font-pixel text-3xl leading-[1.35] text-white sm:text-5xl md:text-6xl">
          <span className="block text-phosphor [text-shadow:0_0_24px_rgba(57,255,106,0.45)]">
            ANVIKSHA
          </span>
          <span className="mt-3 block text-white/95">
            &apos;26
            <span className="ml-3 inline-block align-middle text-holo [text-shadow:0_0_28px_rgba(76,224,255,0.5)]">
              THE EPOCH
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-white/70 sm:text-lg">
          {FEST.motif} — five eras of play, one day of building.
          <span className="mt-2 block text-white/45">{FEST.theme}</span>
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] sm:text-xs">
          <span className="era-chip px-3 py-2">{FEST.date}</span>
          <span className="era-chip px-3 py-2">{FEST.venue}</span>
          <span className="era-chip px-3 py-2">21 Events · 5 Tracks</span>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#register"
            className="cta-amber px-6 py-3 font-pixel text-[10px] leading-none transition-transform hover:scale-[1.03]"
          >
            INSERT COIN
          </a>
          <a
            href="#eras"
            className="border border-phosphor/40 px-6 py-3 font-pixel text-[10px] leading-none text-phosphor transition-colors hover:bg-phosphor/10"
          >
            SELECT EVENT
          </a>
        </div>

        <p className="mt-14 font-mono text-[10px] tracking-[0.3em] text-white/30">
          SCROLL TO EVOLVE<span className="ml-1 animate-blink">_</span>
        </p>
      </motion.div>
    </section>
  );
}
