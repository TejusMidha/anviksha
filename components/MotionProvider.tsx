'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * `reducedMotion="user"` makes every framer-motion animation on the page honour
 * prefers-reduced-motion without each component checking it individually.
 * Children stay server-rendered — they are passed through as props.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
