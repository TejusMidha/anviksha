import { ALL_EVENTS, ERAS, FEST } from '@/lib/content';

const STATS = [
  { k: 'DATE', v: FEST.dateShort },
  { k: 'VENUE', v: 'STME NMIMS' },
  { k: 'EVENTS', v: String(ALL_EVENTS.length) },
  { k: 'TRACKS', v: String(ERAS.length) },
];

export default function About() {
  return (
    <section id="about" className="era-2 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            01 / The Brief
          </p>
          <h2 className="mt-3 font-pixel text-xl leading-[1.55] text-white sm:text-2xl">
            FROM ONE SCREEN
            <br />
            <span className="text-arcade">TO WORLDS THAT WRITE THEMSELVES</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">{FEST.brief}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/55">
            {FEST.theme} is the compass for the day: every track is a checkpoint on the same voyage,
            from raw logic under hard constraints to systems that generate their own worlds. The
            page you are reading evolves with it — the further you scroll, the softer, brighter and
            more synthetic everything becomes.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.k} className="era-surface px-4 py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {s.k}
                </div>
                <div className="era-text mt-2 font-pixel text-[11px] leading-none">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="era-surface relative overflow-hidden p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-arcade">
            TRACK MANIFEST
          </div>
          <ul className="mt-5 divide-y divide-white/5">
            {ERAS.map((era) => (
              <li key={era.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0"
                    style={{
                      background: era.accent,
                      borderRadius: `${(era.id - 1) * 2.5}px`,
                      boxShadow: `0 0 ${era.id * 4}px ${era.accent}`,
                    }}
                  />
                  <div>
                    <div className="font-pixel text-[9px] leading-[1.6] text-white/90">
                      {era.headline}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                      {era.category}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/35">{era.years}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
