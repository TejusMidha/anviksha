'use client';

/**
 * Persistent hero background.
 *
 * Two instanced meshes occupy the same transforms and cross-fade with scroll:
 *   A — IcosahedronGeometry(detail 0), flat wireframe, phosphor green   (scroll 0)
 *   B — IcosahedronGeometry(detail 2/3), custom shader with vertex-noise
 *       displacement + fresnel rim, holo cyan                            (scroll 1)
 *
 * Cross-fading two instanced meshes is deliberate: swapping `wireframe` or
 * geometry detail on a live material forces a shader recompile mid-scroll,
 * which is exactly the kind of hitch this needs to avoid. Two draw calls total.
 */

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vSeed;

  // Cheap value noise — enough for an organic wobble, far less ALU than simplex.
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
          mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
          mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
    return n * 2.0 - 1.0;
  }

  void main() {
    vec3 instancePos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    float seed = hash(floor(instancePos * 7.0));
    vSeed = seed;

    float wob = noise(position * 1.6 + vec3(uTime * 0.25 + seed * 10.0));
    vec3 displaced = position + normal * wob * 0.38 * uMorph;

    vec4 worldPos = instanceMatrix * vec4(displaced, 1.0);
    vec4 mvPos = modelViewMatrix * worldPos;

    vNormalW = normalize(mat3(instanceMatrix) * normal);
    vViewDir = normalize(-mvPos.xyz);

    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAG = /* glsl */ `
  uniform float uMorph;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vSeed;

  void main() {
    vec3 n = normalize(vNormalW);
    float fres = pow(1.0 - abs(dot(n, normalize(vViewDir))), 2.0);
    float core = 0.18 + 0.55 * fres;

    vec3 col = mix(uColorA, uColorB, clamp(uMorph + vSeed * 0.18, 0.0, 1.0));
    float alpha = uOpacity * (0.22 + 0.78 * fres);

    gl_FragColor = vec4(col * core * 2.2, alpha);
  }
`;

interface FieldProps {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  count: number;
  detail: number;
  reduced: boolean;
}

function Field({ progress, pointer, count, detail, reduced }: FieldProps) {
  const wireRef = useRef<THREE.InstancedMesh>(null);
  const blobRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { invalidate } = useThree();

  // Deterministic layout so SSR/hydration and reloads look identical.
  const seeds = useMemo(() => {
    let s = 1337;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((rand() - 0.5) * 16, (rand() - 0.5) * 9, (rand() - 0.5) * 10 - 3),
      scale: 0.28 + rand() * 0.75,
      spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.25),
      phase: rand() * Math.PI * 2,
    }));
  }, [count]);

  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#39ff6a'),
        wireframe: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const blobMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uOpacity: { value: 0 },
          uColorA: { value: new THREE.Color('#39ff6a') },
          uColorB: { value: new THREE.Color('#4ce0ff') },
        },
      }),
    [],
  );

  useEffect(() => () => {
    wireMat.dispose();
    blobMat.dispose();
  }, [wireMat, blobMat]);

  const write = (t: number, p: number) => {
    const wire = wireRef.current;
    const blob = blobRef.current;
    if (!wire || !blob) return;

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      dummy.position.set(
        s.pos.x,
        s.pos.y + Math.sin(t * 0.35 + s.phase) * 0.25 * (1 - p * 0.4),
        s.pos.z,
      );
      dummy.rotation.set(t * s.spin.x, t * s.spin.y, t * s.spin.z);
      // Blocks tighten up early, blobs swell as the page evolves.
      dummy.scale.setScalar(s.scale * (1 + p * 0.35));
      dummy.updateMatrix();
      wire.setMatrixAt(i, dummy.matrix);
      blob.setMatrixAt(i, dummy.matrix);
    }
    wire.instanceMatrix.needsUpdate = true;
    blob.instanceMatrix.needsUpdate = true;

    wireMat.opacity = 0.5 * (1 - p) ** 1.2;
    blobMat.uniforms.uTime.value = t;
    blobMat.uniforms.uMorph.value = p;
    blobMat.uniforms.uOpacity.value = 0.55 * Math.min(1, p * 1.35);
  };

  // Reduced motion: paint exactly one frame and stop.
  useEffect(() => {
    if (!reduced) return;
    write(0, progress.current);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    write(t, progress.current);

    // Camera parallax — lerped so a fast flick never snaps.
    const cam = state.camera;
    cam.position.x += (pointer.current.x * 1.1 - cam.position.x) * 0.04;
    cam.position.y += (pointer.current.y * 0.7 - cam.position.y) * 0.04;
    cam.lookAt(0, 0, 0);
  });

  return (
    <group>
      <instancedMesh ref={wireRef} args={[undefined, undefined, count]} material={wireMat}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={blobRef} args={[undefined, undefined, count]} material={blobMat}>
        <icosahedronGeometry args={[1, detail]} />
      </instancedMesh>
    </group>
  );
}

export default function HeroField({
  progress,
  reduced,
  tier,
}: {
  progress: MutableRefObject<number>;
  reduced: boolean;
  tier: 'low' | 'high';
}) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  const count = tier === 'low' ? 22 : 44;
  const detail = tier === 'low' ? 2 : 3;

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 12], fov: 48 }}
      frameloop={reduced ? 'demand' : 'always'}
    >
      <Field progress={progress} pointer={pointer} count={count} detail={detail} reduced={reduced} />
    </Canvas>
  );
}
