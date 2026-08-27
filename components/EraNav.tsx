'use client';

import { useEffect, useState } from 'react';
import { ERAS } from '@/lib/content';

export default function EraNav() {
  const [active, setActive] = useState(ERAS[0].id);

  useEffect(() => {
    const sections = ERAS.map((e) => document.getElementById(`era-${e.id}`)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) setActive(Number(top.target.id.replace('era-', '')) as (typeof ERAS)[number]['id']);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.01, 0.25, 0.6] },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="sticky top-[52px] z-30 -mx-4 mb-14 bg-void/70 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="rail flex gap-2 overflow-x-auto pb-1">
        {ERAS.map((era) => {
          const isActive = era.id === active;
          return (
            <a
              key={era.id}
              href={`#era-${era.id}`}
              className="focus-era group flex min-h-[44px] shrink-0 items-center gap-3 border px-4 py-2 transition-all duration-300"
              style={{
                borderColor: isActive ? era.accent : 'rgba(255,255,255,0.08)',
                background: isActive ? `${era.accent}14` : 'transparent',
                borderRadius: `${(era.id - 1) * 5}px`,
                boxShadow: isActive ? `0 0 ${era.id * 6}px ${era.accent}44` : 'none',
              }}
            >
              <span
                className="font-pixel text-[8px] leading-none"
                style={{ color: isActive ? era.accent : 'rgba(255,255,255,0.4)' }}
              >
                {era.label}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                {era.headline}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
