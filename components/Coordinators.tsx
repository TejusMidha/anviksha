/**
 * Credits.
 *
 * Renders nothing at all while COORDINATORS is empty, and each group appears
 * only once it has real members — so the faculty block stays absent until
 * faculty names are supplied rather than shipping a row of "??" cards.
 * See lib/content.ts.
 */

import { COORDINATORS } from '@/lib/content';
import EraBackdrop from './era/EraBackdrop';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Coordinators() {
  // NEEDS DATA — no coordinator list supplied yet.
  if (!COORDINATORS.length) return null;

  const groups = Array.from(new Set(COORDINATORS.map((c) => c.group)));

  return (
    <section id="team" className="era-4 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <EraBackdrop era={4} />

      <div className="relative">
        <header className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            08 / Credits
          </p>
          <h2 className="mt-3 font-pixel text-lg leading-[1.6] text-white sm:text-2xl">
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
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white/90">{c.name}</div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {c.role}
                    </div>
                    {c.contact && (
                      <a
                        href={
                          c.contact.includes('@') ? `mailto:${c.contact}` : `tel:${c.contact}`
                        }
                        className="focus-era mt-1 inline-block font-mono text-[10px] text-holo/70 hover:text-holo"
                      >
                        {c.contact}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
