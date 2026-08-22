'use client';

/* ERA 05 — Next-Gen / AI. Holo cyan, additive particles, "being generated". */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C, SceneProps, makeRng, seg } from './shared';

/** Rejection-sampled points inside a rough game-controller silhouette. */
function controllerPoints(count: number) {
  const rng = makeRng(20260912);
  const out = new Float32Array(count * 3);
  const inside = (x: number, y: number) => {
    // main body
    if (Math.abs(x) <= 0.66 && Math.abs(y) <= 0.4) return true;
    // grips
    for (const cx of [-0.78, 0.78]) {
      const dx = (x - cx) / 0.62;
      const dy = (y + 0.08) / 0.56;
      if (dx * dx + dy * dy <= 1) return true;
    }
    // shoulder bumpers
    if (Math.abs(Math.abs(x) - 0.62) < 0.26 && y > 0.36 && y < 0.6) return true;
    return false;
  };

  let i = 0;
  let guard = 0;
  while (i < count && guard < count * 200) {
    guard++;
    const x = (rng() - 0.5) * 3.2;
    const y = (rng() - 0.5) * 1.9;
    if (!inside(x, y)) continue;
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = (rng() - 0.5) * 0.16;
    i++;
  }
  return out;
}

export function GameAthon({ tier }: SceneProps) {
  const count = seg(tier, 640, 320);

  const { targets, noise, geometry } = useMemo(() => {
    const targets = controllerPoints(count);
    const rng = makeRng(5150);
    const noise = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Scattered state: a loose shell, so the dissolve reads as "returning to noise".
      const u = rng() * 2 - 1;
      const th = rng() * Math.PI * 2;
      const r = 1.1 + rng() * 0.9;
      const s = Math.sqrt(1 - u * u);
      noise[i * 3] = s * Math.cos(th) * r * 1.25;
      noise[i * 3 + 1] = u * r * 0.85;
      noise[i * 3 + 2] = s * Math.sin(th) * r * 0.7;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(targets), 3));
    return { targets, noise, geometry };
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(C.holo),
        size: tier === 'low' ? 0.075 : 0.06,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [tier],
  );

  const group = useRef<THREE.Group>(null);
  const cool = useMemo(() => new THREE.Color('#7ae7ff'), []);
  const warm = useMemo(() => new THREE.Color('#d9f7ff'), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const CYCLE = 9;
    const p = (t % CYCLE) / CYCLE;

    // assemble 0.00-0.32 | hold 0.32-0.62 | dissolve 0.62-0.88 | drift 0.88-1
    let form: number;
    if (p < 0.32) form = Math.pow(p / 0.32, 0.7);
    else if (p < 0.62) form = 1;
    else if (p < 0.88) form = 1 - Math.pow((p - 0.62) / 0.26, 1.6);
    else form = 0;

    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Per-point stagger so the shape "prints in" rather than snapping.
      const stagger = ((i * 2654435761) % 1000) / 1000;
      const f = THREE.MathUtils.clamp((form - stagger * 0.25) / 0.75, 0, 1);
      const drift = Math.sin(t * 1.4 + i * 0.37) * 0.05 * (1 - f);
      arr[i3] = noise[i3] + (targets[i3] - noise[i3]) * f + drift;
      arr[i3 + 1] = noise[i3 + 1] + (targets[i3 + 1] - noise[i3 + 1]) * f + drift;
      arr[i3 + 2] = noise[i3 + 2] + (targets[i3 + 2] - noise[i3 + 2]) * f;
    }
    pos.needsUpdate = true;

    tmp.copy(cool).lerp(warm, form);
    material.color.copy(tmp);
    material.opacity = 0.55 + form * 0.4;

    if (group.current) group.current.rotation.y = Math.sin(t * 0.35) * 0.4;
  });

  return (
    <group ref={group} scale={1.15}>
      <points geometry={geometry} material={material} />
      {/* faint holo plinth so the field reads as an object, not a starfield */}
      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.35, seg(tier, 48, 24)]} />
        <meshBasicMaterial color={C.holo} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
