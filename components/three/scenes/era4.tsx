'use client';

/* ERA 04 — ROBOTICS + PHOTOGRAPHY / DESIGN & MEDIA.
   Robotics divider: cyan/magenta line-art robot on deep purple.
   Media divider: neon Space-Invaders magenta/cyan on deep purple. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  SceneProps,
  pingPong,
  pulse,
  seg,
  strike,
  useSmoothMaterial,
} from './shared';

/* -------------------------------------------------------------------------- */
/* Robo Soccer — chrome humanoid, red + electric blue-pink accents             */
/* The moment: the kick leaves a motion-trail arc behind the boot and throws   */
/* lightning-bolt flickers off the goal frame on impact.                       */
/* -------------------------------------------------------------------------- */
export function RoboSoccer({ tier, p }: SceneProps) {
  // Chrome/silver body: high metalness + low roughness. No texture needed —
  // the rig's two coloured lights do the work.
  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.base),
        emissive: new THREE.Color(p.base),
        emissiveIntensity: 0.12,
        roughness: 0.14,
        metalness: 0.95,
      }),
    [p.base],
  );
  const hot = useSmoothMaterial(p.accent, { emissive: 1.3 });
  const electric = useSmoothMaterial(p.hot, { emissive: 1.5 });

  const leg = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Group>(null);
  const bolts = useRef<THREE.Group>(null);
  const radial = seg(tier, 16, 9);

  const TRAIL = seg(tier, 5, 3);
  const trailMats = useMemo(
    () =>
      Array.from(
        { length: TRAIL },
        () =>
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(p.hot),
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [TRAIL, p.hot],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const CYCLE = 3.0;
    const kick = pulse(t, CYCLE, 0.22);
    const impact = strike(t, CYCLE, 0.25);

    if (leg.current) leg.current.rotation.x = 0.1 - kick * 1.35;
    if (body.current) {
      body.current.position.y = Math.sin(t * 1.5) * 0.03;
      body.current.rotation.y = Math.sin(t * 0.4) * 0.25;
    }
    if (ball.current) {
      const phase = (t % CYCLE) / CYCLE;
      const flight = phase > 0.18 && phase < 0.7 ? (phase - 0.18) / 0.52 : 0;
      ball.current.position.x = 0.95 + flight * 0.75;
      ball.current.position.y = -0.72 + Math.sin(flight * Math.PI) * 0.35;
      ball.current.rotation.z -= 0.06;
    }

    // Motion-trail arc: each segment lags the boot along the swing path.
    if (trail.current) {
      trail.current.children.forEach((s, i) => {
        const lag = Math.max(0, kick - i * 0.12);
        const a = 0.1 - lag * 1.35;
        s.position.set(0.2 + Math.sin(a) * 0.62, -0.4 - Math.cos(a) * 0.62, 0.08);
        s.rotation.z = -a;
        trailMats[i].opacity = lag * 0.5 * (1 - i / TRAIL);
      });
    }

    // Lightning flickers on impact only — visibility toggling, no new geometry.
    if (bolts.current) {
      bolts.current.children.forEach((b, i) => {
        b.visible = impact > 0.25 && (Math.floor(t * 30) + i) % 3 !== 0;
        b.scale.setScalar(0.7 + impact * 0.6);
      });
    }
  });

  return (
    <group position={[-0.3, 0.15, 0]}>
      <group ref={body}>
        <mesh material={shell}>
          <boxGeometry args={[0.8, 0.85, 0.6]} />
        </mesh>
        <mesh position={[0, 0.62, 0]} material={shell}>
          <boxGeometry args={[0.5, 0.4, 0.45]} />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.66, 0.24]} material={hot}>
            <sphereGeometry args={[0.07, radial, radial * 0.6]} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 0]} material={electric}>
          <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
        </mesh>
        {[-0.52, 0.52].map((x) => (
          <mesh key={x} position={[x, 0.05, 0]} material={hot}>
            <boxGeometry args={[0.16, 0.55, 0.16]} />
          </mesh>
        ))}
        <mesh position={[-0.2, -0.7, 0]} material={shell}>
          <boxGeometry args={[0.22, 0.65, 0.22]} />
        </mesh>
        <group ref={leg} position={[0.2, -0.4, 0]}>
          <mesh position={[0, -0.3, 0]} material={shell}>
            <boxGeometry args={[0.22, 0.65, 0.22]} />
          </mesh>
          <mesh position={[0, -0.62, 0.1]} material={electric}>
            <boxGeometry args={[0.24, 0.12, 0.34]} />
          </mesh>
        </group>
      </group>

      <group ref={trail}>
        {Array.from({ length: TRAIL }, (_, i) => (
          <mesh key={i} material={trailMats[i]}>
            <boxGeometry args={[0.2, 0.1, 0.28]} />
          </mesh>
        ))}
      </group>

      <group ref={bolts} position={[1.5, -0.2, -0.3]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[0, 0.4 - i * 0.42, 0]}
            rotation={[0, 0, 0.5 - i * 0.5]}
            material={electric}
          >
            <boxGeometry args={[0.06, 0.34, 0.02]} />
          </mesh>
        ))}
      </group>

      {/* ball keeps the green/white panelling shared with FIFA */}
      <mesh ref={ball} position={[0.95, -0.72, 0]}>
        <icosahedronGeometry args={[0.3, seg(tier, 1, 0)]} />
        <meshStandardMaterial
          color="#e8f6ff"
          emissive="#3fbf6a"
          emissiveIntensity={0.5}
          flatShading
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0.2, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 2]} />
        <meshStandardMaterial
          color={p.accent}
          emissive={p.accent}
          emissiveIntensity={0.15}
          transparent
          opacity={0.18}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Robo Race — liquid-chrome car with orange AND cyan speed streaks            */
/* The moment: a boost surge every 4s — wheels spin up, the car lunges, and    */
/* the streaks stretch and brighten with it.                                    */
/* -------------------------------------------------------------------------- */
export function RoboRace({ tier, p }: SceneProps) {
  // Liquid chrome: near-mirror metal, coloured by the rig rather than by
  // its own albedo, which is what makes it read as chrome and not paint.
  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.base),
        emissive: new THREE.Color(p.base),
        emissiveIntensity: 0.1,
        roughness: 0.08,
        metalness: 1.0,
      }),
    [p.base],
  );
  const trim = useSmoothMaterial(p.accent, { emissive: 1.2 });
  const tyre = useSmoothMaterial('#1b2030', { emissive: 0.05 });

  const wheels = useRef<THREE.Group>(null);
  const car = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Group>(null);
  const radial = seg(tier, 14, 8);
  const streaks = seg(tier, 8, 4);

  // Alternating orange / cyan, per the poster's dual-colour streaks.
  const trailMats = useMemo(
    () =>
      Array.from(
        { length: streaks },
        (_, i) =>
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(i % 2 === 0 ? p.accent : p.hot),
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [streaks, p.accent, p.hot],
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const boost = strike(t, 4, 0.3);

    if (wheels.current) {
      wheels.current.children.forEach((w) => (w.rotation.z -= delta * (9 + boost * 22)));
    }
    if (car.current) {
      car.current.position.y = Math.sin(t * 6) * 0.02;
      car.current.position.x = boost * 0.12;
      car.current.rotation.z = Math.sin(t * 3) * 0.015 - boost * 0.04;
      car.current.rotation.y = -0.35;
    }
    if (trail.current) {
      trail.current.children.forEach((s, i) => {
        const phase = (t * (2.2 + boost * 3) + i / streaks) % 1;
        s.position.x = 0.6 - phase * 3.2;
        trailMats[i].opacity = (0.5 + boost * 0.4) * (1 - phase);
        s.scale.x = 0.6 + phase * (1.6 + boost * 2.2);
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
/* Sidequest — Through the Lens                                                */
/* Dark camera body with a magenta-to-cyan light cone beaming upward — the     */
/* poster's strongest image, so it leads here. The moment: at full aperture    */
/* the lens throws a brief flare glint and the cone widens with it.            */
/* -------------------------------------------------------------------------- */
export function ThroughTheLens({ tier, p }: SceneProps) {
  const shell = useSmoothMaterial(p.base, { emissive: 0.18 });
  const trim = useSmoothMaterial(p.accent, { emissive: 1.2 });
  const glass = useSmoothMaterial(p.hot, { emissive: 0.9, opacity: 0.35 });
  const blades = useRef<THREE.Group>(null);
  const cam = useRef<THREE.Group>(null);
  const flare = useRef<THREE.Group>(null);
  const cone = useRef<THREE.Mesh>(null);
  const radial = seg(tier, 24, 12);
  const bladeCount = 6;

  /* The light cone is a single open cylinder with vertex colours running
     magenta (base) to cyan (tip) — a gradient without a texture or a
     second mesh. */
  const coneGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.9, 0.32, 2.4, seg(tier, 18, 10), 1, true);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const a = new THREE.Color(p.accent);
    const b = new THREE.Color(p.hot);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      c.copy(b).lerp(a, (y + 1.2) / 2.4);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [tier, p.accent, p.hot]);

  const coneMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const iris = pingPong(t, 4.0); // 0 closed -> 1 open
    // Glint fires only in the top slice of the aperture's travel.
    const glint = iris > 0.92 ? (iris - 0.92) / 0.08 : 0;

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
    if (cone.current) {
      cone.current.scale.set(0.7 + iris * 0.45, 1, 0.7 + iris * 0.45);
      coneMat.opacity = 0.12 + iris * 0.2 + glint * 0.3;
    }
    if (flare.current) {
      flare.current.scale.setScalar(0.001 + glint * 1.3);
      flare.current.rotation.z = t * 0.8;
    }
  });

  return (
    <group ref={cam}>
      {/* upward light cone — the poster's signature */}
      <mesh ref={cone} geometry={coneGeo} material={coneMat} position={[0, 1.35, 0.55]} />

      <mesh material={shell}>
        <boxGeometry args={[1.7, 1.0, 0.8]} />
      </mesh>
      <mesh position={[0.35, 0.62, 0]} material={shell}>
        <boxGeometry args={[0.55, 0.28, 0.5]} />
      </mesh>
      <mesh position={[-0.55, 0.58, 0]} material={trim}>
        <cylinderGeometry args={[0.09, 0.09, 0.14, 12]} />
      </mesh>

      <mesh position={[0, -0.02, 0.55]} rotation={[Math.PI / 2, 0, 0]} material={shell}>
        <cylinderGeometry args={[0.46, 0.5, 0.5, radial]} />
      </mesh>
      <mesh position={[0, -0.02, 0.78]} rotation={[Math.PI / 2, 0, 0]} material={trim}>
        <torusGeometry args={[0.46, 0.05, 6, radial]} />
      </mesh>
      <mesh position={[0, -0.02, 0.8]} material={glass}>
        <circleGeometry args={[0.44, radial]} />
      </mesh>

      <group ref={blades} position={[0, -0.02, 0.82]}>
        {Array.from({ length: bladeCount }, (_, i) => (
          <mesh key={i} material={trim}>
            <boxGeometry args={[0.42, 0.06, 0.02]} />
          </mesh>
        ))}
      </group>

      {/* flare glint — a 4-point star, scaled from zero */}
      <group ref={flare} position={[0, -0.02, 0.88]} scale={0.001}>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation={[0, 0, r]}>
            <boxGeometry args={[1.1, 0.03, 0.01]} />
            <meshBasicMaterial
              color={p.hot}
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Quest to Cinema — golden clapperboard, muted purple/pink camera tones       */
/* The moment: the board opens slowly and snaps shut hard; on the snap a red   */
/* tally light kicks on and a film-grain flicker runs over the whole rig.      */
/* -------------------------------------------------------------------------- */
export function QuestToCinema({ tier, p }: SceneProps) {
  const board = useSmoothMaterial(p.base, { emissive: 0.3 });
  const gold = useSmoothMaterial(p.accent, { emissive: 1.1 });
  const slate = useSmoothMaterial(p.hot, { emissive: 0.5 });
  const clap = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const tally = useRef<THREE.Mesh>(null);

  const tallyMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ff2b2b'),
        transparent: true,
        opacity: 0.2,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const CYCLE = 3.2;
    const ph = (t % CYCLE) / CYCLE;
    // Open slowly, snap shut hard — cubic collapse on the last 30%.
    const angle = ph < 0.7 ? (ph / 0.7) * 0.62 : 0.62 * Math.pow(1 - (ph - 0.7) / 0.3, 3);
    if (clap.current) clap.current.rotation.z = angle;

    const snap = strike(t, CYCLE, 0.12);
    // Grain flicker: brightness jitters for a few frames after the snap.
    const grain = snap > 0.05 ? 0.75 + (Math.floor(t * 40) % 3) * 0.18 : 1;

    if (root.current) {
      root.current.rotation.y = -0.4 + Math.sin(t * 0.35) * 0.3;
      root.current.rotation.x = 0.12;
      root.current.scale.setScalar(1 + snap * 0.03);
    }
    board.emissiveIntensity = 0.3 * grain;
    gold.emissiveIntensity = 1.1 * grain;
    tallyMat.opacity = 0.2 + snap * 0.8;
    if (tally.current) tally.current.scale.setScalar(1 + snap * 0.5);
  });

  const stripes = seg(tier, 6, 4);

  return (
    <group ref={root} position={[0, -0.1, 0]}>
      <mesh material={board}>
        <boxGeometry args={[1.9, 1.3, 0.09]} />
      </mesh>
      {[0.35, 0, -0.35].map((y) => (
        <mesh key={y} position={[0, y, 0.05]} material={slate}>
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
            material={gold}
          >
            <boxGeometry args={[0.13, 0.3, 0.02]} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 0.68, 0]} material={gold}>
        <boxGeometry args={[1.9, 0.2, 0.09]} />
      </mesh>

      {/* red tally light */}
      <mesh ref={tally} position={[0.78, -0.5, 0.06]} material={tallyMat}>
        <sphereGeometry args={[0.08, 8, 6]} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Interface Quest — a floating game-menu panel                                */
/* Warm sunset gradient (pink to blue) behind abstracted colour UI rectangles, */
/* rather than a flat wireframe. The moment: a "window focus" highlight pulse  */
/* travels down the menu rows every few seconds, like a cursor selecting.      */
/* -------------------------------------------------------------------------- */
export function InterfaceQuest({ tier, p }: SceneProps) {
  const rows = seg(tier, 4, 3);
  const root = useRef<THREE.Group>(null);
  const rowGroup = useRef<THREE.Group>(null);
  const cursor = useRef<THREE.Mesh>(null);

  /* Sunset backing plate: vertex-coloured plane, pink at the bottom to blue
     at the top. One mesh, no texture, no second draw. */
  const panelGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.2, 1.5, 1, 1);
    const a = new THREE.Color(p.base);
    const b = new THREE.Color(p.accent);
    const colors = new Float32Array(g.attributes.position.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) {
      const y = g.attributes.position.getY(i);
      c.copy(a).lerp(b, (y + 0.75) / 1.5);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [p.base, p.accent]);

  const panelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0.55,
        roughness: 0.5,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const rowMats = useMemo(
    () =>
      Array.from({ length: rows }, () => {
        const c = new THREE.Color(p.hot);
        return new THREE.MeshStandardMaterial({
          color: c,
          emissive: c.clone(),
          emissiveIntensity: 0.6,
          roughness: 0.3,
        });
      }),
    [rows, p.hot],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.3) * 0.55;
      root.current.rotation.x = -0.12 + Math.sin(t * 0.22) * 0.1;
      root.current.position.y = Math.sin(t * 0.8) * 0.05;
    }

    // Selection travels down the rows, one row per 0.6s.
    const sel = Math.floor(t / 0.6) % rows;
    const within = strike(t, 0.6, 0.6);
    rowMats.forEach((m, i) => {
      m.emissiveIntensity = i === sel ? 0.6 + within * 2.2 : 0.45;
    });
    if (rowGroup.current) {
      rowGroup.current.children.forEach((r, i) => {
        r.scale.x = i === sel ? 1 + within * 0.08 : 1;
      });
    }
    if (cursor.current) {
      cursor.current.position.y = 0.28 - sel * 0.28;
      cursor.current.scale.setScalar(1 + within * 0.3);
    }
  });

  return (
    <group ref={root}>
      <mesh geometry={panelGeo} material={panelMat} />
      <mesh>
        <boxGeometry args={[2.24, 1.54, 0.02]} />
        <meshBasicMaterial color={p.hot} wireframe transparent opacity={0.45} />
      </mesh>

      {/* title bar */}
      <mesh position={[0, 0.62, 0.04]}>
        <boxGeometry args={[2.2, 0.16, 0.02]} />
        <meshStandardMaterial color={p.hot} emissive={p.hot} emissiveIntensity={1.0} roughness={0.3} />
      </mesh>
      {[-0.95, -0.83, -0.71].map((x) => (
        <mesh key={x} position={[x, 0.62, 0.06]}>
          <circleGeometry args={[0.035, 8]} />
          <meshBasicMaterial color={p.base} />
        </mesh>
      ))}

      {/* menu rows */}
      <group ref={rowGroup}>
        {Array.from({ length: rows }, (_, i) => (
          <mesh key={i} position={[-0.25, 0.28 - i * 0.28, 0.04]} material={rowMats[i]}>
            <boxGeometry args={[1.5 - (i % 2) * 0.4, 0.09, 0.01]} />
          </mesh>
        ))}
      </group>

      {/* sidebar */}
      <mesh position={[-0.88, -0.08, 0.04]}>
        <boxGeometry args={[0.34, 1.1, 0.02]} />
        <meshStandardMaterial color={p.accent} emissive={p.accent} emissiveIntensity={0.8} roughness={0.3} />
      </mesh>

      {/* selection cursor */}
      <mesh ref={cursor} position={[0.72, 0.28, 0.08]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.07, 0.2, 3]} />
        <meshStandardMaterial color={p.hot} emissive={p.hot} emissiveIntensity={1.4} roughness={0.2} />
      </mesh>
    </group>
  );
}
