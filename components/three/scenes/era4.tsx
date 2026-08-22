'use client';

/* ERA 04 — Robotics + Media. Violet-to-cyan gradient, smooth and glowing. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C, SceneProps, pingPong, pulse, seg, useSmoothMaterial, useWireMaterial } from './shared';

const V = C.violet;
const K = C.holo;

/* -------------------------------------------------------------------------- */
/* Robo Soccer — bot with a repeating kick                                     */
/* -------------------------------------------------------------------------- */
export function RoboSoccer({ tier }: SceneProps) {
  const shell = useSmoothMaterial(V, { emissive: 0.35 });
  const trim = useSmoothMaterial(K, { emissive: 1.0 });
  const leg = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);
  const radial = seg(tier, 16, 9);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const kick = pulse(t, 3.0, 0.22);
    if (leg.current) leg.current.rotation.x = 0.1 - kick * 1.35;
    if (body.current) {
      body.current.position.y = Math.sin(t * 1.5) * 0.03;
      body.current.rotation.y = Math.sin(t * 0.4) * 0.25;
    }
    if (ball.current) {
      // Ball takes off on the strike, then rolls back into place.
      const phase = (t % 3.0) / 3.0;
      const flight = phase > 0.18 && phase < 0.7 ? (phase - 0.18) / 0.52 : 0;
      ball.current.position.x = 0.95 + flight * 0.75;
      ball.current.position.y = -0.72 + Math.sin(flight * Math.PI) * 0.35;
      ball.current.rotation.z -= 0.06;
    }
  });

  return (
    <group position={[-0.3, 0.15, 0]}>
      <group ref={body}>
        <mesh position={[0, 0, 0]} material={shell}>
          <boxGeometry args={[0.8, 0.85, 0.6]} />
        </mesh>
        <mesh position={[0, 0.62, 0]} material={shell}>
          <boxGeometry args={[0.5, 0.4, 0.45]} />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.66, 0.24]} material={trim}>
            <sphereGeometry args={[0.07, radial, radial * 0.6]} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 0]} material={trim}>
          <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
        </mesh>
        {[-0.52, 0.52].map((x) => (
          <mesh key={x} position={[x, 0.05, 0]} material={trim}>
            <boxGeometry args={[0.16, 0.55, 0.16]} />
          </mesh>
        ))}
        {/* static leg */}
        <mesh position={[-0.2, -0.7, 0]} material={shell}>
          <boxGeometry args={[0.22, 0.65, 0.22]} />
        </mesh>
        {/* kicking leg */}
        <group ref={leg} position={[0.2, -0.4, 0]}>
          <mesh position={[0, -0.3, 0]} material={shell}>
            <boxGeometry args={[0.22, 0.65, 0.22]} />
          </mesh>
          <mesh position={[0, -0.62, 0.1]} material={trim}>
            <boxGeometry args={[0.24, 0.12, 0.34]} />
          </mesh>
        </group>
      </group>

      <mesh ref={ball} position={[0.95, -0.72, 0]}>
        <icosahedronGeometry args={[0.3, seg(tier, 1, 0)]} />
        <meshStandardMaterial color="#e8f6ff" emissive={K} emissiveIntensity={0.5} flatShading roughness={0.3} />
      </mesh>

      <mesh position={[0.2, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 2]} />
        <meshStandardMaterial color={V} emissive={V} emissiveIntensity={0.15} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Robo Race — chassis on wheels with a speed trail                            */
/* -------------------------------------------------------------------------- */
export function RoboRace({ tier }: SceneProps) {
  const shell = useSmoothMaterial(V, { emissive: 0.3 });
  const trim = useSmoothMaterial(K, { emissive: 1.1 });
  const tyre = useSmoothMaterial('#1b2030', { emissive: 0.05 });
  const wheels = useRef<THREE.Group>(null);
  const car = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Group>(null);
  const radial = seg(tier, 14, 8);
  const streaks = seg(tier, 7, 4);

  const trailMats = useMemo(
    () =>
      Array.from(
        { length: streaks },
        () =>
          new THREE.MeshBasicMaterial({
            color: K,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [streaks],
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (wheels.current) wheels.current.children.forEach((w) => (w.rotation.z -= delta * 9));
    if (car.current) {
      car.current.position.y = Math.sin(t * 6) * 0.02;
      car.current.rotation.z = Math.sin(t * 3) * 0.015;
      car.current.rotation.y = -0.35;
    }
    if (trail.current) {
      trail.current.children.forEach((s, i) => {
        const phase = ((t * 2.2 + i / streaks) % 1);
        s.position.x = 0.6 - phase * 3.2;
        trailMats[i].opacity = 0.55 * (1 - phase);
        s.scale.x = 0.6 + phase * 1.6;
      });
    }
  });

  return (
    <group position={[0.25, 0.1, 0]}>
      <group ref={trail} position={[0, -0.15, -0.15]}>
        {Array.from({ length: streaks }, (_, i) => (
          <mesh key={i} position={[0, (i % 3) * 0.28 - 0.28, -0.1 * i]} material={trailMats[i]}>
            <boxGeometry args={[0.9, 0.03, 0.03]} />
          </mesh>
        ))}
      </group>

      <group ref={car}>
        <mesh material={shell}>
          <boxGeometry args={[1.7, 0.32, 0.9]} />
        </mesh>
        <mesh position={[-0.1, 0.3, 0]} material={shell}>
          <boxGeometry args={[0.9, 0.3, 0.7]} />
        </mesh>
        <mesh position={[0.55, 0.16, 0]} rotation={[0, 0, -0.35]} material={trim}>
          <boxGeometry args={[0.5, 0.06, 0.8]} />
        </mesh>
        <mesh position={[-0.85, 0.42, 0]} material={trim}>
          <boxGeometry args={[0.12, 0.28, 0.75]} />
        </mesh>
        {[-0.25, 0.25].map((z) => (
          <mesh key={z} position={[0.9, 0.05, z]} material={trim}>
            <sphereGeometry args={[0.08, radial, radial * 0.6]} />
          </mesh>
        ))}

        <group ref={wheels}>
          {[
            [-0.55, -0.22, 0.5],
            [-0.55, -0.22, -0.5],
            [0.6, -0.22, 0.5],
            [0.6, -0.22, -0.5],
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} material={tyre}>
              <cylinderGeometry args={[0.3, 0.3, 0.18, radial]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidequest — Through the Lens: camera with an irising aperture               */
/* -------------------------------------------------------------------------- */
export function ThroughTheLens({ tier }: SceneProps) {
  const shell = useSmoothMaterial(V, { emissive: 0.28 });
  const trim = useSmoothMaterial(K, { emissive: 1.0 });
  const glass = useSmoothMaterial(K, { emissive: 0.8, opacity: 0.35 });
  const blades = useRef<THREE.Group>(null);
  const cam = useRef<THREE.Group>(null);
  const radial = seg(tier, 24, 12);
  const bladeCount = 6;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const iris = pingPong(t, 4.0); // 0 closed -> 1 open
    if (blades.current) {
      blades.current.children.forEach((b, i) => {
        const a = (i / bladeCount) * Math.PI * 2;
        const r = 0.1 + iris * 0.26;
        b.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
        b.rotation.z = a + Math.PI / 2 + iris * 0.4;
      });
    }
    if (cam.current) {
      cam.current.rotation.y = -0.35 + Math.sin(t * 0.35) * 0.35;
      cam.current.rotation.x = Math.sin(t * 0.28) * 0.08;
    }
  });

  return (
    <group ref={cam}>
      <mesh material={shell}>
        <boxGeometry args={[1.7, 1.0, 0.8]} />
      </mesh>
      <mesh position={[0.35, 0.62, 0]} material={shell}>
        <boxGeometry args={[0.55, 0.28, 0.5]} />
      </mesh>
      <mesh position={[-0.55, 0.58, 0]} material={trim}>
        <cylinderGeometry args={[0.09, 0.09, 0.14, 12]} />
      </mesh>

      {/* lens barrel */}
      <mesh position={[0, -0.02, 0.55]} rotation={[Math.PI / 2, 0, 0]} material={shell}>
        <cylinderGeometry args={[0.46, 0.5, 0.5, radial]} />
      </mesh>
      <mesh position={[0, -0.02, 0.78]} rotation={[Math.PI / 2, 0, 0]} material={trim}>
        <torusGeometry args={[0.46, 0.05, 6, radial]} />
      </mesh>
      <mesh position={[0, -0.02, 0.8]} material={glass}>
        <circleGeometry args={[0.44, radial]} />
      </mesh>

      {/* aperture blades */}
      <group ref={blades} position={[0, -0.02, 0.82]}>
        {Array.from({ length: bladeCount }, (_, i) => (
          <mesh key={i} material={trim}>
            <boxGeometry args={[0.42, 0.06, 0.02]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Quest to Cinema — clapperboard that snaps shut                              */
/* -------------------------------------------------------------------------- */
export function QuestToCinema({ tier }: SceneProps) {
  const board = useSmoothMaterial(V, { emissive: 0.25 });
  const stripe = useSmoothMaterial(K, { emissive: 1.0 });
  const wire = useWireMaterial(K, 0.35);
  const clap = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Open slowly, snap shut hard.
    const p = (t % 3.2) / 3.2;
    const angle = p < 0.7 ? (p / 0.7) * 0.62 : 0.62 * Math.pow(1 - (p - 0.7) / 0.3, 3);
    if (clap.current) clap.current.rotation.z = angle;
    if (root.current) {
      root.current.rotation.y = -0.4 + Math.sin(t * 0.35) * 0.3;
      root.current.rotation.x = 0.12;
    }
  });

  const stripes = seg(tier, 6, 4);

  return (
    <group ref={root} position={[0, -0.1, 0]}>
      <mesh material={board}>
        <boxGeometry args={[1.9, 1.3, 0.09]} />
      </mesh>
      {[0.35, 0, -0.35].map((y) => (
        <mesh key={y} position={[0, y, 0.05]} material={wire}>
          <boxGeometry args={[1.6, 0.02, 0.01]} />
        </mesh>
      ))}

      <group ref={clap} position={[-0.95, 0.72, 0]}>
        <mesh position={[0.95, 0.06, 0]} material={board}>
          <boxGeometry args={[1.9, 0.26, 0.09]} />
        </mesh>
        {Array.from({ length: stripes }, (_, i) => (
          <mesh
            key={i}
            position={[0.2 + i * 0.3, 0.06, 0.05]}
            rotation={[0, 0, -0.28]}
            material={stripe}
          >
            <boxGeometry args={[0.13, 0.3, 0.02]} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 0.68, 0]} material={board}>
        <boxGeometry args={[1.9, 0.2, 0.09]} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Interface Quest — floating wireframe UI panel                               */
/* -------------------------------------------------------------------------- */
export function InterfaceQuest({ tier }: SceneProps) {
  const glass = useSmoothMaterial(K, { emissive: 0.4, opacity: 0.16 });
  const line = useSmoothMaterial(K, { emissive: 1.2 });
  const accent = useSmoothMaterial(V, { emissive: 1.0 });
  const root = useRef<THREE.Group>(null);
  const rows = seg(tier, 4, 3);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!root.current) return;
    root.current.rotation.y = Math.sin(t * 0.3) * 0.55;
    root.current.rotation.x = -0.12 + Math.sin(t * 0.22) * 0.1;
    root.current.position.y = Math.sin(t * 0.8) * 0.05;
  });

  return (
    <group ref={root}>
      <mesh material={glass}>
        <boxGeometry args={[2.2, 1.5, 0.04]} />
      </mesh>
      <mesh>
        <boxGeometry args={[2.2, 1.5, 0.04]} />
        <meshBasicMaterial color={K} wireframe transparent opacity={0.5} />
      </mesh>

      {/* title bar */}
      <mesh position={[0, 0.62, 0.04]} material={line}>
        <boxGeometry args={[2.2, 0.16, 0.02]} />
      </mesh>
      {[-0.95, -0.83, -0.71].map((x) => (
        <mesh key={x} position={[x, 0.62, 0.06]} material={accent}>
          <circleGeometry args={[0.035, 8]} />
        </mesh>
      ))}

      {/* content rows */}
      {Array.from({ length: rows }, (_, i) => (
        <mesh key={i} position={[-0.25, 0.28 - i * 0.28, 0.04]} material={line}>
          <boxGeometry args={[1.5 - (i % 2) * 0.4, 0.07, 0.01]} />
        </mesh>
      ))}
      {/* sidebar */}
      <mesh position={[-0.88, -0.08, 0.04]} material={accent}>
        <boxGeometry args={[0.34, 1.1, 0.02]} />
      </mesh>
      {/* cursor */}
      <mesh position={[0.72, -0.42, 0.08]} rotation={[0, 0, 0.5]} material={accent}>
        <coneGeometry args={[0.07, 0.2, 3]} />
      </mesh>
    </group>
  );
}
