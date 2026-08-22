'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import type { AnvikshaEvent, EraId } from '@/lib/content';
import { useDeviceTier, useInViewport, usePrefersReducedMotion, useRenderSlot } from '@/lib/hooks';

// One shared 3D chunk for every event scene, pulled in only when a card
// first comes near the viewport. Nothing three.js-shaped is in the initial JS.
const EventCanvas = dynamic(() => import('@/components/three/EventCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function EventCard({ event, eraId }: { event: AnvikshaEvent; eraId: EraId }) {
  const ref = useRef<HTMLDivElement>(null);

  /* Mounting uses hysteresis, and that is load-bearing: a browser only allows
     ~16 live WebGL contexts, and this page has 21 event scenes. Cards mount at
     500px from the viewport and only unmount once they are 1200px away, so the
     number of live contexts stays small without thrashing on short scrolls. */
  const enter = useInViewport(ref, { rootMargin: '500px', threshold: 0 });
  const keep = useInViewport(ref, { rootMargin: '1200px', threshold: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (enter) setMounted(true);
    else if (!keep) setMounted(false);
  }, [enter, keep]);

  const visible = useInViewport(ref, { rootMargin: '0px', threshold: 0.3 });
  const reduced = usePrefersReducedMotion();
  const tier = useDeviceTier();

  // Global semaphore: at most 3 canvases may run their loop at once.
  const active = useRenderSlot(visible && mounted);

  return (
    <motion.article
      ref={ref}
      id={event.id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="era-surface group flex w-[80vw] shrink-0 snap-start flex-col overflow-hidden sm:w-[22rem]"
    >
      <div className="relative h-[280px] w-full sm:h-[300px]">
        {/* era-tinted well behind the object */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 70% at 50% 55%, color-mix(in srgb, var(--era-color) 12%, transparent) 0%, transparent 70%)',
          }}
        />
        {mounted && (
          <EventCanvas scene={event.scene} active={active} reduced={reduced} tier={tier} />
        )}

        <span className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
          {String(eraId).padStart(2, '0')} / {event.scene}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-white/5 p-5">
        <h3 className="era-text font-pixel text-[11px] leading-[1.6]">{event.name}</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
          {event.tagline}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-white/65">{event.blurb}</p>
        <span className="era-chip mt-3 w-fit px-2.5 py-1 font-mono text-[10px]">{event.format}</span>
      </div>
    </motion.article>
  );
}
