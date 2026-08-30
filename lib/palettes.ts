/**
 * Per-event colour, pulled from that event's own page in the ANVIKSHA '26
 * brochure. Plain data — no three.js, no 'use client' — because two very
 * different consumers read it:
 *
 *   1. the 21 procedural 3D objects (components/three/scenes/*)
 *   2. the timeline callout boxes (components/timeline/*)
 *
 * so a row in the run-of-show and the object on its event card are guaranteed
 * to be the same colour without either side hardcoding a hex.
 *
 * `base`   body / structure
 * `accent` secondary structure, trim
 * `hot`    emissive highlight — the colour the object "glows"
 * `rim`    key light colour for that scene's lighting rig
 */

import type { SceneKey } from './content';

export interface EventPalette {
  base: string;
  accent: string;
  hot: string;
  rim: string;
}

export const PALETTES: Record<SceneKey, EventPalette> = {
  /* ── TECHNICAL — deep violet base, neon circuit-trace mood ─────────────── */
  captureTheFlag: { base: '#4a2d8f', accent: '#39ff6a', hot: '#7dff9f', rim: '#8b5cff' },
  escapeTheServer: { base: '#5b3a86', accent: '#e39bd8', hot: '#ffb347', rim: '#ff7a5c' },
  bridgeWars: { base: '#ff2e7e', accent: '#4ce0ff', hot: '#ffd76b', rim: '#ff2e7e' },
  algorithmAuction: { base: '#1e2168', accent: '#4ce0ff', hot: '#ff5ce0', rim: '#6a5cff' },
  techMinute: { base: '#8b2fbf', accent: '#ff4fa8', hot: '#4ce0ff', rim: '#c73fd6' },

  /* ── NON-TECHNICAL — retro console warmth over violet ──────────────────── */
  techTunes: { base: '#3a2a6b', accent: '#4ce0ff', hot: '#ff4fa8', rim: '#8b5cff' },
  parallelProtocol: { base: '#2a2358', accent: '#8b5cff', hot: '#4ce0ff', rim: '#8b5cff' },
  nexusNegotiator: { base: '#2c4a8f', accent: '#ffb42e', hot: '#ffd76b', rim: '#ffa524' },
  arrayPataHai: { base: '#ff5ca8', accent: '#4ce0ff', hot: '#ffe27a', rim: '#ff6bb5' },
  secretSeekers: { base: '#4aa8e0', accent: '#c94a2e', hot: '#ffc93c', rim: '#7cc9f0' },

  /* ── E-SPORTS — abstract colour/mood only, no franchise marks ──────────── */
  valorant: { base: '#ff2e7e', accent: '#7b3fd4', hot: '#4ce0ff', rim: '#ff4f9a' },
  fifa: { base: '#2a3555', accent: '#d9a441', hot: '#ffd76b', rim: '#8fa4d6' },
  mortalKombat: { base: '#c4123f', accent: '#ff3d7a', hot: '#fff3e0', rim: '#ff2e5c' },
  tekken: { base: '#0f0f14', accent: '#e02020', hot: '#ff6b4a', rim: '#ff3020' },

  /* ── ROBOTICS — cyan/magenta line-art over deep purple ─────────────────── */
  roboSoccer: { base: '#b9c4d6', accent: '#ff3d5c', hot: '#4ce0ff', rim: '#ff6b8f' },
  roboRace: { base: '#c8d4e6', accent: '#ff8b2e', hot: '#4ce0ff', rim: '#ffa04a' },

  /* ── PHOTOGRAPHY / DESIGN & MEDIA — neon invader magenta + cyan ────────── */
  throughTheLens: { base: '#1a1726', accent: '#ff3dc4', hot: '#4ce0ff', rim: '#ff5cd0' },
  questToCinema: { base: '#6b4a7a', accent: '#ffb42e', hot: '#ffd76b', rim: '#e04a5c' },
  interfaceQuest: { base: '#ff6b9d', accent: '#4c8fe0', hot: '#ffd76b', rim: '#ff8fb5' },

  /* ── NEXT-GEN / AI ─────────────────────────────────────────────────────── */
  gameAthon: { base: '#4ce0ff', accent: '#8b5cff', hot: '#ff3d5c', rim: '#4ce0ff' },
};

/** Fallback for anything not tied to a single event (breaks, ceremonies). */
export const NEUTRAL_PALETTE: EventPalette = {
  base: '#c9502e',
  accent: '#ffb42e',
  hot: '#ffd76b',
  rim: '#ff8b4a',
};
