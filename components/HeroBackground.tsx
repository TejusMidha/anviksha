'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { usePrefersReducedMotion, useDeviceTier } from '@/lib/hooks';

// ssr:false keeps three.js entirely out of the server bundle and out of the
// initial JS payload — it streams in after first paint.
const HeroField = dynamic(() => import('@/components/three/HeroField'), {
  ssr: false,
  loading: () => null,
});

export default function HeroBackground() {
  const reduced = usePrefersReducedMotion();
  const tier = useDeviceTier();

  // Page-wide scroll progress. Written into a ref rather than React state so
  // the r3f scene reads it inside useFrame without re-rendering the tree.
  const progress = useRef(0);
  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progress.current = v;
  });

  // The field stays live for the whole page but recedes behind the content.
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.75, 1], [1, 0.6, 0.5, 0.66]);

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <HeroField progress={progress} reduced={reduced} tier={tier} />
    </motion.div>
  );
}
