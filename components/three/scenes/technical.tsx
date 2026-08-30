'use client';

/* ERA 01 — TECHNICAL.
   Brochure divider: deep violet base, neon circuit-trace pattern.
   Each object carries its own poster palette (lib/palettes.ts) and one
   "performance moment" per 2-4s loop. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  C,
  SceneProps,
  flicker,
  makeRng,
  pulse,
  seg,
  strike,
  useGlowMaterial,
  useSmoothMaterial,
  useWireMaterial,
} from './shared';

/* -------------------------------------------------------------------------- */
/* Capture the Flag                                                            */
/* Deep violet rack + hazard-striped base. The flag ripples continuously and   */
/* every 4s runs a scanline glitch: the cloth tears into horizontal bands and  */
/* the material flips to digital-noise green, then snaps back.                 */
/* -------------------------------------------------------------------------- */
export function CaptureTheFlag({ tier, p }: SceneProps) {
  const wire = useWireMaterial(p.base, 0.75);
  const rack = useSmoothMaterial(p.base, { emissive: 0.35 });
  const hazard = useSmoothMaterial(C.amber, { emissive: 0.7 });
  const geoRef = useRef<THREE.PlaneGeometry>(null);
  const base = useRef<Float32Array | null>(null);
  const group = useRef<THREE.Group>(null);

  const [w, h] = [seg(tier, 14, 8), seg(tier, 10, 6)];

  const flagMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.base),
        emissive: new THREE.Color(p.base),
        emissiveIntensity: 0.5,
        flatShading: true,
        side: THREE.DoubleSide,
        roughness: 1,
      }),
    [p.base],
  );
  const cSolid = useMemo(() => new THREE.Color(p.base), [p.base]);
  const cCode = useMemo(() => new THREE.Color(p.accent), [p.accent]);

  useFrame(({ clock }) => {
    const g = geoRef.current;
    if (!g) return;
    const pos = g.attributes.position as THREE.BufferAttribute;
    if (!base.current) base.current = Float32Array.from(pos.array as Float32Array);

    const t = clock.elapsedTime;
    const gw = (t % 4) / 4;
    const glitch = gw < 0.13 ? 1 - gw / 0.13 : 0;

    for (let i = 0; i < pos.count; i++) {
      const x = base.current[i * 3];
      const y = base.current[i * 3 + 1];
      const grip = (x + 0.55) / 1.1;
      let z = Math.sin(x * 6 - t * 3.2 + y * 1.5) * 0.11 * grip * grip;
      if (glitch > 0) {
        const row = Math.floor((y + 0.31) * 12);
        const tear = Math.sin(row * 91.7 + Math.floor(t * 20)) * 0.5;
        z += tear * 0.34 * glitch * grip;
      }
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();

    flagMat.color.copy(cSolid).lerp(cCode, glitch);
    flagMat.emissive.copy(cSolid).lerp(cCode, glitch);
    flagMat.emissiveIntensity = 0.5 + glitch * 1.4;

    if (group.current) group.current.rotation.y = Math.sin(t * 0.3) * 0.3;
  });

  return (
    <group ref={group}>
      <mesh position={[0, -0.95, 0]} material={wire}>
        <boxGeometry args={[1.5, 1.1, 1.1, 2, 2, 2]} />
      </mesh>
      {[-0.3, -0.75, -1.2].map((y) => (
        <mesh key={y} position={[0, y, 0.56]} material={rack}>
          <boxGeometry args={[1.15, 0.06, 0.02]} />
        </mesh>
      ))}
      {[-0.5, -0.17, 0.17, 0.5].map((x) => (
        <mesh key={x} position={[x, -1.56, 0]} rotation={[0, 0, 0.5]} material={hazard}>
          <boxGeometry args={[0.16, 0.12, 1.12]} />
        </mesh>
      ))}
      <mesh position={[0, -1.56, 0]} material={rack}>
        <boxGeometry args={[1.62, 0.13, 1.14]} />
      </mesh>
      <mesh position={[-0.55, 0.55, 0]} material={rack}>
        <cylinderGeometry args={[0.035, 0.035, 2.1, 6]} />
      </mesh>
      <mesh position={[0, 1.15, 0]} material={flagMat}>
        <planeGeometry ref={geoRef} args={[1.1, 0.62, w, h]} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Escape the Server                                                           */
/* Pink/lavender rack in a purple corridor, warm amber wash. The moment:       */
/* indicator lights run a red -> amber -> green boot sequence, and the vault   */
/* handle throws a quarter-turn as the sequence completes.                     */
/* -------------------------------------------------------------------------- */
export function EscapeTheServer({ tier, p }: SceneProps) {
  const wire = useWireMaterial(p.accent, 0.5);
  const shell = useSmoothMaterial(p.base, { emissive: 0.4 });
  const rings = useRef<THREE.Group>(null);
  const handle = useRef<THREE.Group>(null);
  const leds = useRef<THREE.Group>(null);
  const radial = seg(tier, 32, 18);

  const ledMats = useMemo(
    () =>
      ['#ff3b3b', '#ffb347', '#39ff6a'].map(
        (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), transparent: true, opacity: 0.3 }),
      ),
    [],
  );

  const LED_ROWS = 6;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (rings.current) {
      rings.current.children.forEach((child, i) => {
        child.rotation.z = t * (0.5 - i * 0.32) * (i % 2 === 0 ? 1 : -1);
      });
    }
    const seqP = (t % 4) / 4;
    const lit = Math.floor(seqP * (LED_ROWS + 2));
    const stage = Math.min(2, Math.floor(seqP * 3));
    ledMats.forEach((m, i) => {
      m.opacity = i === stage ? 0.95 : 0.18;
    });
    if (leds.current) {
      leds.current.children.forEach((row, i) => row.scale.setScalar(i < lit ? 1 : 0.55));
    }
    if (handle.current) handle.current.rotation.z = pulse(t, 4, 0.28) * Math.PI * 0.5;
  });

  return (
    <group>
      <mesh material={wire} position={[0, 0, -0.25]}>
        <cylinderGeometry args={[1.35, 1.35, 0.3, radial, 1, true]} />
      </mesh>
      <mesh material={shell} position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.12, radial]} />
      </mesh>

      <group ref={rings}>
        {[1.0, 0.75, 0.5].map((r, i) => (
          <mesh key={r} position={[0, 0, 0.02 + i * 0.03]} material={shell}>
            <torusGeometry args={[r, 0.045, 6, seg(tier, 36, 20)]} />
          </mesh>
        ))}
      </group>

      <group ref={leds} position={[1.05, 0.35, 0.1]}>
        {Array.from({ length: LED_ROWS }, (_, i) => (
          <mesh key={i} position={[0, -i * 0.17, 0]} material={ledMats[i % 3]}>
            <boxGeometry args={[0.14, 0.07, 0.05]} />
          </mesh>
        ))}
      </group>

      <group ref={handle}>
        {[0, Math.PI / 2].map((rot) => (
          <mesh key={rot} rotation={[0, 0, rot]} position={[0, 0, 0.16]} material={shell}>
            <boxGeometry args={[0.9, 0.07, 0.07]} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.18]} material={shell}>
          <sphereGeometry args={[0.11, 8, 6]} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Bridge Wars                                                                 */
/* The two halves of the truss are genuinely different colours — hot pink vs   */
/* cyan. The moment: a stress-creak rhythm (load, hold, release) interrupted   */
/* every 5s by a wrecking-ball impact that jolts the whole span.               */
/* -------------------------------------------------------------------------- */
export function BridgeWars({ tier, p }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Group>(null);
  const bays = seg(tier, 8, 5);

  /* Two geometries, one per half, so each takes its own colour. Same total
     vertex count as the old single-colour truss — this costs one extra draw
     call, not extra geometry. */
  const { left, right } = useMemo(() => {
    const span = 3.4;
    const width = 0.75;
    const step = span / bays;
    const x0 = -span / 2;
    const arc = (i: number) => 0.62 * Math.sin((i / bays) * Math.PI) + 0.18;
    const half = Math.ceil(bays / 2);

    const build = (from: number, to: number) => {
      const pts: number[] = [];
      const push = (a: number[], b: number[]) => pts.push(...a, ...b);
      for (const z of [-width / 2, width / 2]) {
        for (let i = from; i < to; i++) {
          const xa = x0 + i * step;
          const xb = x0 + (i + 1) * step;
          push([xa, 0, z], [xb, 0, z]);
          push([xa, arc(i), z], [xb, arc(i + 1), z]);
          push([xa, 0, z], [xa, arc(i), z]);
          push([xa, 0, z], [xb, arc(i + 1), z]);
        }
      }
      for (let i = from; i <= to; i++) {
        const x = x0 + i * step;
        push([x, 0, -width / 2], [x, 0, width / 2]);
        push([x, arc(i), -width / 2], [x, arc(i), width / 2]);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      return g;
    };

    return { left: build(0, half), right: build(half, bays) };
  }, [bays]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!group.current) return;

    // Creak: load up, hold under tension, release. Deliberately not a sine.
    const c = (t % 2.8) / 2.8;
    const creak = c < 0.45 ? Math.pow(c / 0.45, 2) : c < 0.62 ? 1 : 1 - (c - 0.62) / 0.38;

    // Impact: sharp jolt every 5s, decaying oscillation.
    const hit = strike(t, 5, 0.3);
    const jolt = hit * Math.sin(t * 42) * 0.05;

    group.current.rotation.z = -creak * 0.03 + jolt;
    group.current.rotation.y = -0.5 + Math.sin(t * 0.25) * 0.22;
    group.current.position.y = -0.35 - creak * 0.025 + jolt * 0.4;

    if (ball.current) {
      const swing = Math.sin((t / 5) * Math.PI * 2 - Math.PI / 2);
      ball.current.position.x = 1.55 + swing * 0.55;
      ball.current.rotation.z = -swing * 0.35;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={left}>
        <lineBasicMaterial color={p.base} transparent opacity={0.95} />
      </lineSegments>
      <lineSegments geometry={right}>
        <lineBasicMaterial color={p.accent} transparent opacity={0.95} />
      </lineSegments>

      <mesh position={[-0.85, -0.02, 0]}>
        <boxGeometry args={[1.7, 0.03, 0.75]} />
        <meshStandardMaterial color={p.base} emissive={p.base} emissiveIntensity={0.35} flatShading roughness={1} />
      </mesh>
      <mesh position={[0.85, -0.02, 0]}>
        <boxGeometry args={[1.7, 0.03, 0.75]} />
        <meshStandardMaterial color={p.accent} emissive={p.accent} emissiveIntensity={0.35} flatShading roughness={1} />
      </mesh>

      <group ref={ball} position={[1.55, 0.55, 0]}>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 1.5, 4]} />
          <meshBasicMaterial color="#6b6b6b" />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.3, seg(tier, 1, 0)]} />
          <meshStandardMaterial color="#23262e" emissive={C.amber} emissiveIntensity={0.18} flatShading roughness={0.6} metalness={0.5} />
        </mesh>
        {[-0.14, 0.06].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[0, 0, 0.5]}>
            <torusGeometry args={[0.28, 0.035, 4, seg(tier, 12, 7)]} />
            <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={0.8} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Algorithm Auction                                                           */
/* Navy base, cyan/magenta neon grid floor, thin cyan digital rain. The moment:*/
/* the gavel strike scatters the digit blocks outward; they ease back into     */
/* formation before the next strike.                                           */
/* -------------------------------------------------------------------------- */
export function AlgorithmAuction({ tier, p }: SceneProps) {
  const body = useSmoothMaterial(p.base, { emissive: 0.4 });
  const neon = useSmoothMaterial(p.hot, { emissive: 1.4 });
  const digitMat = useSmoothMaterial(p.accent, { emissive: 1.2 });
  const gavel = useRef<THREE.Group>(null);
  const digits = useRef<THREE.Group>(null);
  const radial = seg(tier, 10, 6);

  /* Digital rain is one LineSegments — a single draw call for the whole
     overlay, rather than one mesh per streak. */
  const rainCount = seg(tier, 26, 12);
  const rainGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rainCount * 6), 3));
    return g;
  }, [rainCount]);

  const rainSeeds = useMemo(() => {
    const rng = makeRng(31337);
    return Array.from({ length: rainCount }, () => ({
      x: (rng() - 0.5) * 3.4,
      z: (rng() - 0.5) * 1.6 - 0.3,
      speed: 0.7 + rng() * 1.1,
      len: 0.22 + rng() * 0.4,
      off: rng() * 3,
    }));
  }, [rainCount]);

  const scatterDirs = useMemo(() => {
    const rng = makeRng(8080);
    return [0, 1, 2, 3].map(() => ({
      x: (rng() - 0.5) * 1.4,
      y: 0.3 + rng() * 0.5,
      z: (rng() - 0.5) * 0.8,
      spin: (rng() - 0.5) * 8,
    }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const CYCLE = 3.4;
    const HIT = 0.22;
    const phase = (t % CYCLE) / CYCLE;

    const swing = pulse(t, CYCLE, HIT);
    if (gavel.current) {
      gavel.current.rotation.z = -0.5 + swing * 0.55;
      gavel.current.position.y = 0.75 - swing * 0.28;
    }

    const since = phase < HIT ? 0 : (phase - HIT) / (1 - HIT);
    const scatter = since === 0 ? 0 : Math.pow(1 - since, 2.4);

    if (digits.current) {
      digits.current.children.forEach((d, i) => {
        const s = scatterDirs[i];
        d.position.x = -0.78 + i * 0.52 + s.x * scatter;
        d.position.y = -0.55 + Math.sin(t * 1.4 + i * 1.2) * 0.09 + s.y * scatter;
        d.position.z = 0.1 + s.z * scatter;
        d.rotation.y = t * 0.6 + i + s.spin * scatter;
        d.scale.setScalar(1 - scatter * 0.25);
      });
    }

    const pos = rainGeo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    rainSeeds.forEach((r, i) => {
      const y = 1.5 - ((t * r.speed + r.off) % 3);
      arr[i * 6] = r.x;
      arr[i * 6 + 1] = y;
      arr[i * 6 + 2] = r.z;
      arr[i * 6 + 3] = r.x;
      arr[i * 6 + 4] = y - r.len;
      arr[i * 6 + 5] = r.z;
    });
    pos.needsUpdate = true;
  });

  return (
    <group>
      <group ref={gavel} position={[0.1, 0.75, 0]} rotation={[0, 0, -0.5]}>
        <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={body}>
          <cylinderGeometry args={[0.055, 0.055, 1.0, radial]} />
        </mesh>
        <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={neon}>
          <cylinderGeometry args={[0.24, 0.24, 0.62, radial]} />
        </mesh>
      </group>

      <mesh position={[0.1, -1.15, 0]} material={body}>
        <boxGeometry args={[1.0, 0.12, 0.5]} />
      </mesh>

      <group ref={digits}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[-0.78 + i * 0.52, -0.55, 0.1]}>
            {i % 2 === 0 ? (
              <mesh material={digitMat}>
                <boxGeometry args={[0.11, 0.44, 0.11]} />
              </mesh>
            ) : (
              <mesh material={digitMat}>
                <torusGeometry args={[0.16, 0.055, 5, seg(tier, 14, 9)]} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      <gridHelper args={[3.6, seg(tier, 12, 7), p.hot, p.accent]} position={[0, -1.35, 0]} />

      <lineSegments geometry={rainGeo}>
        <lineBasicMaterial
          color={p.accent}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Tech Minute to Win It                                                       */
/* Magenta/purple synthwave frame with a cyan CRT-glow hourglass. The moment:  */
/* the gears run in bursts — stall, then race — against the falling sand,      */
/* rather than turning at a constant rate.                                     */
/* -------------------------------------------------------------------------- */
export function TechMinute({ tier, p }: SceneProps) {
  const wire = useWireMaterial(p.accent, 0.7);
  const frame = useSmoothMaterial(p.base, { emissive: 0.5 });
  const crt = useSmoothMaterial(p.hot, { emissive: 1.3 });
  const sandMat = useGlowMaterial(p.hot, tier === 'low' ? 0.055 : 0.045);
  const grains = seg(tier, 90, 45);

  const sandGeo = useMemo(() => {
    const rng = makeRng(4242);
    const arr = new Float32Array(grains * 3);
    for (let i = 0; i < grains; i++) {
      arr[i * 3] = (rng() - 0.5) * 0.1;
      arr[i * 3 + 1] = rng() * 1.3 - 0.65;
      arr[i * 3 + 2] = (rng() - 0.5) * 0.1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [grains]);

  const gears = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const pos = sandGeo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < grains; i++) {
      arr[i * 3 + 1] -= delta * 0.55;
      if (arr[i * 3 + 1] < -0.62) arr[i * 3 + 1] = 0.62;
    }
    pos.needsUpdate = true;

    // Race-and-stall: cubed sine so most of the loop is slow and the burst bites.
    const burst = Math.pow(Math.sin(t * 1.6) * 0.5 + 0.5, 3);
    const rate = 0.25 + burst * 4.5;
    if (gears.current) {
      gears.current.children.forEach((g, i) => {
        g.rotation.z += delta * rate * (i % 2 === 0 ? 1 : -1.45);
      });
    }
  });

  const teeth = seg(tier, 10, 7);

  return (
    <group>
      <group ref={gears} position={[0, 0, -1.1]}>
        {[
          [-0.85, 0.5, 0.5],
          [0.8, -0.35, 0.36],
        ].map(([x, y, r], gi) => (
          <group key={gi} position={[x, y, 0]}>
            <mesh material={wire}>
              <torusGeometry args={[r, 0.06, 5, seg(tier, 20, 12)]} />
            </mesh>
            {Array.from({ length: teeth }, (_, i) => {
              const a = (i / teeth) * Math.PI * 2;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * (r + 0.09), Math.sin(a) * (r + 0.09), 0]}
                  rotation={[0, 0, a]}
                  material={wire}
                >
                  <boxGeometry args={[0.13, 0.07, 0.07]} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>

      <mesh position={[0, 0.36, 0]} material={crt}>
        <coneGeometry args={[0.55, 0.72, seg(tier, 14, 8), 1, true]} />
      </mesh>
      <mesh position={[0, -0.36, 0]} rotation={[Math.PI, 0, 0]} material={crt}>
        <coneGeometry args={[0.55, 0.72, seg(tier, 14, 8), 1, true]} />
      </mesh>
      <points geometry={sandGeo} material={sandMat} />

      {[0.78, -0.78].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={frame}>
          <boxGeometry args={[1.3, 0.1, 0.46]} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0, 0]} material={frame}>
          <boxGeometry args={[0.05, 1.6, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}
