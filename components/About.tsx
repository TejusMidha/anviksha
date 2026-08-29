/**
 * "About the fest" — the section a first-time visitor reads before they know
 * what ANVIKSHA is. Every number is derived from lib/content.ts.
 *
 * Era 2 styling, and this is where the branding hierarchy is stated in full
 * and in plain language: the fest, then the theme, then — once — the eras of
 * gaming as the visual system that carries it. After this section the eras
 * are referred to as tracks, never as a second theme.
 */

import { ALL_EVENTS, ERAS, FEST } from '@/lib/content';
import EraBackdrop from './era/EraBackdrop';

export default function About() {
  const stats = [
    { k: 'Date', v: FEST.dateShort },
    { k: 'Venue', v: 'STME NMIMS' },
    { k: 'Events', v: String(ALL_EVENTS.length) },
    { k: 'Tracks', v: String(ERAS.length) },
    { k: 'Format', v: FEST.cadence },
  ];

  const editions = FEST.pastEditions.join(' & ');

  return (
    <section id="about" className="era-2 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <EraBackdrop era={2} />

      <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            01 / About the fest
          </p>

          <h2 className="section-title mt-3 font-pixel text-lg leading-[1.6] sm:text-2xl">
            WHAT IS ANVIKSHA?
          </h2>

          <div className="mt-6 max-w-2xl space-y-4 text-white/70">
            <p className="text-lg leading-relaxed">
              ANVIKSHA is the flagship techfest of the{' '}
              <span className="text-white/90">{FEST.institute}</span> at {FEST.university}. One day,
              five tracks, {ALL_EVENTS.length} events — engineering, e-sports, robotics, media and
              AI, run end to end by students.
            </p>
            <p className="leading-relaxed text-white/60">
              This is the {FEST.edition} — <span className="text-white/90">{FEST.subtitle}</span> —
              following the {editions} editions.
            </p>
            <p className="leading-relaxed text-white/60">
              This year&apos;s theme is{' '}
              <span className="text-white/90">{FEST.theme}</span>. {FEST.themePlain}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.k} className="era-surface px-4 py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {s.k}
                </div>
                <div className="era-text mt-2 font-pixel text-[11px] leading-none">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="era-surface relative overflow-hidden p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-arcade">
            Track manifest
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Each track is a leg of the voyage, and each is styled as one era of gaming — the
            visual language we use to tell the theme, from arcade to AI.
          </p>

          <ul className="mt-5 divide-y divide-[color:var(--chrome-line-soft)]">
            {ERAS.map((era) => (
              <li key={era.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0"
                    style={{
                      background: era.accent,
                      borderRadius: `${(era.id - 1) * 2.5}px`,
                      boxShadow: `0 0 ${era.id * 4}px ${era.accent}`,
                    }}
                  />
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/90">
                      {era.category}
                    </div>
                    <div className="font-pixel text-[8px] leading-[1.7] text-white/35">
                      {era.headline}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/35">
                  {era.events.length} {era.events.length === 1 ? 'event' : 'events'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
