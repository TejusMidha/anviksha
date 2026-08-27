'use client';

/**
 * Run of show.
 *
 * Two presentations of the same SCHEDULE data:
 *   - the brick-staircase timeline (default) — scroll-driven, decorative,
 *     and marked aria-hidden because a staircase is not something a screen
 *     reader can traverse
 *   - the terminal table — the accessible presentation, and the one that
 *     prints. Always in the DOM; the toggle only changes which is visible.
 *
 * Keeping both mounted is deliberate: the table is the semantic source for
 * assistive tech and for crawlers regardless of which view is showing.
 */

import { useState } from 'react';
import { FEST, SCHEDULE, SCHEDULE_IS_PLACEHOLDER } from '@/lib/content';
import EraBackdrop from './era/EraBackdrop';
import TimelineTrack from './timeline/TimelineTrack';

const TRACK_COLOR: Record<string, string> = {
  ALL: '#e8ecf4',
  TECHNICAL: '#39ff6a',
  'E-SPORTS': '#ff2e7e',
  'NON-TECH': '#8b5cff',
  ROBOTICS: '#a78bff',
  MEDIA: '#7fd0ff',
  'NEXT-GEN': '#4ce0ff',
};

export default function Schedule() {
  const [view, setView] = useState<'track' | 'table'>('track');

  return (
    <section id="schedule" className="era-1 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <EraBackdrop era={1} />

      <header className="relative mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            03 / Run of Show
          </p>
          <h2 className="crt-aberrate mt-3 font-pixel text-lg leading-[1.6] text-white sm:text-2xl">
            <span className="text-phosphor">SCHEDULE</span>.LOG
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
            Scroll the level. Each block is one slot on the day — land on it to read the time,
            event and venue.
          </p>
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em]">
          {(['track', 'table'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`focus-era tap-target border px-3 ${
                view === v
                  ? 'border-phosphor bg-phosphor/10 text-phosphor'
                  : 'border-white/15 text-white/45 hover:text-white/70'
              }`}
            >
              {v === 'track' ? 'LEVEL' : 'LIST'}
            </button>
          ))}
        </div>
      </header>

      {/* Decorative view. aria-hidden: the table below carries the same data
          in a form assistive tech can actually navigate. */}
      <div className={view === 'track' ? 'relative' : 'sr-only'} aria-hidden={view === 'track'}>
        <TimelineTrack />
      </div>

      <div className={view === 'table' ? 'terminal relative overflow-hidden' : 'sr-only'}>
        <div className="flex items-center gap-2 border-b border-phosphor/20 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-arcade/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-phosphor/70" />
          <span className="ml-3 font-mono text-[10px] text-phosphor/70">
            anviksha@stme:~$ cat schedule --date {FEST.dateShort}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-mono text-[12px]">
            <caption className="sr-only">
              Run of show for {FEST.name} on {FEST.date}
            </caption>
            <thead>
              <tr className="border-b border-phosphor/15 text-left">
                {['TIME', 'SLOT', 'VENUE', 'TRACK'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 font-normal uppercase tracking-[0.2em] text-phosphor/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((row, i) => (
                <tr
                  key={`${row.time}-${row.slot}`}
                  className="arcade-cut border-b border-white/5 hover:bg-phosphor/[0.08]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-phosphor">{row.time}</td>
                  <td className="px-4 py-3 text-white/85">
                    <span className="mr-2 text-white/25">{String(i + 1).padStart(2, '0')}</span>
                    {row.slot}
                  </td>
                  <td className="px-4 py-3 text-white/50">{row.venue}</td>
                  <td className="px-4 py-3">
                    <span
                      className="border px-2 py-1 text-[10px] tracking-[0.14em]"
                      style={{
                        color: TRACK_COLOR[row.track] ?? '#e8ecf4',
                        borderColor: `${TRACK_COLOR[row.track] ?? '#e8ecf4'}44`,
                      }}
                    >
                      {row.track}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-phosphor/15 px-4 py-3 font-mono text-[11px] text-phosphor/70">
          {SCHEDULE.length} entries · all timings IST
          <span className="animate-blink ml-1">_</span>
        </div>
      </div>

      {SCHEDULE_IS_PLACEHOLDER && view === 'table' && (
        <p className="relative mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-amber/70">
          ⚠ indicative timings — final run-of-show to be confirmed
        </p>
      )}
    </section>
  );
}
