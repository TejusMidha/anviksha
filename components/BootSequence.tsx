'use client';

/**
 * First-paint boot sequence — a "signal acquired" line in mono type that
 * resolves from pixel to smooth, echoing the era arc in about a second.
 *
 * Rules it obeys:
 *  - Never blocks interactivity. It is a fixed overlay with pointer-events
 *    off after the first frame; the page underneath is live and scrollable
 *    the whole time. Nothing waits on it.
 *  - Runs on TRUE first load only. sessionStorage is set the moment it starts,
 *    so client-side navigation (opening an event modal, deep-linking, going
 *    back) never replays it. A hard reload in the same tab skips it too —
 *    the interesting case is "arrived at the site", not "re-rendered".
 *  - Caps at ~1.25s, and any key, click or scroll dismisses it immediately.
 *  - Skipped entirely under prefers-reduced-motion.
 */

import { useCallback, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';

const SEEN_KEY = 'anviksha:booted';
const TOTAL_MS = 1250;

const LINES = [
  'ANVIKSHA // EPOCH',
  'establishing uplink ......... ok',
  'charting digital voyage ..... ok',
  'signal acquired',
];

export default function BootSequence() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) {
      setPhase('done');
      return;
    }

    let seen = true;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
      // Written up front, not on completion: if the user navigates away
      // mid-sequence it still must not replay.
      if (!seen) sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Private mode / storage disabled — treat as already seen rather than
      // showing the boot screen on every single navigation.
      seen = true;
    }

    if (seen) {
      setPhase('done');
      return;
    }

    setPhase('running');

    const stepMs = TOTAL_MS / (LINES.length + 1);
    const timers = LINES.map((_, i) =>
      setTimeout(() => setStep(i + 1), stepMs * (i + 1)),
    );
    const end = setTimeout(() => setPhase('done'), TOTAL_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, [reduced]);

  const dismiss = useCallback(() => setPhase('done'), []);

  useEffect(() => {
    if (phase !== 'running') return;
    const opts = { passive: true } as const;
    window.addEventListener('keydown', dismiss);
    window.addEventListener('pointerdown', dismiss, opts);
    window.addEventListener('wheel', dismiss, opts);
    window.addEventListener('touchstart', dismiss, opts);
    return () => {
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('touchstart', dismiss);
    };
  }, [phase, dismiss]);

  if (phase === 'idle' || phase === 'done') {
    // 'idle' is the server/first-client frame: render nothing, so the overlay
    // can never be what the user is waiting on.
    return null;
  }

  return (
    <div
      aria-hidden
      onTransitionEnd={dismiss}
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-void"
      style={{ animation: `boot-out 260ms ease ${TOTAL_MS - 260}ms forwards` }}
    >
      <div className="crt-scanlines absolute inset-0 opacity-60" />

      <div className="relative w-full max-w-md px-6">
        {LINES.map((line, i) => {
          const shown = i < step;
          const isTitle = i === 0;
          return (
            <p
              key={line}
              className={
                isTitle
                  ? 'mb-4 font-pixel text-[13px] leading-none text-phosphor'
                  : 'font-mono text-[11px] leading-relaxed text-phosphor/70'
              }
              style={{
                opacity: shown ? 1 : 0,
                // The title starts blocky and letter-spaced, then tightens —
                // pixel resolving into smooth, the whole site's arc in 1s.
                letterSpacing: isTitle ? (shown ? '0.12em' : '0.5em') : undefined,
                filter: isTitle && !shown ? 'blur(3px)' : 'none',
                transition: 'opacity 180ms linear, letter-spacing 420ms ease, filter 420ms ease',
              }}
            >
              {line}
              {i === LINES.length - 1 && shown && <span className="animate-blink ml-1">_</span>}
            </p>
          );
        })}
      </div>

      <style>{`@keyframes boot-out { to { opacity: 0; visibility: hidden; } }`}</style>
    </div>
  );
}
