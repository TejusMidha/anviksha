'use client';

/* ERA 03 — NON-TECHNICAL.
   Brochure divider: a retro console/TV framing a pixel landscape, so this
   section carries a warm console accent over the violet base. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  SceneProps,
  makeRng,
  pulse,
  rotateIndex,
  seg,
  strike,
  useSmoothMaterial,
  useWireMaterial,
} from './shared';

/* -------------------------------------------------------------------------- */
/* Tech Tunes — vinyl disc + full-colour equalizer                             */
/* Each bar owns a different hue and the whole rig runs a neon light-trace     */
/* glow. The moment: on every beat the glow cycles hue along the bar row, so   */
/* the pulse travels as colour rather than only as scale.                      */
/* -------------------------------------------------------------------------- */
export function TechTunes({ tier, p }: SceneProps) {
  const body = useSmoothMaterial(p.base, { emissive: 0.25 });
  const trace = useSmoothMaterial(p.accent, { emissive: 1.3 });
  const glass = useSmoothMaterial(p.base, { emissive: 0.5, opacity: 0.45 });
  const disc = useRef<THREE.Group>(null);
  const bars = useRef<THREE.Group>(null);
  const radial = seg(tier, 40, 20);
  const barCount = seg(tier, 9, 6);

  // One material per bar so each keeps its own hue; hue is animated in place
  // rather than by swapping materials.
  const barMats = useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) => {
        const c = new THREE.Color().setHSL(i / barCount, 0.85, 0.6);
        return new THREE.MeshStandardMaterial({
          color: c,
          emissive: c.clone(),
          emissiveIntensity: 0.9,
          roughness: 0.25,
          metalness: 0.4,
        });
      }),
    [barCount],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (disc.current) disc.current.rotation.z = -t * 1.6;

    const beat = strike(t, 1.3, 0.5);

    if (bars.current) {
      bars.current.children.forEach((b, i) => {
        const v =
          0.25 +
          0.75 *
            Math.abs(Math.sin(t * 3.1 + i * 0.9) * 0.6 + Math.sin(t * 5.3 + i * 1.7) * 0.4);
        b.scale.y = 0.2 + v * 1.15;
        b.position.y = -0.75 + (0.2 + v * 1.15) * 0.25;

        // Hue travels down the row on the beat.
        const hue = ((i / barCount) + t * 0.12) % 1;
        barMats[i].color.setHSL(hue, 0.85, 0.6);
        barMats[i].emissive.setHSL(hue, 0.9, 0.55);
        barMats[i].emissiveIntensity = 0.7 + v * 0.8 + beat * 0.9;
      });
    }
  });

  return (
    <group>
      <group ref={disc} position={[-0.75, 0.25, 0]} rotation={[0.35, 0, 0]}>
        <mesh material={body}>
          <cylinderGeometry args={[0.95, 0.95, 0.05, radial]} />
        </mesh>
        <mesh position={[0, 0.035, 0]} material={trace}>
          <cylinderGeometry args={[0.32, 0.32, 0.02, radial]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} material={trace}>
          <cylinderGeometry args={[0.045, 0.045, 0.09, 8]} />
        </mesh>
        {[0.55, 0.72, 0.86].map((r) => (
          <mesh key={r} position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={glass}>
            <torusGeometry args={[r, 0.008, 4, seg(tier, 40, 22)]} />
          </mesh>
        ))}
      </group>

      <group ref={bars} position={[0.95, 0, 0]}>
        {Array.from({ length: barCount }, (_, i) => (
          <mesh
            key={i}
            position={[(i - (barCount - 1) / 2) * 0.17, -0.6, 0]}
            material={barMats[i]}
          >
            <boxGeometry args={[0.1, 1, 0.1]} />
          </mesh>
        ))}
      </group>

      <mesh position={[0.95, -0.85, 0]} material={glass}>
        <boxGeometry args={[1.7, 0.12, 0.5]} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* The Parallel Protocol — FIVE portal rings in a loose arc                     */
/* Blue / purple / green / red-orange / blue, matching the poster. Each ring   */
/* rotates independently. The moment: a flare travels around the arc, one ring */
/* blazing at a time.                                                          */
/* -------------------------------------------------------------------------- */
const PORTAL_COLORS = ['#4c8fe0', '#8b5cff', '#3fd97a', '#ff7a3d', '#4ce0ff'];

export function ParallelProtocol({ tier, p }: SceneProps) {
  const RINGS = PORTAL_COLORS.length;
  const tubular = seg(tier, 26, 14);

  const ringMats = useMemo(
    () =>
      PORTAL_COLORS.map(
        (c) =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(c),
            emissive: new THREE.Color(c),
            emissiveIntensity: 0.9,
            roughness: 0.25,
            metalness: 0.5,
          }),
      ),
    [],
  );

  const filmMats = useMemo(
    () =>
      PORTAL_COLORS.map(
        (c) =>
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(c),
            transparent: true,
            opacity: 0.16,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [],
  );

  const group = useRef<THREE.Group>(null);

  // Loose arc: rings sit on a shallow curve rather than a straight row.
  const layout = useMemo(
    () =>
      Array.from({ length: RINGS }, (_, i) => {
        const u = (i / (RINGS - 1)) * 2 - 1; // -1..1
        return {
          x: u * 1.5,
          y: -Math.pow(u, 2) * 0.45 + 0.2,
          z: -Math.abs(u) * 0.3,
          r: 0.42 - Math.abs(u) * 0.08,
          tilt: u * 0.5,
          speed: 0.35 + i * 0.14,
        };
      }),
    [RINGS],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flaring = rotateIndex(t, RINGS, 1.1);
    const within = strike(t, 1.1, 0.7);

    if (group.current) {
      group.current.children.forEach((ring, i) => {
        ring.rotation.y = t * layout[i].speed;
        ring.rotation.z = layout[i].tilt + Math.sin(t * 0.3 + i) * 0.12;
        const hot = i === flaring ? within : 0;
        ring.scale.setScalar(1 + hot * 0.16);
        ringMats[i].emissiveIntensity = 0.75 + hot * 2.6;
        filmMats[i].opacity = 0.14 + hot * 0.4;
      });
    }
  });

  return (
    <group ref={group} scale={1.15}>
      {layout.map((l, i) => (
        <group key={i} position={[l.x, l.y, l.z]}>
          <mesh material={ringMats[i]}>
            <torusGeometry args={[l.r, 0.055, 6, tubular]} />
          </mesh>
          <mesh material={filmMats[i]}>
            <circleGeometry args={[l.r - 0.03, seg(tier, 20, 12)]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Nexus Negotiator — warm gold/orange vs blue, coins and gems                 */
/* The moment: the two forms lean apart, then converge into a brief "handshake"*/
/* at centre; coin/gem particles drift up out of the deal as they meet.        */
/* -------------------------------------------------------------------------- */
function Piece({
  crown,
  material,
  tier,
}: {
  crown: 'cone' | 'sphere';
  material: THREE.Material;
  tier: 'low' | 'high';
}) {
  const radial = seg(tier, 16, 9);
  return (
    <group>
      <mesh position={[0, -0.85, 0]} material={material}>
        <cylinderGeometry args={[0.42, 0.5, 0.16, radial]} />
      </mesh>
      <mesh position={[0, -0.35, 0]} material={material}>
        <cylinderGeometry args={[0.16, 0.3, 0.9, radial]} />
      </mesh>
      <mesh position={[0, 0.15, 0]} material={material}>
        <torusGeometry args={[0.22, 0.06, 5, radial]} />
      </mesh>
      {crown === 'cone' ? (
        <mesh position={[0, 0.55, 0]} material={material}>
          <coneGeometry args={[0.28, 0.62, radial]} />
        </mesh>
      ) : (
        <mesh position={[0, 0.48, 0]} material={material}>
          <sphereGeometry args={[0.3, radial, radial * 0.6]} />
        </mesh>
      )}
    </group>
  );
}

export function NexusNegotiator({ tier, p }: SceneProps) {
  const left = useSmoothMaterial(p.accent, { emissive: 0.7 });
  const right = useSmoothMaterial(p.base, { emissive: 0.5 });
  const groupL = useRef<THREE.Group>(null);
  const groupR = useRef<THREE.Group>(null);

  const coinCount = seg(tier, 26, 13);
  const coinGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(coinCount * 3), 3));
    return g;
  }, [coinCount]);

  const coinMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(p.hot),
        size: tier === 'low' ? 0.09 : 0.07,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [p.hot, tier],
  );

  const coinSeeds = useMemo(() => {
    const rng = makeRng(6161);
    return Array.from({ length: coinCount }, () => ({
      x: (rng() - 0.5) * 1.1,
      z: (rng() - 0.5) * 0.6,
      speed: 0.5 + rng() * 0.7,
      off: rng(),
    }));
  }, [coinCount]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const CYCLE = 4.5;
    const phase = (t % CYCLE) / CYCLE;

    // Apart for most of the loop, converge briefly at the handshake.
    const shake = phase > 0.55 && phase < 0.8 ? Math.sin(((phase - 0.55) / 0.25) * Math.PI) : 0;

    if (groupL.current) {
      groupL.current.position.x = -0.72 + shake * 0.42;
      groupL.current.rotation.z = shake * 0.2;
    }
    if (groupR.current) {
      groupR.current.position.x = 0.72 - shake * 0.42;
      groupR.current.rotation.z = -shake * 0.2;
    }

    // Coins rise out of the deal while it is being struck.
    const pos = coinGeo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    coinSeeds.forEach((c, i) => {
      const rise = ((t * c.speed + c.off) % 1);
      arr[i * 3] = c.x;
      arr[i * 3 + 1] = -0.6 + rise * 1.5;
      arr[i * 3 + 2] = c.z;
    });
    pos.needsUpdate = true;
    coinMat.opacity = shake * 0.85;
  });

  return (
    <group position={[0, 0.1, 0]} scale={0.95}>
      <group ref={groupL} position={[-0.72, 0, 0]}>
        <Piece crown="cone" material={left} tier={tier} />
      </group>
      <group ref={groupR} position={[0.72, 0, 0]}>
        <Piece crown="sphere" material={right} tier={tier} />
      </group>

      <points geometry={coinGeo} material={coinMat} />

      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 1.8]} />
        <meshStandardMaterial
          color={p.base}
          emissive={p.base}
          emissiveIntensity={0.2}
          transparent
          opacity={0.24}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Array Pata Hai — a grid of flat letter tiles, Wordle-style                  */
/* Rebuilt from cubes to a flat 2D tile board per the poster: each tile takes  */
/* a pink-to-cyan gradient position. The moment: a highlight sweeps across the */
/* board cycling through three states, and each tile flips on the way past.    */
/* -------------------------------------------------------------------------- */
export function ArrayPataHai({ tier, p }: SceneProps) {
  const COLS = seg(tier, 5, 4);
  const ROWS = seg(tier, 5, 4);
  const total = COLS * ROWS;

  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const group = useRef<THREE.Group>(null);

  /* Three highlight states cycled by the travelling sweep — the Wordle read:
     resting gradient, "present", "correct". */
  const states = useMemo(
    () => [new THREE.Color(p.base), new THREE.Color(p.hot), new THREE.Color(p.accent)],
    [p.base, p.hot, p.accent],
  );
  const gradA = useMemo(() => new THREE.Color(p.base), [p.base]);
  const gradB = useMemo(() => new THREE.Color(p.accent), [p.accent]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const rest = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime;

    const gap = 0.56;
    // Sweep travels column by column; a full pass takes COLS * 0.35s.
    const sweep = (t / 0.35) % (COLS + 2);
    const stateIdx = Math.floor(t / (0.35 * (COLS + 2))) % states.length;

    let i = 0;
    for (let cx = 0; cx < COLS; cx++) {
      for (let cy = 0; cy < ROWS; cy++) {
        // Distance from the sweep front, in columns.
        const d = sweep - cx;
        // Flip: a tile rotates a half-turn as the front passes over it.
        const flip = d > 0 && d < 1 ? d : d >= 1 ? 1 : 0;
        const angle = flip * Math.PI;
        const lit = d > 0 && d < 1.6;

        dummy.position.set(
          (cx - (COLS - 1) / 2) * gap,
          (cy - (ROWS - 1) / 2) * gap,
          0,
        );
        dummy.rotation.set(angle, 0, 0);
        // Squash at the midpoint of the flip so it reads as a real card turn.
        const squash = 1 - Math.sin(flip * Math.PI) * 0.25;
        dummy.scale.set(0.46, 0.46 * squash, 0.46);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);

        // Resting colour is the pink-to-cyan gradient across the board.
        rest.copy(gradA).lerp(gradB, (cx + cy) / (COLS + ROWS - 2));
        tmp.copy(lit ? states[stateIdx] : rest);
        m.setColorAt(i, tmp);
        i++;
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.28) * 0.32;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Flat tiles, not cubes — one instanced draw call for the whole board. */}
      <instancedMesh ref={mesh} args={[undefined, undefined, total]}>
        <boxGeometry args={[1, 1, 0.16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.35}
          roughness={0.4}
          metalness={0.15}
        />
      </instancedMesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Secret Seekers — sky blue with warm brick-red accents                       */
/* Shares the brochure's brick palette with the Part 1 timeline, so the two    */
/* visually rhyme. The moment: the magnifier sweeps a spotlight cone across    */
/* the chest, brightening whatever it passes over.                             */
/* -------------------------------------------------------------------------- */
export function SecretSeekers({ tier, p }: SceneProps) {
  const body = useSmoothMaterial(p.base, { emissive: 0.4 });
  const trim = useSmoothMaterial(p.accent, { emissive: 0.9 });
  const glass = useSmoothMaterial(p.hot, { emissive: 0.7, opacity: 0.3 });
  const lid = useRef<THREE.Group>(null);
  const lens = useRef<THREE.Group>(null);
  const cone = useRef<THREE.Mesh>(null);
  const radial = seg(tier, 20, 11);

  const coneMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.hot),
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [p.hot],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (lid.current) lid.current.rotation.x = -0.12 - pulse(t, 5, 0.4) * 0.55;

    const sweep = Math.sin(t * 0.9);
    if (lens.current) {
      lens.current.position.x = sweep * 0.45;
      lens.current.position.y = 0.95 + Math.sin(t * 1.6) * 0.09;
      lens.current.rotation.z = -0.5 + sweep * 0.25;
    }
    // Spotlight cone tracks the lens and pulses as it crosses centre.
    if (cone.current) {
      cone.current.position.x = sweep * 0.45;
      cone.current.rotation.z = sweep * 0.28;
      coneMat.opacity = 0.1 + (1 - Math.abs(sweep)) * 0.22;
    }
  });

  return (
    <group position={[0, -0.15, 0]}>
      <mesh position={[0, -0.42, 0]} material={body}>
        <boxGeometry args={[1.6, 0.8, 1.0]} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, -0.42, 0]} material={trim}>
          <boxGeometry args={[0.1, 0.84, 1.04]} />
        </mesh>
      ))}

      <group ref={lid} position={[0, -0.02, -0.5]}>
        <mesh position={[0, 0, 0.5]} rotation={[0, 0, Math.PI / 2]} material={body}>
          <cylinderGeometry args={[0.5, 0.5, 1.6, radial, 1, false, 0, Math.PI]} />
        </mesh>
      </group>

      <mesh position={[0, -0.42, 0.54]} material={trim}>
        <boxGeometry args={[0.3, 0.26, 0.1]} />
      </mesh>
      <mesh position={[0, -0.26, 0.54]} rotation={[Math.PI / 2, 0, 0]} material={trim}>
        <torusGeometry args={[0.11, 0.03, 4, radial, Math.PI]} />
      </mesh>

      {/* spotlight cone from the lens down onto the chest */}
      <mesh
        ref={cone}
        position={[0, 0.25, 0.7]}
        rotation={[0, 0, 0]}
        material={coneMat}
      >
        <coneGeometry args={[0.42, 1.2, seg(tier, 14, 8), 1, true]} />
      </mesh>

      <group ref={lens} position={[0, 0.95, 0.7]} rotation={[0, 0, -0.5]}>
        <mesh material={trim}>
          <torusGeometry args={[0.3, 0.045, 5, radial]} />
        </mesh>
        <mesh material={glass}>
          <circleGeometry args={[0.29, radial]} />
        </mesh>
        <mesh position={[0, -0.5, 0]} material={trim}>
          <cylinderGeometry args={[0.05, 0.05, 0.45, 8]} />
        </mesh>
      </group>
    </group>
  );
}
