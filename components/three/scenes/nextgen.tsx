'use client';

/* ERA 05 — NEXT-GEN / AI.
   The assemble/dissolve field stays, but the hue now travels cyan -> violet ->
   cyan across the loop instead of sitting flat, and full assembly throws a
   red/blue accent flash echoing the poster's dual neon key lighting. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneProps, makeRng, seg } from './shared';

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

export function GameAthon({ tier, p }: SceneProps) {
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
        color: new THREE.Color(p.base),
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
  /* Three-stop ramp rather than two: the loop travels cyan -> violet -> cyan,
     and `flash` is the accent hit at full assembly. */
  const cool = useMemo(() => new THREE.Color(p.base), [p.base]);
  const mid = useMemo(() => new THREE.Color(p.accent), [p.accent]);
  const flash = useMemo(() => new THREE.Color(p.hot), [p.hot]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const halo = useRef<THREE.Mesh>(null);
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.hot),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [p.hot],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const CYCLE = 9;
    const p2 = (t % CYCLE) / CYCLE;

    // assemble 0.00-0.32 | hold 0.32-0.62 | dissolve 0.62-0.88 | drift 0.88-1
    let form: number;
    if (p2 < 0.32) form = Math.pow(p2 / 0.32, 0.7);
    else if (p2 < 0.62) form = 1;
    else if (p2 < 0.88) form = 1 - Math.pow((p2 - 0.62) / 0.26, 1.6);
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

    /* Hue cycle across the whole loop: cyan at the edges, violet through the
       middle. Independent of `form`, so colour keeps moving even while the
       shape is holding. */
    const cycle = 0.5 - 0.5 * Math.cos(p2 * Math.PI * 2);
    tmp.copy(cool).lerp(mid, cycle);

    /* Accent flash: a short red/blue kick exactly at full assembly, which is
       where the poster's dual neon lighting reads strongest. */
    const atFull = p2 > 0.30 && p2 < 0.40 ? 1 - Math.abs(p2 - 0.35) / 0.05 : 0;
    tmp.lerp(flash, atFull * 0.55);

    material.color.copy(tmp);
    material.opacity = 0.55 + form * 0.4;

    haloMat.opacity = atFull * 0.28;
    if (halo.current) halo.current.scale.setScalar(1.1 + atFull * 0.5);

    if (group.current) group.current.rotation.y = Math.sin(t * 0.35) * 0.4;
  });

  return (
    <group ref={group} scale={1.15}>
      <points geometry={geometry} material={material} />
      {/* faint holo plinth so the field reads as an object, not a starfield */}
      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.35, seg(tier, 48, 24)]} />
        <meshBasicMaterial color={p.base} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      {/* accent halo — only visible during the full-assembly flash */}
      <mesh ref={halo} position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]} material={haloMat}>
        <ringGeometry args={[1.35, 1.7, seg(tier, 40, 20)]} />
      </mesh>
    </group>
  );
}
