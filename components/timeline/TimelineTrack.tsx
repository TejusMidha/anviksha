'use client';

/**
 * The brick-staircase run-of-show.
 *
 * SCROLL MODEL — the important part. Character position is a direct function
 * of scroll progress, computed in a rAF tick and written straight to the DOM:
 * a transform on the sprite, a `data-active` attribute on the landed row.
 * There is NO React state in the scroll path, so scrolling the whole 24-row
 * track never re-renders a single component. This mirrors how HeroField reads
 * scroll through a ref inside useFrame.
 *
 * The callouts are all rendered up front and revealed by CSS keyed off
 * `data-active`, which is why revealing one costs an attribute write rather
 * than a render.
 *
 * COST: pure DOM. No WebGL context, so this does not touch the mount-slot
 * budget the event cards share — deliberate, since that budget is already the
 * tightest resource on the page.
 */

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { SCHEDULE, SCHEDULE_IS_PLACEHOLDER, scheduleRange } from '@/lib/content';
import { buildTimeline, RUN_LENGTH } from '@/lib/timeline';
import { useDeviceTier, usePrefersReducedMotion } from '@/lib/hooks';
import { BitMiteSprite, VoyagerSprite } from './sprites';

/* Vertical pixels per schedule row — this sets the whole track height, and
   through it the real spacing between two rows that share a start time.

   lib/timeline.ts relaxes colliding rows to MIN_GAP (0.035 of the track), so
   the smallest gap in pixels is STEP_PX * rows * 0.035. A measured callout is
   ~75px tall, so the mobile pitch has to stay high enough that two 10:00 rows
   do not overlap their callouts: at 22 rows that is 124 * 22 * 0.035 = 95px of
   clearance. 108 gave 76px, which touched. */
const STEP_PX = 132;
const STEP_PX_MOBILE = 124;

export default function TimelineTrack() {
  const { steps, hours } = useMemo(() => buildTimeline(SCHEDULE), []);

  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<HTMLDivElement>(null);
  const landedRef = useRef(-1);

  const reduced = usePrefersReducedMotion();
  const tier = useDeviceTier();

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const sprite = spriteRef.current;
    if (!wrap || !track || !sprite || !steps.length) return;

    const stepEls = Array.from(track.querySelectorAll<HTMLElement>('[data-step]'));

    /* ------------------------------------------------------------------ *
     * CACHED GEOMETRY
     *
     * Nothing in here may be read inside the per-frame callback.
     *
     * Measured on the old loop: it read getBoundingClientRect +
     * offsetWidth/offsetHeight + getComputedStyle every frame AND wrote
     * transforms in between. Those reads cost ~25us apart but ~182us
     * interleaved with the writes — a 7x forced-layout penalty that pushed
     * the rAF callback late, so the transform painted a frame or more behind
     * the scroll offset. That was the trailing.
     *
     * So: measure once, and on anything that can actually move us. The hot
     * path then reads exactly one cheap value (window.scrollY, ~2.5us).
     * ------------------------------------------------------------------ */
    const geo = {
      /* TRACK's top in DOCUMENT coords — deliberately the track, not the wrap.
         The sprite is positioned inside `track`, so progress has to be measured
         against the same box. Measuring the wrap instead left the ~100px of top
         scenery as an uncorrected offset, which pushed the Voyager off the top
         of the viewport by the end of the run. */
      docTop: 0,
      trackH: 0,
      trackW: 0,
      laneStart: 0.19,
      laneFrac: 0.62,
      vh: 0,
    };

    const measure = () => {
      const rect = track.getBoundingClientRect();
      geo.docTop = rect.top + window.scrollY;
      geo.trackH = track.offsetHeight;
      geo.trackW = track.offsetWidth;
      geo.vh = window.innerHeight || 1;
      /* Lane fractions live in CSS (--tl-lane-*) so a media query can change
         them. They only change on resize, so they are read here — never in
         the frame callback, where getComputedStyle alone cost ~7us and forced
         a style recalc against pending writes. */
      const cs = getComputedStyle(wrap);
      geo.laneStart = parseFloat(cs.getPropertyValue('--tl-lane-start')) || 0.19;
      geo.laneFrac = parseFloat(cs.getPropertyValue('--tl-lane-width')) || 0.62;
    };

    /* Maps scroll to 0..1 such that the sprite stays inside a readable band:
       at progress 0 the track's top sits 72% down the viewport (sprite near the
       bottom), at progress 1 the track's bottom sits 38% down (sprite near the
       top). Because both the band and the sprite's y are expressed in TRACK
       coordinates, the sprite is guaranteed to stay on screen for the whole
       run — that identity breaks the moment these use different boxes. */
    const progressAt = (scrollTop: number) => {
      const top = geo.docTop - scrollTop;
      const start = geo.vh * 0.72;
      const end = -geo.trackH + geo.vh * 0.38;
      const raw = (start - top) / (start - end);
      return raw < 0 ? 0 : raw > 1 ? 1 : raw;
    };

    /* ------------------------------------------------------------------ *
     * LANDING
     * ------------------------------------------------------------------ */
    let activeIdx = -1;
    let bumpTimer = 0;

    /** Only touch the steps whose state actually changed, not all 20. */
    const setActiveUpTo = (idx: number) => {
      if (idx > activeIdx) {
        for (let j = activeIdx + 1; j <= idx; j++) {
          stepEls[j]?.setAttribute('data-active', 'true');
        }
      } else {
        for (let j = activeIdx; j > idx; j--) {
          stepEls[j]?.removeAttribute('data-active');
        }
      }
      activeIdx = idx;
    };

    const animateLanding = (i: number) => {
      if (reduced) return;
      const el = stepEls[i];
      if (!el) return;

      const block = el.querySelector<HTMLElement>('[data-block]');
      if (block) {
        // Block-bump: quick nudge up, overshoot back down, settle. WAAPI so it
        // re-triggers cleanly on every landing without class thrashing.
        block.animate(
          [
            { transform: 'translateY(0) scaleY(1)' },
            { transform: 'translateY(-13px) scaleY(1.08)', offset: 0.32 },
            { transform: 'translateY(3px) scaleY(0.94)', offset: 0.68 },
            { transform: 'translateY(0) scaleY(1)' },
          ],
          { duration: 420, easing: 'cubic-bezier(0.2, 1.5, 0.4, 1)' },
        );
      }

      // Dust is pure decoration and the first thing to go on a weak device.
      if (tier === 'low') return;
      el.querySelectorAll<HTMLElement>('[data-dust]').forEach((d, k) => {
        const dir = k === 0 ? -1 : k === 1 ? 1 : 0;
        d.animate(
          [
            { transform: 'translate(0,0) scale(0.4)', opacity: 0.9 },
            { transform: `translate(${dir * 26}px, ${-10 - k * 4}px) scale(1.3)`, opacity: 0 },
          ],
          { duration: 520, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
        );
      });
    };

    const land = (idx: number) => {
      const delta = Math.abs(idx - activeIdx);
      setActiveUpTo(idx);

      /* Spawning one landing's animations costs ~86us. A fast flick crosses
         ~15 steps in ~300ms, so animating every one meant a landing on very
         nearly every frame and ~60 live animations at once. Step-by-step
         scrolling still bumps immediately; a flick debounces and bumps only
         the block the user actually comes to rest on. */
      if (delta === 1) {
        animateLanding(idx);
      } else {
        clearTimeout(bumpTimer);
        bumpTimer = window.setTimeout(() => animateLanding(activeIdx), 70);
      }
    };

    /* ------------------------------------------------------------------ *
     * PER-FRAME
     *
     * Driven by rAF itself, not scheduled from scroll events. A scroll event
     * can be dispatched after that frame's rAF has already run, which lands
     * the transform one frame late; driving the loop from rAF means the
     * position is always computed in the frame that paints it. The loop only
     * runs while the track is on screen (IntersectionObserver below).
     *
     * Reads exactly one value. Everything else is arithmetic on cached
     * numbers, then writes. No read-after-write anywhere in here.
     * ------------------------------------------------------------------ */
    let raf = 0;
    let lastScrollY = -1;

    const frame = () => {
      raf = requestAnimationFrame(frame);

      const sy = window.scrollY;
      const bobbing = !reduced;
      // Nothing moved and there is no idle bob to advance — skip the work.
      if (sy === lastScrollY && !bobbing) return;
      lastScrollY = sy;

      const pos = progressAt(sy) * (steps.length - 1);
      const i = Math.floor(pos);
      const f = pos - i;
      const a = steps[i];
      const b = steps[Math.min(steps.length - 1, i + 1)];

      const laneW = geo.trackW * geo.laneFrac;
      const laneX = geo.trackW * geo.laneStart;

      const x = laneX + (a.x + (b.x - a.x) * f) * laneW;
      const y = (a.y + (b.y - a.y) * f) * geo.trackH;

      // Hop arc between blocks so the descent reads as jumping, not sliding.
      const hop = reduced ? 0 : Math.sin(f * Math.PI) * 16;

      /* The scroll-driven position is written EXACTLY — no lerp, no damping,
         and no CSS transition on this element (see .tl-sprite in globals.css).
         Only the bob and the landing bump are allowed to ease; easing the base
         position is what makes a scroll-linked sprite read as "catching up". */
      sprite.style.transform = `translate3d(${x}px, ${y - hop}px, 0)`;

      const pose = poseRef.current;
      if (pose && bobbing) {
        const settled = f < 0.12 || f > 0.88;
        const nextPose = settled ? 'idle' : 'walk';
        if (pose.dataset.pose !== nextPose) pose.dataset.pose = nextPose;
        pose.style.transform = settled
          ? `translateY(${Math.sin(performance.now() / 320) * 2.5}px)`
          : 'translateY(0)';
      }

      const nearest = Math.round(pos);
      if (nearest !== landedRef.current) {
        landedRef.current = nearest;
        land(nearest);
      }
    };

    /* ------------------------------------------------------------------ *
     * LIFECYCLE
     * ------------------------------------------------------------------ */
    measure();

    // Seed the revealed state to wherever the user already is, without
    // animating every block between here and the top of the track.
    const seed = Math.round(progressAt(window.scrollY) * (steps.length - 1));
    setActiveUpTo(seed);
    landedRef.current = seed;

    const onResize = () => {
      measure();
      lastScrollY = -1; // force a recompute against the new geometry
    };

    /* Re-measure on anything that can move the track. The ResizeObserver on
       <body> is the important one: the era strip above mounts and unmounts
       WebGL canvases as you scroll, and any reflow it causes would otherwise
       leave docTop stale and the sprite offset for the rest of the session. */
    window.addEventListener('resize', onResize, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(track);
    ro.observe(document.body);
    if (document.fonts?.ready) document.fonts.ready.then(onResize).catch(() => {});

    const startLoop = () => {
      if (!raf) {
        lastScrollY = -1;
        raf = requestAnimationFrame(frame);
      }
    };
    const stopLoop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
        { rootMargin: '200px' },
      );
      io.observe(wrap);
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      clearTimeout(bumpTimer);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      io?.disconnect();
    };
  }, [steps, reduced, tier]);

  if (!steps.length) return null;

  const stepPx = tier === 'low' ? STEP_PX_MOBILE : STEP_PX;
  const trackHeight = steps.length * stepPx;

  return (
    <div ref={wrapRef} className="timeline-wrap relative">
      {/* ── top scenery: hills + pipe, bookending the descent ─────────────── */}
      <div aria-hidden className="tl-scenery tl-scenery-top">
        <div className="tl-hill tl-hill-a" />
        <div className="tl-hill tl-hill-b" />
        <div className="tl-pipe" />
        <div className="tl-ground" />
      </div>

      <div
        ref={trackRef}
        className="relative mx-auto w-full max-w-4xl"
        style={{ height: trackHeight }}
      >
        {/* ── time axis: real hour marks, on the same scale as the blocks ─── */}
        <div aria-hidden className="tl-axis">
          {hours.map((h) => (
            <div key={h.hour} className="tl-hour" style={{ top: `${h.y * 100}%` }}>
              <span className="tl-hour-label">{h.label}</span>
              <span className="tl-hour-rule" />
            </div>
          ))}
        </div>

        {/* ── the staircase ────────────────────────────────────────────────── */}
        <ol className="contents">
          {steps.map((s) => {
            const runEnd = s.index % RUN_LENGTH === RUN_LENGTH - 1;
            return (
              <li
                key={`${s.row.time}-${s.row.slot}`}
                data-step={s.index}
                className="tl-step"
                style={
                  {
                    top: `${s.y * 100}%`,
                    left: `calc((var(--tl-lane-start) + ${s.x} * var(--tl-lane-width)) * 100%)`,
                    '--step-color': s.palette.base,
                    '--step-accent': s.palette.accent,
                    '--step-hot': s.palette.hot,
                  } as React.CSSProperties
                }
              >
                {/* brick "?" block — see the IP note in the build report */}
                <div data-block className="tl-block">
                  <span className="tl-block-face">
                    <span className="tl-rivet tl-rivet-tl" />
                    <span className="tl-rivet tl-rivet-tr" />
                    <span className="tl-rivet tl-rivet-bl" />
                    <span className="tl-rivet tl-rivet-br" />
                    <span className="tl-glyph">?</span>
                  </span>
                  {/* dust puffs, skipped on low tier */}
                  <span data-dust className="tl-dust" />
                  <span data-dust className="tl-dust" />
                  <span data-dust className="tl-dust" />
                </div>

                {/* HUD callout — thick-border pixel box in the row's own colour */}
                <div className={`tl-hud ${s.x > 0.5 ? 'tl-hud-left' : 'tl-hud-right'}`}>
                  <div className="tl-hud-bar">
                    {/* ASCII hyphen, not an en dash: this line is set in
                        Press Start 2P, whose pixel face has no en dash. */}
                    <span className="tl-hud-time">{scheduleRange(s.row, '-')}</span>
                    <span className="tl-hud-track">{s.row.track}</span>
                  </div>
                  <div className="tl-hud-body">
                    {s.slug ? (
                      <Link
                        href={`/events/${s.slug}`}
                        scroll={false}
                        className="tl-hud-name focus-era"
                      >
                        {s.row.slot}
                      </Link>
                    ) : (
                      <span className="tl-hud-name">{s.row.slot}</span>
                    )}
                    <span className="tl-hud-venue">{s.row.venue}</span>
                  </div>
                </div>

                {runEnd && <span aria-hidden className="tl-turn" />}
              </li>
            );
          })}
        </ol>

        {/* ── the Voyager ──────────────────────────────────────────────────── */}
        <div ref={spriteRef} className="tl-sprite" aria-hidden>
          {/* Box size comes from --tl-sprite-w/h in CSS so the feet-on-block
              maths has a single source of truth. */}
          <div ref={poseRef} data-pose="idle" className="tl-sprite-inner">
            <VoyagerSprite pose="idle" />
          </div>
        </div>

        {/* a couple of drifting bit-mites for atmosphere */}
        {tier === 'high' && (
          <>
            <div aria-hidden className="tl-mite tl-mite-a">
              <BitMiteSprite size={30} />
            </div>
            <div aria-hidden className="tl-mite tl-mite-b">
              <BitMiteSprite size={24} />
            </div>
          </>
        )}
      </div>

      {/* ── bottom scenery ───────────────────────────────────────────────── */}
      <div aria-hidden className="tl-scenery tl-scenery-bottom">
        <div className="tl-ground" />
        <div className="tl-hill tl-hill-c" />
        <div className="tl-pipe tl-pipe-short" />
      </div>

      {SCHEDULE_IS_PLACEHOLDER && (
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-amber/70">
          ⚠ indicative timings — final run-of-show to be confirmed
        </p>
      )}

      {/* Screen readers and no-JS get the schedule as a plain table, not a
          staircase they cannot traverse. The visual track is aria-hidden'd
          at the section level in Schedule.tsx. */}
    </div>
  );
}
