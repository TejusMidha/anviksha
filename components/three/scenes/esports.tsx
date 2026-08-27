'use client';

/* ERA 02 — E-SPORTS.
   These four are the actual tournament titles, so the objects take each
   poster's COLOUR and MOOD only: an abstract shield, a ball, crossed blades,
   a gauntlet. No franchise logos, marks, character likenesses or silhouettes
   are reproduced anywhere in this file — see the note in the build report. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  SceneProps,
  makeRng,
  pulse,
  seg,
  strike,
  useDissolveMaterial,
  useGlowMaterial,
  useHalftoneMaterial,
  useSmoothMaterial,
} from './shared';

/* -------------------------------------------------------------------------- */
/* Valorant — angular shield, halftone-dithered plate                          */
/* The moment: the crosshair charges and snaps to a bright "locked" pulse on   */
/* a 2.6s beat, and the shield counter-tilts into the pulse.                   */
/* -------------------------------------------------------------------------- */
export function Valorant({ tier, p }: SceneProps) {
  // Halftone is a fragment-stage patch on a material already being drawn:
  // the printed-ink look costs no extra geometry and no extra pass.
  const plate = useHalftoneMaterial(p.base, p.accent, { emissive: 0.4, scale: 5 });
  const etch = useSmoothMaterial(p.hot, { emissive: 1.6 });
  const group = useRef<THREE.Group>(null);
  const reticle = useRef<THREE.Group>(null);
  const radial = seg(tier, 6, 6);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const lock = strike(t, 2.6, 0.28);

    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.6) * 0.42;
      group.current.rotation.x = Math.sin(t * 0.45) * 0.14;
      group.current.position.y = Math.sin(t * 1.1) * 0.06;
      group.current.scale.setScalar(1.15 + lock * 0.04);
    }
    if (reticle.current) {
      // Charge in, snap out — the reticle tightens then flares.
      reticle.current.scale.setScalar(1 + lock * 0.28);
      reticle.current.rotation.z = t * 0.3;
    }
    etch.emissiveIntensity = 1.1 + lock * 2.4;
  });

  return (
    <group ref={group} scale={1.15}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={plate}>
        <cylinderGeometry args={[1.15, 1.15, 0.14, radial]} />
      </mesh>
      <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]} material={etch}>
        <cylinderGeometry args={[1.0, 1.0, 0.02, radial, 1, true]} />
      </mesh>

      <group ref={reticle} position={[0, 0, 0.12]}>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation={[0, 0, r]} material={etch}>
            <boxGeometry args={[1.05, 0.05, 0.03]} />
          </mesh>
        ))}
        <mesh material={etch}>
          <torusGeometry args={[0.34, 0.035, 4, seg(tier, 28, 14)]} />
        </mesh>
        <mesh material={etch}>
          <sphereGeometry args={[0.06, 6, 5]} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* FIFA — faceted ball, dark navy with warm gold trim                          */
/* The moment: an occasional "kick" impulse sends the tumble rate spiking and  */
/* lifts the ball off its shadow, which tightens as it rises.                  */
/* -------------------------------------------------------------------------- */
export function FIFA({ tier, p }: SceneProps) {
  const ball = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const detail = seg(tier, 1, 0);
  const spin = useRef(0);

  const shadowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: p.accent, transparent: true, opacity: 0.35 }),
    [p.accent],
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const kick = strike(t, 3.2, 0.34);

    // Base tumble plus a spike on the kick, integrated so it never snaps back.
    spin.current += delta * (0.42 + kick * 5.5);
    if (ball.current) {
      ball.current.rotation.y = spin.current;
      ball.current.rotation.x = spin.current * 0.4;
      ball.current.position.y = Math.sin(kick * Math.PI) * 0.55;
    }
    if (shadow.current) {
      const lift = Math.sin(kick * Math.PI);
      shadow.current.scale.setScalar(1 - lift * 0.35);
      shadowMat.opacity = 0.35 - lift * 0.18;
    }
  });

  return (
    <group>
      {/* Navy body. Emissive is kept very low and tinted with the base rather
          than the gold accent — at 0.3 with a gold emissive the rig's warm key
          light swamped the navy entirely and the ball read as solid gold. The
          gold belongs on the trim ring below, not on the panels. */}
      <mesh ref={ball} scale={1.3}>
        <icosahedronGeometry args={[1, detail]} />
        <meshStandardMaterial
          color={p.base}
          emissive={p.base}
          emissiveIntensity={0.35}
          flatShading
          roughness={0.5}
          metalness={0.25}
        />
      </mesh>
      {/* pitch-green panelling, kept from the original read */}
      <mesh scale={1.34} rotation={[0.4, 0.2, 0]}>
        <icosahedronGeometry args={[1, detail]} />
        <meshBasicMaterial color="#3fbf6a" wireframe transparent opacity={0.5} />
      </mesh>
      {/* gold trim ring */}
      <mesh scale={1.36} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.022, 4, seg(tier, 40, 20)]} />
        <meshStandardMaterial color={p.hot} emissive={p.hot} emissiveIntensity={1.2} roughness={0.3} metalness={0.8} />
      </mesh>

      <mesh ref={shadow} position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shadowMat}>
        <ringGeometry args={[0.5, 0.62, seg(tier, 32, 16)]} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Mortal Kombat — crossed blades, crimson halftone etch                       */
/* The moment: the spark burst is genuinely multi-colour — each particle keeps */
/* its own hue from a crimson/magenta/cream ramp, so the clash reads as heat   */
/* rather than one tinted cloud.                                               */
/* -------------------------------------------------------------------------- */
export function MortalKombat({ tier, p }: SceneProps) {
  const blade = useHalftoneMaterial(p.hot, p.base, { emissive: 0.55, scale: 4.5 });
  const hilt = useSmoothMaterial(p.base, { emissive: 0.9 });
  const count = seg(tier, 70, 34);

  const { dirs, colors } = useMemo(() => {
    const rng = makeRng(777);
    const dirs = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const ramp = [new THREE.Color(p.base), new THREE.Color(p.accent), new THREE.Color(p.hot)];
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const r = 0.4 + rng() * 0.9;
      dirs[i * 3] = Math.cos(a) * r;
      dirs[i * 3 + 1] = Math.sin(a) * r;
      dirs[i * 3 + 2] = (rng() - 0.5) * 0.5;
      // Per-particle colour, baked once — vertexColors costs nothing per frame.
      const c = ramp[Math.floor(rng() * ramp.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { dirs, colors };
  }, [count, p.base, p.accent, p.hot]);

  const sparkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count, colors]);

  const sparkMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: tier === 'low' ? 0.075 : 0.06,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [tier],
  );

  const sparks = useRef<THREE.Points>(null);
  const blades = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const CYCLE = 2.6;
    const burst = (t % CYCLE) / CYCLE;
    const pos = sparkGeo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const ease = Math.pow(burst, 0.55);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = dirs[i] * ease;
      arr[i + 1] = dirs[i + 1] * ease - burst * burst * 0.5;
      arr[i + 2] = dirs[i + 2] * ease;
    }
    pos.needsUpdate = true;
    sparkMat.opacity = Math.max(0, 1 - burst) * 0.95;
    if (sparks.current) sparks.current.visible = burst < 0.98;

    // Blades recoil on the clash, then settle.
    const clash = strike(t, CYCLE, 0.22);
    if (blades.current) blades.current.scale.setScalar(1 + clash * 0.05);
  });

  return (
    <group ref={blades}>
      {[0.65, -0.65].map((rot, i) => (
        <group key={i} rotation={[0, 0, rot]}>
          <mesh position={[0, 0.5, i * 0.06 - 0.03]} material={blade}>
            <boxGeometry args={[0.13, 1.7, 0.05]} />
          </mesh>
          <mesh position={[0, 1.42, i * 0.06 - 0.03]} material={blade}>
            <coneGeometry args={[0.09, 0.34, 4]} />
          </mesh>
          <mesh position={[0, -0.45, i * 0.06 - 0.03]} material={hilt}>
            <boxGeometry args={[0.36, 0.1, 0.1]} />
          </mesh>
          <mesh position={[0, -0.75, i * 0.06 - 0.03]} material={hilt}>
            <cylinderGeometry args={[0.07, 0.07, 0.55, 6]} />
          </mesh>
        </group>
      ))}
      <points ref={sparks} geometry={sparkGeo} material={sparkMat} position={[0, 0.45, 0.1]} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Tekken — gauntlet, red/black with a glitch-pixel dissolve at the silhouette */
/* The moment: the punch throws THREE successive shockwave rings at different  */
/* opacities and radii, and the dissolve spikes on impact so the edge of the   */
/* gauntlet momentarily breaks into pixels.                                    */
/* -------------------------------------------------------------------------- */
export function Tekken({ tier, p }: SceneProps) {
  const metal = useDissolveMaterial(p.base, p.accent, 0.45);
  const knuckle = useSmoothMaterial(p.hot, { emissive: 1.0 });
  const fist = useRef<THREE.Group>(null);

  const RINGS = 3;
  const rings = useRef<THREE.Group>(null);
  const ringMats = useMemo(
    () =>
      Array.from(
        { length: RINGS },
        (_, i) =>
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(i === 0 ? p.accent : p.hot),
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [p.accent, p.hot],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const CYCLE = 2.4;
    const punch = pulse(t, CYCLE, 0.3);
    const hit = strike(t, CYCLE, 0.3);

    if (fist.current) {
      fist.current.position.z = -0.3 + punch * 0.85;
      fist.current.rotation.x = -0.15 + punch * 0.2;
    }

    // Edge pixels break up on impact, then re-form.
    metal.uDissolve.uAmount.value = 0.22 + hit * 0.55;
    metal.uDissolve.uTime.value = t;

    // Three rings, each trailing the last by a fixed phase offset.
    if (rings.current) {
      rings.current.children.forEach((ring, i) => {
        const phase = ((t % CYCLE) / CYCLE) - i * 0.13;
        if (phase < 0) {
          ring.visible = false;
          return;
        }
        ring.visible = true;
        ring.scale.setScalar(0.3 + phase * 2.2);
        ringMats[i].opacity = Math.max(0, (0.7 - phase * 0.8) * (1 - i * 0.25));
      });
    }
  });

  return (
    <group>
      <group ref={fist} rotation={[-0.15, 0.5, 0]}>
        <mesh position={[0, 0, -0.85]} material={metal}>
          <boxGeometry args={[0.5, 0.5, 1.0]} />
        </mesh>
        <mesh position={[0, 0.04, -0.1]} material={metal}>
          <boxGeometry args={[0.66, 0.62, 0.62]} />
        </mesh>
        {[-0.19, 0, 0.19].map((x) => (
          <mesh key={x} position={[x, 0.2, 0.16]} material={knuckle}>
            <sphereGeometry args={[0.11, seg(tier, 10, 6), seg(tier, 8, 5)]} />
          </mesh>
        ))}
        <mesh position={[0, 0.3, -0.5]} material={knuckle}>
          <boxGeometry args={[0.56, 0.08, 0.7]} />
        </mesh>
      </group>

      <group ref={rings} position={[0, 0.05, 0.55]}>
        {Array.from({ length: RINGS }, (_, i) => (
          <mesh key={i} material={ringMats[i]}>
            <ringGeometry args={[0.55, 0.72 - i * 0.06, seg(tier, 40, 20)]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
