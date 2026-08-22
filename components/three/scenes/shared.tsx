'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

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
}

/** Segment count helper — never hides geometry, just simplifies it. */
export const seg = (tier: 'low' | 'high', high: number, low: number) =>
  tier === 'low' ? low : high;

/**
 * Lighting rigs, one per era. Era 1 is deliberately near-unlit (flat, hard,
 * CRT-ish); by era 5 it is all rim light and emissive glow.
 */
export function Rig({ era }: { era: 1 | 2 | 3 | 4 | 5 }) {
  const key = {
    1: C.phosphor,
    2: C.arcade,
    3: C.violet,
    4: C.violet,
    5: C.holo,
  }[era];

  const fill = era >= 4 ? C.holo : key;
  const ambient = era === 1 ? 0.55 : era === 2 ? 0.4 : 0.32;

  return (
    <>
      <ambientLight intensity={ambient} />
      <directionalLight position={[3, 4, 5]} intensity={era === 1 ? 1.1 : 0.9} color="#ffffff" />
      <pointLight position={[-3, 1, 3]} intensity={era === 1 ? 8 : 22} color={key} distance={14} />
      {era >= 3 && <pointLight position={[3, -2, -2]} intensity={18} color={fill} distance={14} />}
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
