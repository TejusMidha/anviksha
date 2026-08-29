'use client';

/**
 * Modal shell for the intercepted /events/[slug] route.
 *
 * Closing is `router.back()`, not a push: the modal was opened by a Link
 * navigation, so back is the exact inverse and the browser's own back gesture
 * (edge-swipe on iOS, the Android system back button) closes it the same way
 * the X does. Pushing "/" on close would leave a growing history stack that
 * fights the back button — the specific failure this avoids.
 *
 * While open it suspends every background canvas (see suspendBackgroundCanvases
 * in lib/hooks.ts), so mounting the detail view's own scene does not push the
 * page past the WebGL context ceiling or run more loops than the semaphore
 * allows.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { AnvikshaEvent, Era } from '@/lib/content';
import { suspendBackgroundCanvases } from '@/lib/hooks';
import { ERA_MOTION } from './era/EraBackdrop';
import EventDetail from './EventDetail';
import { CloseIcon } from './Icons';

export default function EventModal({ event, era }: { event: AnvikshaEvent; era: Era }) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => router.back(), [router]);

  /* Background canvases off for as long as this modal is mounted. */
  useEffect(() => suspendBackgroundCanvases(), []);

  /* Scroll lock + scrollbar-gap compensation so the page behind does not
     shift sideways when its scrollbar disappears. */
  useEffect(() => {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-gap', `${gap}px`);
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.style.removeProperty('--scrollbar-gap');
    };
  }, []);

  /* Esc to close, and a focus trap so Tab cannot walk into the page behind. */
  useEffect(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      restoreFocus.current?.focus?.();
    };
  }, [close]);

  const m = ERA_MOTION[era.id];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: era.id === 1 ? 0 : 0.2 }}
      >
        <div
          aria-hidden
          onClick={close}
          className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        />

        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${event.name} — event details`}
          tabIndex={-1}
          initial={m.initial}
          animate={m.animate}
          transition={m.transition}
          /* Bottom sheet on phones (reachable one-handed, close button and
             the primary CTA both sit low), centred dialog from sm up. */
          className={`era-${era.id} era-surface relative z-10 max-h-[92svh] w-full max-w-2xl
                      overflow-y-auto overscroll-contain outline-none
                      sm:max-h-[88svh]`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close event details"
            /* w-11 is load-bearing: `ml-auto` only pushes the button right
               once it has a definite width — a flex CONTAINER is block-level
               and would otherwise stretch the full panel, parking the icon on
               the left. */
            className="focus-era sticky top-2 z-20 ml-auto mr-2 flex h-11 w-11 items-center
                       justify-center border border-[color:var(--chrome-line)] bg-void/70 text-white/70
                       backdrop-blur transition-colors hover:border-[color:var(--era-color)]
                       hover:text-[color:var(--era-color)]"
            style={{ borderRadius: 'var(--era-radius)' }}
          >
            <CloseIcon size={20} />
          </button>

          {/* -mt pulls the scene back up under the sticky close button. */}
          <div className="-mt-[52px]">
            <EventDetail event={event} era={era} canvasHeight={260} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
