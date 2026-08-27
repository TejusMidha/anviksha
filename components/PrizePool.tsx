'use client';

/**
 * Prize pool — hero-weight treatment, because prize money converts.
 *
 * One source of truth: the headline number is PRIZE_POOL.total when set, and
 * otherwise the sum of every confirmed per-event `prize`. The same is true per
 * track. Numbers are never written in two places.
 *
 * The whole section returns null while no total resolves — a fest site with a
 * blank or "TBD" prize figure is worse than one that does not mention prizes
 * yet. Set PRIZE_POOL.total (or fill in per-event prizes) and it appears.
 */

import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  PRIZE_POOL,
  headlinePrizeTotal,
  prizeForCategory,
  ERAS,
} from '@/lib/content';
import { useCountUp, useInViewport } from '@/lib/hooks';
import EraBackdrop from './era/EraBackdrop';
import { TrophyIcon } from './Icons';

function AnimatedTotal({ total }: { total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // `once`-style: the count runs when the number scrolls into view.
  const inView = useInViewport(ref, { rootMargin: '-10% 0px', threshold: 0.4 });
  const value = useCountUp(total, inView, 1800);

  return (
    <div ref={ref} className="flex items-baseline justify-center gap-1">
      <span className="font-pixel text-2xl leading-none text-amber sm:text-4xl md:text-5xl">
        {PRIZE_POOL.currency}
      </span>
      <span
        className="font-pixel text-3xl leading-none text-amber [text-shadow:0_0_40px_rgba(255,201,60,0.45)] sm:text-5xl md:text-6xl"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value.toLocaleString('en-IN')}
      </span>
    </div>
  );
}

export default function PrizePool() {
  const total = headlinePrizeTotal();

  // NEEDS DATA — nothing to show yet. See PRIZE_POOL in lib/content.ts.
  if (total === null) return null;

  // A category renders if it has an explicit amount or a computed one.
  const categories = PRIZE_POOL.categories
    .map((c) => ({ ...c, amount: c.amount ?? prizeForCategory(c.label) }))
    .filter((c): c is typeof c & { amount: number } => c.amount !== null);

  return (
    <section id="prizes" className="era-5 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <EraBackdrop era={5} />

      <div className="era-surface relative overflow-hidden px-6 py-16 text-center sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 50% 0%, rgba(255,201,60,0.16) 0%, transparent 72%)',
          }}
        />

        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber/80">
            Prize pool
          </p>

          <div className="mt-3 flex items-center justify-center gap-3 text-amber/70">
            <TrophyIcon size={22} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5"
          >
            <AnimatedTotal total={total} />
          </motion.div>

          <p className="mx-auto mt-6 max-w-xl text-white/60">
            Split across {ERAS.length} tracks and every event on the day. Winners are announced at
            the closing ceremony.
          </p>

          {categories.length > 0 && (
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map((c) => (
                <div
                  key={c.label}
                  className="era-surface px-4 py-5 text-left"
                  style={{
                    borderColor: 'rgba(255,201,60,0.28)',
                    boxShadow: '0 0 26px rgba(255,201,60,0.09)',
                  }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {c.label}
                  </div>
                  <div className="mt-2.5 font-pixel text-[13px] leading-none text-amber">
                    {PRIZE_POOL.currency}
                    {c.amount.toLocaleString('en-IN')}
                  </div>
                  {c.note && (
                    <div className="mt-2 font-mono text-[10px] text-white/35">{c.note}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
