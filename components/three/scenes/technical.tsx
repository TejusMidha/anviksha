'use client';

/* ERA 01 — Technical. Phosphor green, hard edges, flat shading, wireframe. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  C,
  SceneProps,
  makeRng,
  pulse,
  seg,
  useFlatMaterial,
  useGlowMaterial,
  useWireMaterial,
} from './shared';

/* -------------------------------------------------------------------------- */
/* Capture the Flag — flag planted on a wireframe server block                 */
/* -------------------------------------------------------------------------- */
export function CaptureTheFlag({ tier }: SceneProps) {
  const wire = useWireMaterial(C.phosphor, 0.7);
  const flat = useFlatMaterial(C.phosphor, 0.7);
  const geoRef = useRef<THREE.PlaneGeometry>(null);
  const base = useRef<Float32Array | null>(null);
  const group = useRef<THREE.Group>(null);

  const [w, h] = [seg(tier, 14, 8), seg(tier, 10, 6)];

  useFrame(({ clock }) => {
    const g = geoRef.current;
    if (!g) return;
    const pos = g.attributes.position as THREE.BufferAttribute;
    if (!base.current) base.current = Float32Array.from(pos.array as Float32Array);

    const t = clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const x = base.current[i * 3];
      const y = base.current[i * 3 + 1];
      // Anchored at the pole (x = -0.55), free at the trailing edge.
      const grip = (x + 0.55) / 1.1;
      pos.setZ(i, Math.sin(x * 6 - t * 3.2 + y * 1.5) * 0.11 * grip * grip);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();

    if (group.current) group.current.rotation.y = Math.sin(t * 0.3) * 0.3;
  });

  return (
    <group ref={group}>
      {/* server block */}
      <mesh position={[0, -0.95, 0]} material={wire}>
        <boxGeometry args={[1.5, 1.1, 1.1, 2, 2, 2]} />
      </mesh>
      {/* rack slots */}
      {[-0.3, -0.75, -1.2].map((y) => (
        <mesh key={y} position={[0, y, 0.56]} material={flat}>
          <boxGeometry args={[1.15, 0.06, 0.02]} />
        </mesh>
      ))}
      {/* pole */}
      <mesh position={[-0.55, 0.55, 0]} material={flat}>
        <cylinderGeometry args={[0.035, 0.035, 2.1, 6]} />
      </mesh>
      {/* flag */}
      <mesh position={[0, 1.15, 0]}>
        <planeGeometry ref={geoRef} args={[1.1, 0.62, w, h]} />
        <meshStandardMaterial
          color={C.phosphor}
          emissive={C.phosphor}
          emissiveIntensity={0.45}
          flatShading
          side={THREE.DoubleSide}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Escape the Server — vault door with counter-rotating tumbler rings          */
/* -------------------------------------------------------------------------- */
export function EscapeTheServer({ tier }: SceneProps) {
  const wire = useWireMaterial(C.phosphor, 0.55);
  const flat = useFlatMaterial(C.phosphor, 0.8);
  const rings = useRef<THREE.Group>(null);
  const handle = useRef<THREE.Group>(null);
  const radial = seg(tier, 32, 18);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (rings.current) {
      rings.current.children.forEach((child, i) => {
        child.rotation.z = t * (0.5 - i * 0.32) * (i % 2 === 0 ? 1 : -1);
      });
    }
    if (handle.current) {
      // Quarter-turn every 6s, then hold.
      handle.current.rotation.z = pulse(t, 6, 0.35) * Math.PI * 0.5;
    }
  });

  return (
    <group rotation={[0, 0, 0]}>
      <mesh material={wire} position={[0, 0, -0.25]}>
        <cylinderGeometry args={[1.35, 1.35, 0.3, radial, 1, true]} />
      </mesh>
      <mesh material={flat} position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.12, radial]} />
      </mesh>

      <group ref={rings}>
        {[1.0, 0.75, 0.5].map((r, i) => (
          <mesh key={r} position={[0, 0, 0.02 + i * 0.03]} material={flat}>
            <torusGeometry args={[r, 0.045, 6, seg(tier, 36, 20)]} />
          </mesh>
        ))}
      </group>

      <group ref={handle}>
        {[0, Math.PI / 2].map((rot) => (
          <mesh key={rot} rotation={[0, 0, rot]} position={[0, 0, 0.16]} material={flat}>
            <boxGeometry args={[0.9, 0.07, 0.07]} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.18]} material={flat}>
          <sphereGeometry args={[0.11, 8, 6]} />
        </mesh>
      </group>

      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.28, Math.sin(a) * 1.28, 0]} material={flat}>
            <sphereGeometry args={[0.07, 6, 5]} />
          </mesh>
        );
      })}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Bridge Wars — procedural low-poly truss with a slow sway                    */
/* -------------------------------------------------------------------------- */
export function BridgeWars({ tier }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const bays = seg(tier, 8, 5);

  const geometry = useMemo(() => {
    const pts: number[] = [];
    const span = 3.4;
    const width = 0.75;
    const step = span / bays;
    const x0 = -span / 2;
    const arc = (i: number) => 0.62 * Math.sin((i / bays) * Math.PI) + 0.18;

    const push = (a: number[], b: number[]) => pts.push(...a, ...b);

    for (const z of [-width / 2, width / 2]) {
      for (let i = 0; i < bays; i++) {
        const xa = x0 + i * step;
        const xb = x0 + (i + 1) * step;
        push([xa, 0, z], [xb, 0, z]); // bottom chord
        push([xa, arc(i), z], [xb, arc(i + 1), z]); // top chord (arched)
        push([xa, 0, z], [xa, arc(i), z]); // vertical
        push([xa, 0, z], [xb, arc(i + 1), z]); // diagonal
      }
      push([x0 + span, 0, z], [x0 + span, arc(bays), z]);
    }

    // deck + cross bracing
    for (let i = 0; i <= bays; i++) {
      const x = x0 + i * step;
      push([x, 0, -width / 2], [x, 0, width / 2]);
      push([x, arc(i), -width / 2], [x, arc(i), width / 2]);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [bays]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!group.current) return;
    group.current.rotation.z = Math.sin(t * 0.7) * 0.022; // load sway
    group.current.rotation.y = -0.5 + Math.sin(t * 0.25) * 0.22;
    group.current.position.y = -0.35 + Math.sin(t * 0.7) * 0.02;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={C.phosphor} transparent opacity={0.9} />
      </lineSegments>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[3.4, 0.03, 0.75]} />
        <meshStandardMaterial
          color={C.phosphor}
          emissive={C.phosphor}
          emissiveIntensity={0.3}
          flatShading
          roughness={1}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Algorithm Auction — gavel over floating 1010 digits                         */
/* -------------------------------------------------------------------------- */
export function AlgorithmAuction({ tier }: SceneProps) {
  const flat = useFlatMaterial(C.phosphor, 0.8);
  const glow = useFlatMaterial(C.amber, 1.4);
  const gavel = useRef<THREE.Group>(null);
  const digits = useRef<THREE.Group>(null);
  const radial = seg(tier, 10, 6);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (gavel.current) {
      const strike = pulse(t, 3.4, 0.22);
      gavel.current.rotation.z = -0.5 + strike * 0.55;
      gavel.current.position.y = 0.75 - strike * 0.28;
    }
    if (digits.current) {
      digits.current.children.forEach((d, i) => {
        d.position.y = -0.55 + Math.sin(t * 1.4 + i * 1.2) * 0.09;
        d.rotation.y = t * 0.6 + i;
      });
    }
  });

  return (
    <group>
      <group ref={gavel} position={[0.1, 0.75, 0]} rotation={[0, 0, -0.5]}>
        <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={flat}>
          <cylinderGeometry args={[0.055, 0.055, 1.0, radial]} />
        </mesh>
        <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={flat}>
          <cylinderGeometry args={[0.24, 0.24, 0.62, radial]} />
        </mesh>
      </group>

      {/* sound block */}
      <mesh position={[0.1, -1.15, 0]} material={flat}>
        <boxGeometry args={[1.0, 0.12, 0.5]} />
      </mesh>

      {/* 1 0 1 0 */}
      <group ref={digits}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[-0.78 + i * 0.52, -0.55, 0.1]}>
            {i % 2 === 0 ? (
              <mesh material={glow}>
                <boxGeometry args={[0.11, 0.44, 0.11]} />
              </mesh>
            ) : (
              <mesh material={glow}>
                <torusGeometry args={[0.16, 0.055, 5, seg(tier, 14, 9)]} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* AI Whisperer — point-cloud head, noise-driven breathing                     */
/* -------------------------------------------------------------------------- */
const HEAD_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  varying float vA;
  void main() {
    vec3 p = position;
    float n =
      sin(p.x * 3.1 + uTime * 1.1) * 0.34 +
      sin(p.y * 4.2 + uTime * 0.9) * 0.34 +
      sin(p.z * 3.6 + uTime * 1.4) * 0.34;
    p += normalize(position + 0.0001) * n * 0.11;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (240.0 / max(0.001, -mv.z));
    gl_Position = projectionMatrix * mv;
    vA = 0.35 + 0.65 * smoothstep(-1.0, 1.0, n);
  }
`;

const HEAD_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, vA * (1.0 - d * 2.0));
  }
`;

export function AIWhisperer({ tier }: SceneProps) {
  const count = seg(tier, 900, 420);
  const group = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const rng = makeRng(9001);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Fibonacci-ish sphere, squashed into a head silhouette.
      const u = rng() * 2 - 1;
      const th = rng() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      let x = r * Math.cos(th);
      let y = u;
      let z = r * Math.sin(th);
      const jaw = y < -0.25 ? 0.82 : 1;
      arr[i * 3] = x * 0.82 * jaw;
      arr[i * 3 + 1] = y * 1.08;
      // brow / nose bump on the +z face
      arr[i * 3 + 2] = z * 0.88 + (z > 0.55 ? 0.14 : 0) * (1 - Math.abs(y));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: HEAD_VERT,
        fragmentShader: HEAD_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: tier === 'low' ? 0.055 : 0.045 },
          uColor: { value: new THREE.Color(C.phosphor) },
        },
      }),
    [tier],
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.6;
  });

  return (
    <group ref={group} scale={1.25}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Tech Minute to Win It — hourglass with sand, gears behind                   */
/* -------------------------------------------------------------------------- */
export function TechMinute({ tier }: SceneProps) {
  const wire = useWireMaterial(C.phosphor, 0.6);
  const flat = useFlatMaterial(C.phosphor, 0.8);
  const sandMat = useGlowMaterial(C.amber, tier === 'low' ? 0.055 : 0.045);
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

  useFrame((_, delta) => {
    const pos = sandGeo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < grains; i++) {
      arr[i * 3 + 1] -= delta * 0.55;
      if (arr[i * 3 + 1] < -0.62) arr[i * 3 + 1] = 0.62;
    }
    pos.needsUpdate = true;

    if (gears.current) {
      gears.current.children.forEach((g, i) => {
        g.rotation.z += delta * (i % 2 === 0 ? 0.5 : -0.75);
      });
    }
  });

  const teeth = seg(tier, 10, 7);

  return (
    <group>
      {/* gears behind */}
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

      {/* hourglass */}
      <mesh position={[0, 0.36, 0]} material={wire}>
        <coneGeometry args={[0.55, 0.72, seg(tier, 14, 8), 1, true]} />
      </mesh>
      <mesh position={[0, -0.36, 0]} rotation={[Math.PI, 0, 0]} material={wire}>
        <coneGeometry args={[0.55, 0.72, seg(tier, 14, 8), 1, true]} />
      </mesh>
      <points geometry={sandGeo} material={sandMat} />

      {[0.78, -0.78].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={flat}>
          <boxGeometry args={[1.3, 0.1, 1.3 * 0.35]} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0, 0]} material={flat}>
          <boxGeometry args={[0.05, 1.6, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}
