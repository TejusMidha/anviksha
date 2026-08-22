'use client';

/* ERA 03 — Non-Technical. Neon violet, smoother surfaces, glass-leaning. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C, SceneProps, pingPong, pulse, seg, useSmoothMaterial, useWireMaterial } from './shared';

/* -------------------------------------------------------------------------- */
/* Tech Tunes — vinyl disc + reactive equalizer bars                           */
/* -------------------------------------------------------------------------- */
export function TechTunes({ tier }: SceneProps) {
  const body = useSmoothMaterial(C.violet, { emissive: 0.25 });
  const accent = useSmoothMaterial('#b18cff', { emissive: 1.1 });
  const glass = useSmoothMaterial(C.violet, { emissive: 0.5, opacity: 0.45 });
  const disc = useRef<THREE.Group>(null);
  const bars = useRef<THREE.Group>(null);
  const radial = seg(tier, 40, 20);
  const barCount = seg(tier, 9, 6);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (disc.current) disc.current.rotation.z = -t * 1.6;
    if (bars.current) {
      bars.current.children.forEach((b, i) => {
        // Fake spectrum: layered sines so neighbours never move in lockstep.
        const v =
          0.25 +
          0.75 *
            Math.abs(
              Math.sin(t * 3.1 + i * 0.9) * 0.6 + Math.sin(t * 5.3 + i * 1.7) * 0.4,
            );
        b.scale.y = 0.2 + v * 1.15;
        b.position.y = -0.75 + (0.2 + v * 1.15) * 0.25;
      });
    }
  });

  return (
    <group>
      <group ref={disc} position={[-0.75, 0.25, 0]} rotation={[0.35, 0, 0]}>
        <mesh material={body}>
          <cylinderGeometry args={[0.95, 0.95, 0.05, radial]} />
        </mesh>
        <mesh position={[0, 0.035, 0]} material={accent}>
          <cylinderGeometry args={[0.32, 0.32, 0.02, radial]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} material={accent}>
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
          <mesh key={i} position={[(i - (barCount - 1) / 2) * 0.17, -0.6, 0]} material={accent}>
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
/* The Parallel Protocol — two interlocking portal rings, counter-rotating     */
/* -------------------------------------------------------------------------- */
export function ParallelProtocol({ tier }: SceneProps) {
  const wireA = useWireMaterial(C.violet, 0.85);
  const wireB = useWireMaterial('#b18cff', 0.6);
  const glow = useSmoothMaterial(C.violet, { emissive: 1.4, opacity: 0.35 });
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  const tubular = seg(tier, 40, 22);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (a.current) {
      a.current.rotation.y = t * 0.55;
      a.current.rotation.z = Math.sin(t * 0.4) * 0.15;
    }
    if (b.current) {
      b.current.rotation.y = -t * 0.55;
      b.current.rotation.z = -Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <group scale={1.05}>
      <group ref={a} rotation={[0, 0, 0.35]}>
        <mesh material={wireA}>
          <torusGeometry args={[1.05, 0.1, 6, tubular]} />
        </mesh>
        <mesh material={glow}>
          <circleGeometry args={[0.98, seg(tier, 32, 16)]} />
        </mesh>
      </group>
      <group ref={b} rotation={[Math.PI / 2, 0, -0.35]} position={[0.35, 0, 0]}>
        <mesh material={wireB}>
          <torusGeometry args={[0.85, 0.09, 6, tubular]} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Nexus Negotiator — two abstract pieces facing off                           */
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

export function NexusNegotiator({ tier }: SceneProps) {
  const left = useSmoothMaterial(C.violet, { emissive: 0.55 });
  const right = useSmoothMaterial('#b18cff', { emissive: 0.35 });
  const groupL = useRef<THREE.Group>(null);
  const groupR = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const lean = pingPong(t, 4.5);
    if (groupL.current) {
      groupL.current.rotation.z = -0.12 * lean;
      groupL.current.position.x = -0.72 + 0.08 * lean;
    }
    if (groupR.current) {
      groupR.current.rotation.z = 0.12 * (1 - lean);
      groupR.current.position.x = 0.72 - 0.08 * (1 - lean);
    }
  });

  return (
    <group position={[0, 0.1, 0]} scale={0.95}>
      <group ref={groupL} position={[-0.72, 0, 0]}>
        <Piece crown="cone" material={left} tier={tier} />
      </group>
      <group ref={groupR} position={[0.72, 0, 0]}>
        <Piece crown="sphere" material={right} tier={tier} />
      </group>
      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 1.8]} />
        <meshStandardMaterial
          color={C.violet}
          emissive={C.violet}
          emissiveIntensity={0.18}
          transparent
          opacity={0.22}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Array Pata Hai — cube grid with a travelling highlight                      */
/* -------------------------------------------------------------------------- */
export function ArrayPataHai({ tier }: SceneProps) {
  const n = seg(tier, 4, 3);
  const total = n * n * n;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(() => new THREE.Color(C.violet), []);
  const hot = useMemo(() => new THREE.Color('#e6d6ff'), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime;
    const active = Math.floor(t * 2) % n; // travelling column index
    const gap = 0.62;
    let i = 0;

    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        for (let z = 0; z < n; z++) {
          const lit = x === active;
          const wobble = lit ? 1.18 + Math.sin(t * 6) * 0.06 : 1;
          dummy.position.set(
            (x - (n - 1) / 2) * gap,
            (y - (n - 1) / 2) * gap,
            (z - (n - 1) / 2) * gap,
          );
          dummy.scale.setScalar(0.34 * wobble);
          dummy.updateMatrix();
          m.setMatrixAt(i, dummy.matrix);
          tmp.copy(lit ? hot : base);
          m.setColorAt(i, tmp);
          i++;
        }
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    if (group.current) {
      group.current.rotation.y = t * 0.28;
      group.current.rotation.x = 0.35 + Math.sin(t * 0.3) * 0.08;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, total]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={C.violet}
          emissive={C.violet}
          emissiveIntensity={0.55}
          roughness={0.25}
          metalness={0.5}
        />
      </instancedMesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Secret Seekers — chest, padlock, hovering magnifier                         */
/* -------------------------------------------------------------------------- */
export function SecretSeekers({ tier }: SceneProps) {
  const body = useSmoothMaterial(C.violet, { emissive: 0.3 });
  const trim = useSmoothMaterial('#b18cff', { emissive: 0.9 });
  const glass = useSmoothMaterial(C.holo, { emissive: 0.7, opacity: 0.3 });
  const lid = useRef<THREE.Group>(null);
  const lens = useRef<THREE.Group>(null);
  const radial = seg(tier, 20, 11);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (lid.current) lid.current.rotation.x = -0.12 - pulse(t, 5, 0.4) * 0.55;
    if (lens.current) {
      lens.current.position.x = Math.sin(t * 0.9) * 0.45;
      lens.current.position.y = 0.95 + Math.sin(t * 1.6) * 0.09;
      lens.current.rotation.z = -0.5 + Math.sin(t * 0.9) * 0.25;
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

      {/* padlock */}
      <mesh position={[0, -0.42, 0.54]} material={trim}>
        <boxGeometry args={[0.3, 0.26, 0.1]} />
      </mesh>
      <mesh position={[0, -0.26, 0.54]} rotation={[Math.PI / 2, 0, 0]} material={trim}>
        <torusGeometry args={[0.11, 0.03, 4, radial, Math.PI]} />
      </mesh>

      {/* magnifier */}
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
