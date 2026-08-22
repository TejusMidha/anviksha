import { COORDINATORS } from '@/lib/content';

export default function Coordinators() {
  const groups = Array.from(new Set(COORDINATORS.map((c) => c.group)));

  return (
    <section id="team" className="era-4 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <header className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
          04 / Credits
        </p>
        <h2 className="mt-3 font-pixel text-xl leading-[1.5] text-white sm:text-2xl">
          THE <span className="text-holo">CREW</span>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Every fest ends with a credits roll. This one starts with it.
        </p>
      </header>

      {groups.map((group) => (
        <div key={group} className="mb-12">
          <div className="mb-5 flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-holo/80">
              {group}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-holo/30 to-transparent" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COORDINATORS.filter((c) => c.group === group).map((c, i) => (
              <div key={`${c.role}-${i}`} className="era-surface flex items-center gap-4 p-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center font-pixel text-[9px] text-holo"
                  style={{
                    borderRadius: 'var(--era-radius)',
                    background: 'color-mix(in srgb, var(--era-color) 14%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--era-color) 30%, transparent)',
                  }}
                >
                  {c.name === 'TBD'
                    ? '??'
                    : c.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white/90">{c.name}</div>
                  <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {c.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber/70">
        ⚠ placeholder crew — replace COORDINATORS in lib/content.ts with the proposal list
      </p>
    </section>
  );
}
