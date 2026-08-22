'use client';

import { Canvas } from '@react-three/fiber';
import type { SceneKey } from '@/lib/content';
import { SCENES } from './scenes';
import { Rig } from './scenes/shared';

export interface EventCanvasProps {
  scene: SceneKey;
  /** Render loop runs only when true (in viewport AND holding a render slot). */
  active: boolean;
  reduced: boolean;
  tier: 'low' | 'high';
}

export default function EventCanvas({ scene, active, reduced, tier }: EventCanvasProps) {
  const { Component, era, dist, y = 0 } = SCENES[scene];

  return (
    <Canvas
      // Hard cap at 2x — retina phones otherwise render 3x and melt.
      dpr={[1, 2]}
      // 'demand' parks the loop entirely: an off-screen card costs nothing.
      frameloop={active && !reduced ? 'always' : 'demand'}
      camera={{ position: [0, y, dist], fov: 42 }}
      gl={{
        antialias: tier === 'high',
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ pointerEvents: 'none' }}
    >
      <Rig era={era} />
      <Component tier={tier} />
    </Canvas>
  );
}
