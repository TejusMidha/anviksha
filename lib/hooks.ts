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
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    setTier(narrow || fewCores ? 'low' : 'high');
  }, []);

  return tier;
}
