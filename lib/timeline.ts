/**
 * Layout maths for the brick-staircase timeline.
 *
 * Pure functions, no React, no DOM — so the staircase geometry can be reasoned
 * about (and the vertical positions checked against real clock time) without
 * rendering anything.
 *
 * Two things are deliberately NOT the same:
 *   - `y` comes from the row's ACTUAL time of day, so vertical distance on the
 *     track is elapsed time. Two events an hour apart sit an hour apart.
 *   - `x` is the staircase zigzag, which is pure ornament and carries no data.
 *
 * A pure time layout would overlap the rows that share a start time, so `y` is
 * relaxed by MIN_GAP: positions stay monotonic and keep their relative spacing
 * wherever there is room, and only clustered rows get pushed apart.
 */

import { ALL_EVENTS, type ScheduleRow } from './content';
import { NEUTRAL_PALETTE, PALETTES, type EventPalette } from './palettes';

/** Minimum vertical separation between two consecutive blocks, 0..1 of track. */
const MIN_GAP = 0.035;

/** Blocks per descending run before the staircase turns back. */
export const RUN_LENGTH: number = 5;

export interface TimelineStep {
  index: number;
  row: ScheduleRow;
  /** 0..1 down the track. Derived from clock time, relaxed for legibility. */
  y: number;
  /** 0..1 across the track. The staircase zigzag — ornament, not data. */
  x: number;
  /** Minutes since midnight, for the time axis. */
  minutes: number;
  /** This row's event colours, or the neutral brick palette for breaks. */
  palette: EventPalette;
  /** Slug when the row maps to a real event, so the block can link to it. */
  slug: string | null;
}

export interface HourMark {
  hour: number;
  label: string;
  /** 0..1 down the track, on the same scale the steps were laid out on. */
  y: number;
}

export interface Timeline {
  steps: TimelineStep[];
  hours: HourMark[];
}

/** "09:30" -> 570. Returns null for anything unparseable. */
export function parseTime(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Strips the display prefix so "Sidequest — X" still matches a schedule row. */
function needle(name: string) {
  return name.replace(/^sidequest\s*[—-]\s*/i, '').toLowerCase();
}

/**
 * Which event a run-of-show row belongs to, if any. Ceremonies, breaks and
 * registration correctly return null and take the neutral brick palette.
 */
export function eventForRow(row: ScheduleRow): { slug: string; palette: EventPalette } | null {
  const slot = row.slot.toLowerCase();
  // Longest name first, so "Robo Race" cannot be shadowed by a shorter match.
  const match = [...ALL_EVENTS]
    .sort((a, b) => needle(b.name).length - needle(a.name).length)
    .find((e) => slot.includes(needle(e.name)));
  if (!match) return null;
  return { slug: match.slug, palette: PALETTES[match.scene] };
}

export function buildTimeline(rows: ScheduleRow[]): Timeline {
  if (!rows.length) return { steps: [], hours: [] };

  const withMinutes = rows.map((row, i) => ({
    row,
    i,
    minutes: parseTime(row.time) ?? 0,
  }));

  const min = Math.min(...withMinutes.map((r) => r.minutes));
  const max = Math.max(...withMinutes.map((r) => r.minutes));
  const span = Math.max(1, max - min);

  /* Pass 1: true time position. Pass 2: push down anything that would collide,
     which keeps order and never moves a row EARLIER than its real time. */
  let cursor = -Infinity;
  const raw = withMinutes.map(({ row, i, minutes }) => {
    const trueY = (minutes - min) / span;
    const y = Math.max(trueY, cursor + MIN_GAP);
    cursor = y;
    return { row, i, minutes, y };
  });

  // Renormalise if the relaxation pushed the last step past 1.
  const overflow = raw[raw.length - 1].y;
  const squash = overflow > 1 ? 1 / overflow : 1;

  const steps: TimelineStep[] = raw.map(({ row, i, minutes, y }) => {
    // Boustrophedon: each run descends left-to-right, the next right-to-left,
    // so a 24-row track stays inside the viewport width without ever jumping.
    const run = Math.floor(i / RUN_LENGTH);
    const within = i % RUN_LENGTH;
    const t = RUN_LENGTH === 1 ? 0 : within / (RUN_LENGTH - 1);
    const x = run % 2 === 0 ? t : 1 - t;

    const ev = eventForRow(row);
    return {
      index: i,
      row,
      y: y * squash,
      x,
      minutes,
      palette: ev?.palette ?? NEUTRAL_PALETTE,
      slug: ev?.slug ?? null,
    };
  });

  // Hour marks on the same relaxed scale, so a tick lines up with the blocks
  // that share its hour.
  const firstHour = Math.floor(min / 60);
  const lastHour = Math.ceil(max / 60);
  const hours: HourMark[] = [];
  for (let h = firstHour; h <= lastHour; h++) {
    const mins = h * 60;
    // Place the tick by interpolating between the two steps that bracket it,
    // so ticks and blocks cannot drift apart after the relaxation pass.
    let y: number;
    const before = [...steps].reverse().find((s) => s.minutes <= mins);
    const after = steps.find((s) => s.minutes >= mins);
    if (!before) y = 0;
    else if (!after) y = 1;
    else if (after.minutes === before.minutes) y = before.y;
    else {
      const f = (mins - before.minutes) / (after.minutes - before.minutes);
      y = before.y + (after.y - before.y) * f;
    }
    hours.push({
      hour: h,
      label: `${String(h % 12 === 0 ? 12 : h % 12)}${h < 12 ? 'AM' : 'PM'}`,
      y: Math.max(0, Math.min(1, y)),
    });
  }

  return { steps, hours };
}
