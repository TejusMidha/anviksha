'use client';

/**
 * The per-era background layer. One component, five media:
 *
 *   1  CRT scanlines + chromatic fringe          pure CSS
 *   2  vignette + diagonal speed lines           CSS, scroll-driven transform
 *   3  drifting node/link network                2D canvas (see ConnectionField)
 *   4  three parallax depth layers               CSS, scroll-driven transform
 *   5  noise-driven holographic gradient         CSS @property animation
 *
 * Nothing here allocates a WebGL context. Eras 2 and 4 read scroll through
 * `useScrollVar`, which writes a CSS custom property on a rAF tick and never
 * touches React state — scrolling costs a style recalc on one element, not a
 * re-render of the section.
 *
 * The parent section must be `position: relative`; drop this in as its first
 * child and it paints underneath the content.
 */

import { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { EraId } from '@/lib/content';
import { useScrollVar } from '@/lib/hooks';

// The only era whose backdrop ships JS beyond a couple of style writes.
const ConnectionField = dynamic(() => import('./ConnectionField'), { ssr: false });

function ArcadeBackdrop() {
  return (
    <div aria-hidden className="era-backdrop">
      <div className="crt-fringe absolute inset-0" />
      <div className="crt-scanlines absolute inset-0" />
    </div>
  );
}

function ConsoleBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  // Speed lines slide against the scroll direction: the section reads as
  // rushing past rather than scrolling with the page.
  const map = useCallback((p: number) => `${Math.round((p - 0.5) * -180)}px`, []);
  useScrollVar(ref, '--speed-shift', map);

  return (
    <div ref={ref} aria-hidden className="era-backdrop">
      <div className="speed-lines" />
      <div className="console-vignette absolute inset-0" />
    </div>
  );
}

function OpenWorldBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  // 0..1 through the viewport; the three layers multiply it by different
  // amounts in CSS, so one variable drives the whole parallax stack.
  const map = useCallback((p: number) => String((p - 0.5).toFixed(4)), []);
  useScrollVar(ref, '--parallax', map);

  return (
    <div ref={ref} aria-hidden className="era-backdrop">
      <div className="parallax-layer parallax-far" />
      <div className="parallax-layer parallax-mid" />
      <div className="parallax-layer parallax-near" />
    </div>
  );
}

function HoloBackdrop() {
  return (
    <div aria-hidden className="era-backdrop">
      <div className="holo-field absolute inset-0" />
      <div className="holo-grain absolute inset-0" />
    </div>
  );
}

export default function EraBackdrop({ era }: { era: EraId }) {
  switch (era) {
    case 1:
      return <ArcadeBackdrop />;
    case 2:
      return <ConsoleBackdrop />;
    case 3:
      return <ConnectionField />;
    case 4:
      return <OpenWorldBackdrop />;
    case 5:
      return <HoloBackdrop />;
  }
}

/**
 * Motion presets, per era. Cards and modals read these so that "how a thing
 * arrives" is part of the era's identity rather than one global easing curve.
 *
 *   1  hard cut, no easing            arcade menu
 *   2  short spring with overshoot    fighting-game hit-stun
 *   3  slow, continuous, weightless   networked drift
 *   4  eased with travel              open-world camera
 *   5  assemble out of noise          particle dissolve
 */
export const ERA_MOTION: Record<
  EraId,
  { initial: Record<string, number>; animate: Record<string, number>; transition: object }
> = {
  1: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    // duration 0 is the point: era 1 cuts, it does not fade.
    transition: { duration: 0 },
  },
  2: {
    initial: { opacity: 0, y: 26, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { type: 'spring', stiffness: 620, damping: 18, mass: 0.7 },
  },
  3: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, ease: [0.33, 1, 0.68, 1] },
  },
  4: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  5: {
    initial: { opacity: 0, y: 18, scale: 0.965, filter: 'blur(6px)' } as never,
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } as never,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};
