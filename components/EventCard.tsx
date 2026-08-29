'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import type { AnvikshaEvent, EraId } from '@/lib/content';
import {
  useCanvasesSuspended,
  useDeviceTier,
  useInViewport,
  useMountSlot,
  usePrefersReducedMotion,
  useRenderSlot,
} from '@/lib/hooks';
import { ERA_MOTION } from './era/EraBackdrop';

// One shared 3D chunk for every event scene, pulled in only when a card
// first comes near the viewport. Nothing three.js-shaped is in the initial JS.
const EventCanvas = dynamic(() => import('@/components/three/EventCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function EventCard({
  event,
  eraId,
  eraCategory,
}: {
  event: AnvikshaEvent;
  eraId: EraId;
  /** The era's track name, shown on the card corner. */
  eraCategory: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  /* Mounting uses hysteresis, and that is load-bearing: a browser only allows
     ~16 live WebGL contexts, and this page has 21 event scenes. Cards mount
     when they come near the viewport and only unmount once they are well past
     it, so the live-context count stays small without thrashing on short
     scrolls.

     The margins are asymmetric ("vertical horizontal") on purpose. A symmetric
     500px mounted every card sitting off to the RIGHT inside a horizontal rail
     — cards the user has not scrolled to and cannot see — which measured at 11
     live contexts on a 1536px viewport, uncomfortably close to the ceiling
     once the detail modal adds its own. Vertical margin stays generous so
     scrolling down still pre-warms; horizontal is tight because a rail is
     scrolled deliberately and one card of lead time is enough. */
  const enter = useInViewport(ref, { rootMargin: '400px 120px', threshold: 0 });
  const keep = useInViewport(ref, { rootMargin: '1000px 400px', threshold: 0 });
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (enter) setNear(true);
    else if (!keep) setNear(false);
  }, [enter, keep]);

  /* Margins decide which cards WANT a context; the mount budget decides which
     ones get one. Without this second gate a tall viewport straddling two
     horizontal rails put 12 event canvases live at once — the margins alone
     cannot bound it, because every card in both rails is legitimately "near".
     Capped at 8, granted nearest-first. */
  const mounted = useMountSlot(near, ref);

  const visible = useInViewport(ref, { rootMargin: '0px', threshold: 0.3 });
  const reduced = usePrefersReducedMotion();
  const tier = useDeviceTier();

  /* While an event modal is open it mounts its own canvas on top of this
     strip. Rather than raise the ceiling, every background card gives up its
     render slot: `wanted=false` releases the slot AND drops the canvas to
     frameloop="demand", so the modal's scene runs inside the same budget. */
  const suspended = useCanvasesSuspended();
  const active = useRenderSlot(visible && mounted && !suspended);

  const m = ERA_MOTION[eraId];

  return (
    <motion.div
      ref={ref}
      id={event.id}
      initial={m.initial}
      whileInView={m.animate}
      viewport={{ once: true, margin: '-60px' }}
      transition={m.transition}
      className="w-[80vw] shrink-0 snap-start sm:w-[22rem]"
    >
      <Link
        href={`/events/${event.slug}`}
        scroll={false}
        aria-label={`${event.name} — ${event.tagline}. View event details.`}
        /* The whole card is the control: one anchor, so Enter/Space, focus
           order, middle-click and "copy link address" all work for free —
           no role="button" + keydown handler reimplementation. */
        className="era-surface focus-era group flex h-full flex-col overflow-hidden outline-none
                   transition-[transform,border-color] duration-200 ease-out
                   hover:-translate-y-1 hover:border-[color:var(--era-color)]
                   focus-visible:-translate-y-1
                   motion-reduce:transform-none motion-reduce:transition-none"
      >
        <div className="relative h-[280px] w-full sm:h-[300px]">
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

          {/* Era + track, NOT `event.scene`: that is the internal SceneKey
              ("captureTheFlag") and printing it put a code identifier on a
              public card. The category is the same length and means something
              to a visitor. */}
          <span className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
            ERA {String(eraId).padStart(2, '0')} / {eraCategory}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 border-t border-[color:var(--chrome-line-soft)] p-5">
          <h3 className="era-text font-pixel text-[11px] leading-[1.6]">{event.name}</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
            {event.tagline}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/65">{event.blurb}</p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="era-chip px-2.5 py-1 font-mono text-[10px]">{event.format}</span>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30
                         transition-colors duration-200 group-hover:text-[color:var(--era-color)]
                         group-focus-visible:text-[color:var(--era-color)]"
            >
              Details →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
