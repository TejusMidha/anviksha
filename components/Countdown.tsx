'use client';

/**
 * Live countdown to the fest.
 *
 * Deliberately isolated: this component owns the only setInterval on the page
 * and renders nothing but its own digits, so a tick can never re-render the
 * hero, the 3D field, or anything else. It also ticks once per second exactly
 * — not on rAF — because a clock does not need 60 updates a second.
 *
 * Three states: counting down / Live Now / Concluded.
 *
 * SSR note: the server has no idea what "now" is on the client, so the first
 * paint renders the static shell with the date rather than a mismatched clock,
 * and the digits appear on the first tick. That keeps the critical hero copy
 * (name, theme, date, venue, CTA) fully server-rendered and instant.
 */

import { useEffect, useState } from 'react';
import { FEST } from '@/lib/content';

type Phase = 'before' | 'during' | 'after';

interface Remaining {
  phase: Phase;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const START = new Date(FEST.startsAtISO).getTime();
const END = new Date(FEST.endsAtISO).getTime();

function compute(now: number): Remaining {
  if (now >= END) return { phase: 'after', days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (now >= START) return { phase: 'during', days: 0, hours: 0, minutes: 0, seconds: 0 };

  const delta = Math.max(0, START - now);
  const s = Math.floor(delta / 1000);
  return {
    phase: 'before',
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[3.6rem] flex-col items-center gap-1 px-1 sm:min-w-[4.5rem]">
      <span
        className="era-text font-pixel text-lg leading-none tabular-nums sm:text-2xl"
        // The digits change every second; fixing the width stops the row
        // from reflowing on every tick.
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [t, setT] = useState<Remaining | null>(null);

  useEffect(() => {
    setT(compute(Date.now()));
    const id = setInterval(() => setT(compute(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  // First paint (and no-JS): the date itself, not an empty box.
  if (!t) {
    return (
      <div
        className="era-surface inline-flex items-center gap-3 px-5 py-3"
        aria-label={`Countdown to ${FEST.date}`}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
          Gates open {FEST.date} · 09:30 IST
        </span>
      </div>
    );
  }

  if (t.phase === 'during') {
    return (
      <div className="era-surface inline-flex items-center gap-3 px-5 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-phosphor/70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-phosphor" />
        </span>
        <span className="font-pixel text-[11px] leading-none text-phosphor">LIVE NOW</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          {FEST.venueShort}
        </span>
      </div>
    );
  }

  if (t.phase === 'after') {
    return (
      <div className="era-surface inline-flex items-center gap-3 px-5 py-3">
        <span className="font-pixel text-[11px] leading-none text-white/70">FEST CONCLUDED</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Thanks for playing
        </span>
      </div>
    );
  }

  return (
    <div
      className="era-surface inline-flex items-stretch divide-x divide-white/10 px-2 py-3"
      role="timer"
      aria-live="off"
      aria-label={`Time remaining until ${FEST.name}: ${t.days} days, ${t.hours} hours, ${t.minutes} minutes`}
    >
      <Unit value={t.days} label="Days" />
      <Unit value={t.hours} label="Hrs" />
      <Unit value={t.minutes} label="Min" />
      <Unit value={t.seconds} label="Sec" />
    </div>
  );
}
