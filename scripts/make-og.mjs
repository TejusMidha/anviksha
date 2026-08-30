/**
 * Generates app/opengraph-image.png — the 1200x630 link-preview card that
 * WhatsApp, LinkedIn, Slack and mail clients show when this site is shared.
 *
 *   node scripts/make-og.mjs        (or: npm run og)
 *
 * WHY A COMMITTED PNG AND NOT next/og:
 * @vercel/og fails to prerender on Windows in Next 14 (fileURLToPath on its
 * wasm loader), which broke `next build` locally. A committed PNG has no
 * build-time dependency at all, renders identically on every host, and costs
 * one static file. `app/opengraph-image.png` is a Next file convention, so it
 * is picked up automatically — no metadata wiring needed.
 *
 * Nothing is downloaded and no image library is used: the card is drawn pixel
 * by pixel and encoded with Node's own zlib, so the whole card is source. The
 * type is a 5x7 bitmap font defined below — which is why the wordmark looks
 * like the site's Press Start 2P rather than a generic system sans.
 *
 * RE-RUN THIS whenever the date, venue or event count changes; the strings are
 * read from lib/content.ts values mirrored in TEXT below.
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const W = 1200;
const H = 630;

/* Palette — the site's own tokens (app/globals.css). */
const VOID = [8, 9, 13];
const CYAN = [76, 224, 255];
const MAGENTA = [255, 46, 126];
const AMBER = [255, 201, 60];
const BRICK = [201, 80, 46];
const PAPER = [238, 241, 250];

/* Copy. Mirrors lib/content.ts — keep in sync when the fest details change. */
const TEXT = {
  eyebrow: 'STME · NMIMS CHANDIGARH',
  title: "ANVIKSHA '26",
  subtitle: 'THE EPOCH',
  theme: 'DIGITAL VOYAGE: CHARTING THE COURSE OF INNOVATION',
  date: '12 SEPTEMBER 2026',
  stats: '20 EVENTS · 5 TRACKS',
  poweredBy: 'POWERED BY UNSTOP',
};

/* --- 5x7 bitmap font -------------------------------------------------------
   Uppercase only, plus the punctuation the card actually uses (the middot is
   the same separator the site uses in its chips). Each glyph is
   seven 5-character rows; '#' is ink. Advance is 6 columns (5 + 1 gap). */
const FONT = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  J: ['...##', '....#', '....#', '....#', '#...#', '#...#', '.###.'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '#####'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  "'": ['..#..', '..#..', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '..##.', '..##.'],
  ':': ['.....', '..##.', '..##.', '.....', '..##.', '..##.', '.....'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '·': ['.....', '.....', '..##.', '..##.', '.....', '.....', '.....'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

const GLYPH_W = 5;
const GLYPH_H = 7;
const ADVANCE = 6;

/* --- canvas ---------------------------------------------------------------- */
const px = new Uint8Array(W * H * 3);

function setPixel(x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
}

function blend(base, tint, a) {
  return [
    Math.round(base[0] + (tint[0] - base[0]) * a),
    Math.round(base[1] + (tint[1] - base[1]) * a),
    Math.round(base[2] + (tint[2] - base[2]) * a),
  ];
}

/** Ground + the site's two glow blooms, computed per pixel. */
function paintBackground() {
  const blooms = [
    { cx: 1080, cy: -70, rx: 900, ry: 560, color: MAGENTA, peak: 0.3 },
    { cx: 40, cy: 690, rx: 780, ry: 480, color: CYAN, peak: 0.22 },
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let c = VOID;
      for (const b of blooms) {
        const dx = (x - b.cx) / b.rx;
        const dy = (y - b.cy) / b.ry;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) {
          const falloff = (1 - d) * (1 - d);
          c = blend(c, b.color, falloff * b.peak);
        }
      }
      setPixel(x, y, c);
    }
  }
}

function rect(x, y, w, h, color) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setPixel(x + i, y + j, color);
}

function textWidth(str, scale) {
  return str.length * ADVANCE * scale - scale;
}

function drawText(str, x, y, scale, color) {
  let cx = x;
  for (const raw of str.toUpperCase()) {
    const glyph = FONT[raw] ?? FONT[' '];
    for (let row = 0; row < GLYPH_H; row++) {
      for (let col = 0; col < GLYPH_W; col++) {
        if (glyph[row][col] !== '#') continue;
        rect(cx + col * scale, y + row * scale, scale, scale, color);
      }
    }
    cx += ADVANCE * scale;
  }
}

/** The site's heading treatment: cyan fill over a magenta offset. */
function drawTitle(str, x, y, scale) {
  const off = Math.max(2, Math.round(scale * 0.45));
  drawText(str, x + off, y + off, scale, MAGENTA);
  drawText(str, x, y, scale, CYAN);
}

/* --- compose --------------------------------------------------------------- */
paintBackground();

const PAD = 84;
let y = 96;

drawText(TEXT.eyebrow, PAD, y, 3, blend(VOID, PAPER, 0.55));
y += GLYPH_H * 3 + 44;

drawTitle(TEXT.title, PAD, y, 10);
y += GLYPH_H * 10 + 34;

drawText(TEXT.subtitle, PAD, y, 7, PAPER);
y += GLYPH_H * 7 + 44;

rect(PAD, y, 176, 7, AMBER);
y += 7 + 40;

drawText(TEXT.theme, PAD, y, 3, blend(VOID, PAPER, 0.82));
y += GLYPH_H * 3 + 52;

/* Date and stats as two bricked chips, matching the site's chrome. */
function chip(str, x, yy, scale) {
  const tw = textWidth(str, scale);
  const padX = 20;
  const padY = 16;
  const w = tw + padX * 2;
  const h = GLYPH_H * scale + padY * 2;
  const border = 3;
  rect(x, yy, w, border, BRICK);
  rect(x, yy + h - border, w, border, BRICK);
  rect(x, yy, border, h, BRICK);
  rect(x + w - border, yy, border, h, BRICK);
  drawText(str, x + padX, yy + padY, scale, PAPER);
  return w;
}

const chipW = chip(TEXT.date, PAD, y, 4);
chip(TEXT.stats, PAD + chipW + 24, y, 4);

/* Co-branding, bottom-right — the same tag the page carries under its
   wordmark. Right-aligned so it reads as a sign-off rather than a fourth
   item in the left-hand stack. */
drawText(
  TEXT.poweredBy,
  W - PAD - textWidth(TEXT.poweredBy, 3),
  H - 60 - GLYPH_H * 3,
  3,
  blend(VOID, PAPER, 0.5),
);

/* --- encode PNG ------------------------------------------------------------ */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// Each scanline is prefixed with filter byte 0 (none).
const raw = Buffer.alloc(H * (1 + W * 3));
for (let yy = 0; yy < H; yy++) {
  const at = yy * (1 + W * 3);
  raw[at] = 0;
  Buffer.from(px.buffer, yy * W * 3, W * 3).copy(raw, at + 1);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type: truecolour RGB
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'opengraph-image.png');
writeFileSync(out, png);
console.log(`wrote ${out} — ${W}x${H}, ${(png.length / 1024).toFixed(1)} kB`);
