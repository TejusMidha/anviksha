'use client';

/* ERA 02 — E-Sports. Arcade pink, punchy, hard-edged with neon bloom-by-emissive. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  C,
  SceneProps,
  makeRng,
  pulse,
  seg,
  useGlowMaterial,
  useSmoothMaterial,
} from './shared';

/* -------------------------------------------------------------------------- */
/* Valorant — tactical shield with etched crosshair                            */
/* -------------------------------------------------------------------------- */
export function Valorant({ tier }: SceneProps) {
  const plate = useSmoothMaterial(C.arcade, { emissive: 0.28 });
  const etch = useSmoothMaterial('#ff8fbc', { emissive: 1.5 });
  const group = useRef<THREE.Group>(null);
  const radial = seg(tier, 6, 6);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!group.current) return;
    group.current.rotation.y = Math.sin(t * 0.6) * 0.42;
    group.current.rotation.x = Math.sin(t * 0.45) * 0.14;
    group.current.position.y = Math.sin(t * 1.1) * 0.06;
  });

  return (
    <group ref={group} scale={1.15}>
      {/* hex shield plate */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={plate}>
        <cylinderGeometry args={[1.15, 1.15, 0.14, radial]} />
      </mesh>
      <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]} material={etch}>
        <cylinderGeometry args={[1.0, 1.0, 0.02, radial, 1, true]} />
      </mesh>

      {/* crosshair reticle */}
      <group position={[0, 0, 0.12]}>
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
/* FIFA — faceted low-poly ball, slow tumble                                   */
/* -------------------------------------------------------------------------- */
export function FIFA({ tier }: SceneProps) {
  const ball = useRef<THREE.Mesh>(null);
  const detail = seg(tier, 1, 0);

  useFrame((_, delta) => {
    if (!ball.current) return;
    ball.current.rotation.y += delta * 0.42;
    ball.current.rotation.x += delta * 0.17;
  });

  return (
    <group>
      <mesh ref={ball} scale={1.3}>
        <icosahedronGeometry args={[1, detail]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={C.arcade}
          emissiveIntensity={0.35}
          flatShading
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      <mesh scale={1.34} rotation={[0.4, 0.2, 0]}>
        <icosahedronGeometry args={[1, detail]} />
        <meshBasicMaterial color={C.arcade} wireframe transparent opacity={0.55} />
      </mesh>
      {/* pitch shadow line */}
      <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.62, seg(tier, 32, 16)]} />
        <meshBasicMaterial color={C.arcade} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Mortal Kombat — crossed blades with a looping spark burst                   */
/* -------------------------------------------------------------------------- */
export function MortalKombat({ tier }: SceneProps) {
  const blade = useSmoothMaterial('#ffd9e6', { emissive: 0.5 });
  const hilt = useSmoothMaterial(C.arcade, { emissive: 0.9 });
  const sparkMat = useGlowMaterial('#ffd0e2', tier === 'low' ? 0.075 : 0.06);
  const count = seg(tier, 70, 34);

  const dirs = useMemo(() => {
    const rng = makeRng(777);
    const arr: number[] = [];
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const r = 0.4 + rng() * 0.9;
      arr.push(Math.cos(a) * r, Math.sin(a) * r, (rng() - 0.5) * 0.5);
    }
    return new Float32Array(arr);
  }, [count]);

  const sparkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);

  const sparks = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const burst = (t % 2.6) / 2.6; // 0..1 sawtooth
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
  });

  return (
    <group>
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
/* Tekken — gauntlet mid-punch with a radial shockwave                         */
/* -------------------------------------------------------------------------- */
export function Tekken({ tier }: SceneProps) {
  const metal = useSmoothMaterial(C.arcade, { emissive: 0.35 });
  const knuckle = useSmoothMaterial('#ff8fbc', { emissive: 0.9 });
  const fist = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: C.arcade,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const punch = pulse(t, 2.4, 0.3);
    if (fist.current) {
      fist.current.position.z = -0.3 + punch * 0.85;
      fist.current.rotation.x = -0.15 + punch * 0.2;
    }
    const wave = (t % 2.4) / 2.4;
    if (ring.current) {
      const s = 0.3 + wave * 2.2;
      ring.current.scale.setScalar(s);
      ringMat.opacity = Math.max(0, 0.75 - wave * 0.8);
    }
  });

  return (
    <group>
      <group ref={fist} rotation={[-0.15, 0.5, 0]}>
        {/* forearm */}
        <mesh position={[0, 0, -0.85]} material={metal}>
          <boxGeometry args={[0.5, 0.5, 1.0]} />
        </mesh>
        {/* fist block */}
        <mesh position={[0, 0.04, -0.1]} material={metal}>
          <boxGeometry args={[0.66, 0.62, 0.62]} />
        </mesh>
        {/* knuckles */}
        {[-0.19, 0, 0.19].map((x) => (
          <mesh key={x} position={[x, 0.2, 0.16]} material={knuckle}>
            <sphereGeometry args={[0.11, seg(tier, 10, 6), seg(tier, 8, 5)]} />
          </mesh>
        ))}
        {/* plate ridge */}
        <mesh position={[0, 0.3, -0.5]} material={knuckle}>
          <boxGeometry args={[0.56, 0.08, 0.7]} />
        </mesh>
      </group>

      <mesh ref={ring} position={[0, 0.05, 0.55]} material={ringMat}>
        <ringGeometry args={[0.55, 0.72, seg(tier, 40, 20)]} />
      </mesh>
    </group>
  );
}
