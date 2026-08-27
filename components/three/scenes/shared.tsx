'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { EventPalette } from '@/lib/palettes';

export const C = {
  phosphor: '#39ff6a',
  arcade: '#ff2e7e',
  violet: '#8b5cff',
  holo: '#4ce0ff',
  amber: '#ffc93c',
  steel: '#8fa0b8',
  dark: '#0d1016',
} as const;

export interface SceneProps {
  /** 'low' on narrow / low-core devices: fewer segments and particles. */
  tier: 'low' | 'high';
  /** This event's own colours, from lib/palettes.ts. */
  p: EventPalette;
}

/** Segment count helper — never hides geometry, just simplifies it. */
export const seg = (tier: 'low' | 'high', high: number, low: number) =>
  tier === 'low' ? low : high;

/**
 * Lighting rig. Keyed off the EVENT's palette rather than its era, so an
 * object lit warm-gold (Nexus Negotiator) and one lit crimson (Mortal Kombat)
 * read as different media even though they sit in adjacent tracks.
 *
 * Still 2-3 analytic lights — same cost as the old per-era rig, and no
 * environment map (that would mean a CDN fetch, which the zero-asset rule
 * forbids).
 */
export function Rig({ era, palette }: { era: 1 | 2 | 3 | 4 | 5; palette?: EventPalette }) {
  const key = palette?.rim ?? { 1: C.phosphor, 2: C.arcade, 3: C.violet, 4: C.violet, 5: C.holo }[era];
  const fill = palette?.hot ?? (era >= 4 ? C.holo : key);
  const ambient = era === 1 ? 0.55 : era === 2 ? 0.4 : 0.32;

  return (
    <>
      <ambientLight intensity={ambient} />
      <directionalLight position={[3, 4, 5]} intensity={era === 1 ? 1.1 : 0.9} color="#ffffff" />
      <pointLight position={[-3, 1, 3]} intensity={era === 1 ? 8 : 22} color={key} distance={14} />
      <pointLight position={[3, -2, -2]} intensity={16} color={fill} distance={14} />
    </>
  );
}

/** Era 1 look: hard, flat-shaded, no softness anywhere. */
export function useFlatMaterial(color: string, emissive = 0.5) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: emissive,
        flatShading: true,
        roughness: 1,
        metalness: 0,
      }),
    [color, emissive],
  );
}

/** Later eras: smooth, slightly metallic, glowing. */
export function useSmoothMaterial(color: string, opts: { emissive?: number; opacity?: number } = {}) {
  const { emissive = 0.6, opacity = 1 } = opts;
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: emissive,
        roughness: 0.18,
        metalness: 0.6,
        transparent: opacity < 1,
        opacity,
      }),
    [color, emissive, opacity],
  );
}

export function useWireMaterial(color: string, opacity = 0.85) {
  return useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity,
      }),
    [color, opacity],
  );
}

/** Additive glow material for sparks, trails and particle fields. */
export function useGlowMaterial(color: string, size = 0.05) {
  return useMemo(
    () =>
      new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [color, size],
  );
}

/** Deterministic RNG so every reload draws the same scene. */
export function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** Straight-line wire helper used by the truss, UI panel and grids. */
export function lineGeometry(points: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return g;
}

/** Smooth 0..1 ping-pong for repeating gestures. */
export const pingPong = (t: number, period: number) => {
  const x = (t % period) / period;
  return 0.5 - 0.5 * Math.cos(x * Math.PI * 2);
};

/** Eased single-shot gesture that fires once per `period` seconds. */
export const pulse = (t: number, period: number, width = 0.25) => {
  const x = (t % period) / period;
  if (x > width) return 0;
  return Math.sin((x / width) * Math.PI);
};

/* ==========================================================================
   SHARED LOOK / MOTION HELPERS

   Every one of these adds richness through COLOUR and TIMING, not geometry.
   None of them adds a draw call or a vertex — the halftone and dissolve are
   fragment-stage patches on a material that was already being drawn, and the
   motion helpers are pure functions.
   ========================================================================== */

/**
 * Screen-space halftone dither. Patches MeshStandardMaterial's fragment stage
 * so lit areas resolve into a dot grid of `colorB` over `colorA` — the printed
 * comic-ink treatment the Valorant and Mortal Kombat posters use.
 *
 * Deliberately screen-space (gl_FragCoord) rather than UV-space: these are
 * procedural primitives with no meaningful UV layout, and screen-space is what
 * makes it read as printed ink rather than a texture stretched over a box.
 */
export function useHalftoneMaterial(
  colorA: string,
  colorB: string,
  opts: { emissive?: number; scale?: number; metalness?: number } = {},
) {
  const { emissive = 0.5, scale = 5.0, metalness = 0.2 } = opts;
  return useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: colorA,
      emissive: new THREE.Color(colorA),
      emissiveIntensity: emissive,
      roughness: 0.4,
      metalness,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uInk = { value: new THREE.Color(colorB) };
      shader.uniforms.uScale = { value: scale };
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
           uniform vec3 uInk;
           uniform float uScale;`,
        )
        .replace(
          '#include <dithering_fragment>',
          `#include <dithering_fragment>
           // Luminance decides dot radius; the dot grid itself is screen-space.
           float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
           vec2 cell = mod(gl_FragCoord.xy, uScale) - uScale * 0.5;
           float d = length(cell);
           float radius = mix(uScale * 0.5, 0.0, clamp(lum * 1.4, 0.0, 1.0));
           float ink = smoothstep(radius - 0.7, radius + 0.7, d);
           gl_FragColor.rgb = mix(uInk, gl_FragColor.rgb, ink);`,
        );
    };
    // Distinguishes this program from an unpatched standard material.
    mat.customProgramCacheKey = () => `halftone-${colorA}-${colorB}-${scale}`;
    return mat;
  }, [colorA, colorB, emissive, scale, metalness]);
}

/**
 * Edge dissolve: fragments near the silhouette break into a moving pixel
 * lattice and drop out. Drives Tekken's glitch edge.
 *
 * `uAmount` is a live uniform — animate it from useFrame for a pulsing
 * dissolve; the returned object exposes it directly.
 */
export function useDissolveMaterial(color: string, edge: string, emissive = 0.6) {
  return useMemo(() => {
    const uniforms = {
      uAmount: { value: 0.35 },
      uTime: { value: 0 },
      uEdge: { value: new THREE.Color(edge) },
    };

    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(color),
      emissiveIntensity: emissive,
      roughness: 0.3,
      metalness: 0.65,
      transparent: true,
    });

    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n varying vec3 vDissolveN; varying vec3 vDissolveV;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           vDissolveN = normalize(normalMatrix * normal);
           vDissolveV = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
           uniform float uAmount; uniform float uTime; uniform vec3 uEdge;
           varying vec3 vDissolveN; varying vec3 vDissolveV;`,
        )
        .replace(
          '#include <dithering_fragment>',
          `#include <dithering_fragment>
           float fres = 1.0 - abs(dot(normalize(vDissolveN), normalize(vDissolveV)));
           // Chunky lattice, not per-pixel noise — this should read as pixels.
           vec2 blk = floor(gl_FragCoord.xy / 3.0);
           float n = fract(sin(dot(blk, vec2(12.9898, 78.233)) + floor(uTime * 12.0)) * 43758.5453);
           float cut = fres * uAmount;
           if (n < cut * 0.85) discard;
           gl_FragColor.rgb = mix(gl_FragColor.rgb, uEdge, smoothstep(0.4, 1.0, fres) * 0.8);`,
        );
    };
    mat.customProgramCacheKey = () => `dissolve-${color}-${edge}`;
    (mat as THREE.MeshStandardMaterial & { uDissolve: typeof uniforms }).uDissolve = uniforms;
    return mat as THREE.MeshStandardMaterial & { uDissolve: typeof uniforms };
  }, [color, edge, emissive]);
}

/** Two-colour gradient point cloud, gradient running along local Y. */
export const GRADIENT_POINTS_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uGlitch;
  varying float vMix;
  varying float vAlpha;

  float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

  void main() {
    vec3 pos = position;
    float breathe =
      sin(pos.x * 3.1 + uTime * 1.1) * 0.34 +
      sin(pos.y * 4.2 + uTime * 0.9) * 0.34 +
      sin(pos.z * 3.6 + uTime * 1.4) * 0.34;
    pos += normalize(position + 0.0001) * breathe * 0.11;

    // Glitch: whole horizontal bands jump sideways for a few frames.
    float band = floor(pos.y * 7.0);
    float jump = (h21(vec2(band, floor(uTime * 9.0))) - 0.5) * uGlitch;
    pos.x += jump;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * (240.0 / max(0.001, -mv.z));
    gl_Position = projectionMatrix * mv;

    vMix = clamp(pos.y * 0.5 + 0.5, 0.0, 1.0);
    vAlpha = 0.35 + 0.65 * smoothstep(-1.0, 1.0, breathe);
  }
`;

export const GRADIENT_POINTS_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vMix;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), vAlpha * (1.0 - d * 2.0));
  }
`;

/**
 * Sharp attack, slow decay — the shape of an impact. Returns 1 at the moment
 * of the hit and falls away; `pulse` above is symmetrical and reads as a
 * gesture instead.
 */
export const strike = (t: number, period: number, decay = 0.35) => {
  const x = (t % period) / period;
  if (x > decay) return 0;
  return Math.pow(1 - x / decay, 2.2);
};

/** Fires 1 for a brief window every `period` seconds. Drives glitch bursts. */
export const flicker = (t: number, period: number, width = 0.06) =>
  (t % period) / period < width ? 1 : 0;

/** Staggered round-robin: which of `n` items is "up" right now. */
export const rotateIndex = (t: number, n: number, every: number) =>
  Math.floor(t / every) % n;
