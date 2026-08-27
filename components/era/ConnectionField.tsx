'use client';

/**
 * ERA 3 — networked play. Nodes drifting on a 2D canvas, linked whenever two
 * come within range.
 *
 * Deliberately 2D: the WebGL budget is spent on the per-event scenes and the
 * hero field, and a browser only allows ~16 live WebGL contexts. A 2D context
 * does not count against that ceiling at all, and this costs a few hundred
 * lineTo calls per frame — an order of magnitude under a shader pass.
 *
 * Runs only while on screen, and paints a single static frame under
 * prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react';
import { useInViewport, usePrefersReducedMotion, useDeviceTier } from '@/lib/hooks';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function ConnectionField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInViewport(wrapRef, { rootMargin: '120px', threshold: 0 });
  const reduced = usePrefersReducedMotion();
  const tier = useDeviceTier();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Same dpr discipline as the WebGL canvases: never above 2.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = tier === 'low' ? 16 : 30;
    const linkDist = tier === 'low' ? 130 : 165;

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];

    const seedNodes = () => {
      let s = 90210;
      const rand = () => {
        s = (s * 16807) % 2147483647;
        return s / 2147483647;
      };
      nodes = Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        vx: (rand() - 0.5) * 0.22,
        vy: (rand() - 0.5) * 0.22,
      }));
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        // Wrap rather than bounce — bouncing makes the drift read as a
        // box of balls; wrapping reads as a network extending past the frame.
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > linkDist * linkDist) continue;
          const a = (1 - Math.sqrt(d2) / linkDist) * 0.3;
          ctx.strokeStyle = `rgba(139, 92, 255, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(177, 140, 255, 0.55)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    if (reduced || !inView) {
      draw();
      return () => ro.disconnect();
    }

    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduced, tier]);

  return (
    <div ref={wrapRef} aria-hidden className="era-backdrop">
      <div className="network-wash absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
