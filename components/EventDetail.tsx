'use client';

/**
 * The event detail body — shared verbatim by the intercepted modal
 * (app/@modal/(.)events/[slug]) and the standalone page (app/events/[slug]).
 * One component, so a deep link and a modal can never drift apart.
 *
 * Fields that have no confirmed value yet are typed `| null` in content.ts and
 * the row is omitted entirely — nothing renders "TBD" on the live site.
 */

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import {
  eventDuration,
  eventScheduleRows,
  eventVenue,
  PRIZE_POOL,
  type AnvikshaEvent,
  type Era,
} from '@/lib/content';
import { useDeviceTier, useInViewport, usePrefersReducedMotion } from '@/lib/hooks';
import {
  ClockIcon,
  ExternalIcon,
  PinIcon,
  RulesIcon,
  TrophyIcon,
  UsersIcon,
} from './Icons';

const EventCanvas = dynamic(() => import('@/components/three/EventCanvas'), {
  ssr: false,
  loading: () => null,
});

function Fact({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="era-surface flex items-start gap-3 p-4">
      <span className="era-text mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
          {label}
        </div>
        <div className="mt-1.5 text-sm leading-snug text-white/85">{children}</div>
      </div>
    </div>
  );
}

export default function EventDetail({
  event,
  era,
  /** The modal already renders the 3D scene in its header; the page does too,
      but at a different size. Passed in so the two framings can differ. */
  canvasHeight = 320,
}: {
  event: AnvikshaEvent;
  era: Era;
  canvasHeight?: number;
}) {
  const canvasWrap = useRef<HTMLDivElement>(null);
  const inView = useInViewport(canvasWrap, { rootMargin: '0px', threshold: 0.2 });
  const reduced = usePrefersReducedMotion();
  const tier = useDeviceTier();

  const duration = eventDuration(event);
  const venue = eventVenue(event);
  const rows = eventScheduleRows(event);

  /* The detail view's canvas does NOT take a render slot from the semaphore.
     It is the only scene the user is looking at, and every background card has
     already been suspended by the modal (see suspendBackgroundCanvases), so
     the live-context and running-loop counts are unchanged. */
  return (
    <div className={`era-${era.id}`}>
      {/* --- Scene + title -------------------------------------------------- */}
      <div ref={canvasWrap} className="relative w-full" style={{ height: canvasHeight }}>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 65% at 50% 55%, color-mix(in srgb, var(--era-color) 14%, transparent) 0%, transparent 72%)',
          }}
        />
        <EventCanvas scene={event.scene} active={inView} reduced={reduced} tier={tier} />
      </div>

      <div className="border-t border-white/5 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="era-chip px-2.5 py-1 font-pixel text-[8px] leading-none">
            {era.label}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            {era.category}
          </span>
        </div>

        <h1 className="era-text mt-4 font-pixel text-base leading-[1.6] sm:text-xl">
          {event.name}
        </h1>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
          {event.tagline}
        </p>

        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/75">{event.blurb}</p>

        {/* --- Facts. Every one omitted when its value is null. ------------- */}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Fact icon={<UsersIcon size={17} />} label="Format">
            {event.format}
          </Fact>

          {event.teamSize && (
            <Fact icon={<UsersIcon size={17} />} label="Team size">
              {event.teamSize}
            </Fact>
          )}

          {duration && (
            <Fact icon={<ClockIcon size={17} />} label="Duration">
              {duration}
            </Fact>
          )}

          {venue && (
            <Fact icon={<PinIcon size={17} />} label="Venue">
              {venue}
            </Fact>
          )}

          {event.prize !== null && (
            <Fact icon={<TrophyIcon size={17} />} label="Prize">
              <span className="text-amber">
                {PRIZE_POOL.currency}
                {event.prize.toLocaleString('en-IN')}
              </span>
            </Fact>
          )}
        </div>

        {/* --- Run of show for this event ---------------------------------- */}
        {rows.length > 0 && (
          <div className="mt-8">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              When it runs
            </h2>
            <ul className="mt-3 space-y-2">
              {rows.map((r) => (
                <li
                  key={`${r.time}-${r.slot}`}
                  className="flex items-baseline gap-4 font-mono text-[12px]"
                >
                  <span className="era-text shrink-0 tabular-nums">{r.time}</span>
                  <span className="text-white/70">{r.slot}</span>
                  <span className="ml-auto shrink-0 text-white/35">{r.venue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- Rules ------------------------------------------------------- */}
        {event.rules && event.rules.length > 0 && (
          <div className="mt-8">
            <h2 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              <RulesIcon size={14} />
              Rules
            </h2>
            <ul className="mt-3 space-y-2.5">
              {event.rules.map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/70">
                  <span className="era-text shrink-0 font-mono text-[11px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- CTA. Only a real Unstop URL renders a button. ---------------- */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          {event.unstopUrl ? (
            <a
              href={event.unstopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-amber focus-era tap-target inline-flex gap-2 px-6 py-4 font-pixel text-[10px] leading-none transition-transform hover:scale-[1.03]"
            >
              REGISTER ON UNSTOP
              <ExternalIcon size={14} />
            </a>
          ) : (
            <a
              href="/#register"
              className="focus-era tap-target inline-flex items-center gap-2 border border-[color:var(--era-color)]/40 px-6 py-4 font-pixel text-[10px] leading-none text-[color:var(--era-color)] transition-colors hover:bg-[color-mix(in_srgb,var(--era-color)_12%,transparent)]"
              style={{ borderRadius: 'var(--era-radius)' }}
            >
              REGISTRATION INFO
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
