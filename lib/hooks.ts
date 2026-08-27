'use client';

import { useEffect, useId, useState, type RefObject } from 'react';

/* -------------------------------------------------------------------------- */
/* prefers-reduced-motion                                                      */
/* -------------------------------------------------------------------------- */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

/* -------------------------------------------------------------------------- */
/* Viewport visibility                                                         */
/* -------------------------------------------------------------------------- */
export function useInViewport<T extends HTMLElement>(
  ref: RefObject<T>,
  { rootMargin = '200px', threshold = 0.15 }: { rootMargin?: string; threshold?: number } = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold]);

  return inView;
}

/* -------------------------------------------------------------------------- */
/* Global render budget                                                        */
/*                                                                             */
/* Even with IntersectionObserver, a wide desktop viewport can hold 4-5 event  */
/* cards at once. This is a module-level semaphore: at most MAX_ACTIVE canvases */
/* are allowed to run their render loop, everyone else waits (and renders a    */
/* single static frame instead). Slots are handed out in request order.        */
/* -------------------------------------------------------------------------- */
const MAX_ACTIVE_CANVASES = 3;

const activeSlots = new Set<string>();
const slotQueue: string[] = [];
const slotListeners = new Map<string, (granted: boolean) => void>();

function pump() {
  while (activeSlots.size < MAX_ACTIVE_CANVASES && slotQueue.length > 0) {
    const next = slotQueue.shift()!;
    if (!slotListeners.has(next)) continue; // unmounted while queued
    activeSlots.add(next);
    slotListeners.get(next)?.(true);
  }
}

function requestSlot(id: string) {
  if (activeSlots.has(id) || slotQueue.includes(id)) return;
  slotQueue.push(id);
  pump();
}

function releaseSlot(id: string) {
  const queued = slotQueue.indexOf(id);
  if (queued >= 0) slotQueue.splice(queued, 1);
  if (activeSlots.delete(id)) {
    slotListeners.get(id)?.(false);
    pump();
  }
}

/**
 * Returns true when this component is allowed to animate.
 * Pass `wanted = true` while the element is on screen.
 */
export function useRenderSlot(wanted: boolean): boolean {
  const id = useId();
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    slotListeners.set(id, setGranted);
    return () => {
      slotListeners.delete(id);
      releaseSlot(id);
    };
  }, [id]);

  useEffect(() => {
    if (wanted) requestSlot(id);
    else releaseSlot(id);
  }, [wanted, id]);

  return granted;
}

/* -------------------------------------------------------------------------- */
/* Coarse device tier — drives segment / particle counts                       */
/* -------------------------------------------------------------------------- */
export type DeviceTier = 'low' | 'high';

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('high');

  useEffect(() => {
    /* 768px in CSS pixels, which is what matchMedia reports regardless of
       device pixel ratio — so every common phone width (360 / 390 / 414) and
       iPad portrait (768) resolve to 'low'. Core count catches wide-but-weak
       devices that the width test would miss. */
    const mq = window.matchMedia('(max-width: 768px)');
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;

    const update = () => setTier(mq.matches || fewCores ? 'low' : 'high');
    update();

    /* Re-evaluated on rotation and on resize: a phone turned landscape can
       cross 768px, and a canvas that mounted at 'high' would otherwise keep
       desktop segment counts for the rest of the session. */
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return tier;
}

/* -------------------------------------------------------------------------- */
/* Canvas suspension                                                           */
/*                                                                             */
/* The event-detail modal mounts its own <Canvas> on top of an era strip that  */
/* may already have up to MAX_ACTIVE_CANVASES running. Rather than raise the   */
/* ceiling, the modal suspends every background canvas: they release their     */
/* render slots (dropping to frameloop="demand", costing nothing per frame)    */
/* and the modal's own canvas takes one of the freed slots. Net live contexts  */
/* and net running loops are unchanged.                                        */
/* -------------------------------------------------------------------------- */
let suspendCount = 0;
const suspendListeners = new Set<(v: boolean) => void>();

function broadcastSuspension() {
  const v = suspendCount > 0;
  suspendListeners.forEach((fn) => fn(v));
}

/** Call on modal open; the returned function undoes exactly one suspension. */
export function suspendBackgroundCanvases(): () => void {
  suspendCount++;
  broadcastSuspension();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    suspendCount = Math.max(0, suspendCount - 1);
    broadcastSuspension();
  };
}

/** True while any modal with its own canvas is open. */
export function useCanvasesSuspended(): boolean {
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    setSuspended(suspendCount > 0);
    suspendListeners.add(setSuspended);
    return () => {
      suspendListeners.delete(setSuspended);
    };
  }, []);

  return suspended;
}

/* -------------------------------------------------------------------------- */
/* Count-up                                                                    */
/*                                                                             */
/* rAF-driven so it never schedules a render faster than the display can show  */
/* one, and it stops dead on the final frame rather than ticking on an         */
/* interval forever. Honours reduced motion by jumping straight to the target. */
/* -------------------------------------------------------------------------- */
export function useCountUp(target: number, run: boolean, durationMs = 1600): number {
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!run) return;
    if (reduced) {
      setValue(target);
      return;
    }

    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutExpo — fast off the line, settles precisely on the number.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, durationMs, reduced]);

  return value;
}

/* -------------------------------------------------------------------------- */
/* Scroll-driven CSS variable                                                  */
/*                                                                             */
/* Writes a number straight onto the element's style as a custom property, on  */
/* a rAF tick, with zero React state — so parallax and speed lines never       */
/* re-render the tree. Only runs while the element is on screen.               */
/* -------------------------------------------------------------------------- */
export function useScrollVar<T extends HTMLElement>(
  ref: RefObject<T>,
  varName: string,
  /** Maps the element's 0..1 progress through the viewport to a value. */
  map: (progress: number) => string,
) {
  const inView = useInViewport(ref, { rootMargin: '100px', threshold: 0 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduced) return;

    let raf = 0;
    let queued = false;

    const write = () => {
      queued = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the element's top hits the bottom of the viewport,
      // 1 when its bottom leaves the top.
      const raw = (vh - rect.top) / (vh + rect.height);
      el.style.setProperty(varName, map(Math.max(0, Math.min(1, raw))));
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(write);
    };

    write();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref, varName, map, inView, reduced]);
}

/* -------------------------------------------------------------------------- */
/* Mount budget — a HARD ceiling on live WebGL contexts                        */
/*                                                                             */
/* useRenderSlot caps how many canvases RUN. This caps how many EXIST.         */
/*                                                                             */
/* Those are different problems. A browser allows only ~16 live WebGL          */
/* contexts, and creating the 17th silently kills the oldest — the page does   */
/* not error, scenes just go black. IntersectionObserver margins alone cannot  */
/* bound this, because the era rails are horizontal: a tall viewport can hold  */
/* two rails at once and every card in both is "near the viewport". Measured   */
/* on a 1536x730 viewport at era 3, that was 12 mounted event canvases + the   */
/* hero field = 13 contexts, with the detail modal about to add a 14th.        */
/*                                                                             */
/* So mounting is a budget, not a margin. At most MAX_MOUNTED cards hold a     */
/* canvas, and the winners are the ones nearest the viewport — measured at     */
/* the moment the set changes, so scrolling toward a card evicts the card you  */
/* are scrolling away from rather than starving the new one.                   */
/* -------------------------------------------------------------------------- */
const MAX_MOUNTED_CANVASES = 8;

interface MountEntry {
  wanted: boolean;
  el: HTMLElement | null;
  granted: boolean;
  set: (v: boolean) => void;
}

const mountRegistry = new Map<string, MountEntry>();

/* The budget has to be re-evaluated on SCROLL, not only when a card's `wanted`
   flips. Without this, a stretch of scrolling with no wanted-transition leaves
   the slots held by whichever cards claimed them first: scrolling from era 1
   into era 3 left all 8 contexts on era-1/2 cards that were long gone, and
   era 3 rendered empty wells. Rebalancing is 21 getBoundingClientRect reads on
   a rAF tick, and only while the user is actually scrolling. */
let scrollHooked = false;
let scrollQueued = false;

/* Mount decisions do not need to be made every frame. Cards mount 400px
   before they are needed, so re-evaluating a few times a second is ample —
   and rebalancing per frame measured ~166us of forced layout (21 rects) plus,
   worse, could flip React state and create/destroy WebGL contexts in the
   middle of a flick. Both showed up as whole-page scroll jank.

   Throttled to REBALANCE_MS, with a trailing call so the final resting
   position is always evaluated. */
const REBALANCE_MS = 120;
let lastRebalance = 0;
let trailingTimer: ReturnType<typeof setTimeout> | null = null;

function runRebalance() {
  lastRebalance = performance.now();
  rebalanceMounts();
}

function onGlobalScroll() {
  if (scrollQueued) return;

  const since = performance.now() - lastRebalance;
  if (since < REBALANCE_MS) {
    // Inside the throttle window: make sure the last scroll position still
    // gets evaluated once the user stops.
    if (trailingTimer) clearTimeout(trailingTimer);
    trailingTimer = setTimeout(runRebalance, REBALANCE_MS - since);
    return;
  }

  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    runRebalance();
  });
}

function hookScroll() {
  if (scrollHooked || typeof window === 'undefined') return;
  scrollHooked = true;
  window.addEventListener('scroll', onGlobalScroll, { passive: true });
  window.addEventListener('resize', onGlobalScroll, { passive: true });
}

function unhookScroll() {
  if (!scrollHooked || mountRegistry.size > 0) return;
  scrollHooked = false;
  window.removeEventListener('scroll', onGlobalScroll);
  window.removeEventListener('resize', onGlobalScroll);
}

/** Vertical+horizontal distance from the viewport's centre, in CSS px. */
function distanceFromViewport(el: HTMLElement | null): number {
  if (!el) return Number.POSITIVE_INFINITY;
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const dx = Math.max(0, Math.max(-r.right, r.left - vw));
  const dy = Math.max(0, Math.max(-r.bottom, r.top - vh));
  return Math.hypot(dx, dy);
}

function rebalanceMounts() {
  const contenders = [...mountRegistry.entries()]
    .filter(([, e]) => e.wanted)
    .map(([id, e]) => ({ id, e, d: distanceFromViewport(e.el) }))
    .sort((a, b) => a.d - b.d);

  const winners = new Set(contenders.slice(0, MAX_MOUNTED_CANVASES).map((c) => c.id));

  mountRegistry.forEach((entry, id) => {
    const shouldHold = winners.has(id);
    if (entry.granted === shouldHold) return;
    entry.granted = shouldHold;
    entry.set(shouldHold);
  });
}

/**
 * Returns true when this card is allowed to hold a live WebGL context.
 * Pass `wanted = true` while the card is near the viewport.
 */
export function useMountSlot(wanted: boolean, ref: RefObject<HTMLElement>): boolean {
  const id = useId();
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    mountRegistry.set(id, { wanted: false, el: null, granted: false, set: setGranted });
    hookScroll();
    return () => {
      mountRegistry.delete(id);
      rebalanceMounts();
      unhookScroll();
    };
  }, [id]);

  useEffect(() => {
    const entry = mountRegistry.get(id);
    if (!entry) return;
    entry.wanted = wanted;
    entry.el = ref.current;
    rebalanceMounts();
  }, [wanted, id, ref]);

  return granted;
}
