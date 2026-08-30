/**
 * Downscales the three brand PNGs from Assets/Logos into public/logos at the
 * sizes the site actually renders them.
 *
 *   node scripts/optimize-logos.mjs        (or: npm run logos)
 *
 * WHY A SCRIPT AND NOT `sharp`:
 * this project has no image dependency (see scripts/make-og.mjs — the OG card
 * is drawn pixel by pixel and encoded with Node's own zlib). The delivered
 * Unstop lockup is 4000x1592; shipping that to a header slot 130px wide is a
 * 25 MB decode in the browser for no visible gain. So the same zlib-only
 * approach is used here in reverse: decode the PNG, box-filter it down,
 * re-encode.
 *
 * Sources stay untouched in Assets/Logos — that folder is the delivery, this
 * script is the build step, and public/logos holds only the built output. The
 * file names are also normalised on the way through: "Asset 1 (1).png" has a
 * space and brackets in it, which have to be percent-encoded in every URL that
 * references them.
 *
 * All three sources are 8-bit RGBA, non-interlaced, which is the only shape
 * this decoder handles — it asserts rather than guessing.
 */

import { deflateSync, inflateSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Target widths are ~2x the largest CSS size each logo is rendered at, so they
   stay crisp on a retina screen and no larger. */
const JOBS = [
  { src: 'Asset 1 (1).png', out: 'nmims.png', width: 578, note: 'NMIMS lockup (native size)' },
  { src: 'anviksha logo.png', out: 'anviksha.png', width: 512, note: 'Anviksha A mark' },
  { src: 'Unstop-Logo-Blue-Extra-Large.png', out: 'unstop.png', width: 600, note: 'Unstop lockup' },
];

/* ---------------------------------------------------------------- decode --- */

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');

  let pos = 8;
  const idat = [];
  let width = 0;
  let height = 0;

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const [depth, color, , , interlace] = [data[8], data[9], data[10], data[11], data[12]];
      if (depth !== 8 || color !== 6 || interlace !== 0) {
        throw new Error(`unsupported PNG: depth=${depth} colorType=${color} interlace=${interlace}`);
      }
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = width * bpp;
  const px = Buffer.alloc(height * stride);

  // Undo the per-scanline filter. Each row is prefixed with its filter type.
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = px.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) v += paeth(a, b, c);
      cur[x] = v & 0xff;
    }
  }

  return { width, height, px };
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/* ---------------------------------------------------------------- resize --- */

/**
 * Box filter, averaging in PREMULTIPLIED alpha. Averaging straight RGB would
 * pull the colour of fully transparent pixels into the edge of the mark — the
 * Anviksha PNG has a transparent surround, so that shows up as a dark halo.
 */
function resize(src, w, h) {
  const dst = Buffer.alloc(w * h * 4);
  const xr = src.width / w;
  const yr = src.height / h;

  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y * yr);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * yr));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * xr);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * xr));

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;

      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * src.width + sx) * 4;
          const al = src.px[i + 3] / 255;
          r += src.px[i] * al;
          g += src.px[i + 1] * al;
          b += src.px[i + 2] * al;
          a += src.px[i + 3];
          n++;
        }
      }

      const o = (y * w + x) * 4;
      const alpha = a / n;
      const un = alpha > 0 ? 255 / alpha : 0;
      dst[o] = Math.min(255, Math.round((r / n) * un));
      dst[o + 1] = Math.min(255, Math.round((g / n) * un));
      dst[o + 2] = Math.min(255, Math.round((b / n) * un));
      dst[o + 3] = Math.round(alpha);
    }
  }

  return { width: w, height: h, px: dst };
}

/* ---------------------------------------------------------------- encode --- */

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

function encodePng({ width, height, px }) {
  const stride = width * 4;
  // Paeth on every row: these are flat-colour marks with long runs, and Paeth
  // turns those runs into zeroes for deflate.
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 4;
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? px[y * stride + x - 4] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = y > 0 && x >= 4 ? px[(y - 1) * stride + x - 4] : 0;
      raw[y * (stride + 1) + 1 + x] = (px[y * stride + x] - paeth(a, b, c)) & 0xff;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ run --- */

mkdirSync(join(root, 'public/logos'), { recursive: true });

for (const job of JOBS) {
  const srcBuf = readFileSync(join(root, 'Assets/Logos', job.src));
  const src = decodePng(srcBuf);
  const height = Math.max(1, Math.round((src.height / src.width) * job.width));
  const out = job.width === src.width && height === src.height ? src : resize(src, job.width, height);
  const png = encodePng(out);
  writeFileSync(join(root, 'public/logos', job.out), png);

  console.log(
    `${job.out.padEnd(14)} ${String(src.width).padStart(4)}x${String(src.height).padEnd(4)}` +
      ` -> ${out.width}x${out.height}  ${(srcBuf.length / 1024).toFixed(0)}KB -> ` +
      `${(png.length / 1024).toFixed(0)}KB   ${job.note}`,
  );
}
