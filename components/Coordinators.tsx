/**
 * Credits.
 *
 * NAME-ONLY CARDS ON PURPOSE. No photos have been supplied for anyone, so
 * there is no avatar slot to leave empty and no initials disc standing in for
 * a missing headshot — the department heading above the grid carries the role,
 * so a card needs nothing but the name.
 *
 * Renders nothing at all while COORDINATORS is empty, and each group appears
 * only once it has real members — so the faculty block stays absent until
 * faculty names are supplied. See lib/content.ts.
 */

import { COORDINATORS } from '@/lib/content';
import EraBackdrop from './era/EraBackdrop';

export default function Coordinators() {
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
          <h2 className="section-title mt-3 font-pixel text-lg leading-[1.6] sm:text-2xl">
            THE CREW
          </h2>
          <p className="mt-4 max-w-2xl text-white/60">
            Every fest ends with a credits roll. This one starts with it.
          </p>
        </header>

        {groups.map((group) => (
          <div key={group} className="mb-12">
            <div className="mb-5 flex items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-holo/85">
                {group}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-[color:var(--chrome)] to-transparent" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {COORDINATORS.filter((c) => c.group === group).map((c, i) => (
                <div
                  key={`${group}-${c.name}-${i}`}
                  className="era-surface flex items-center gap-3 px-4 py-4"
                >
                  {/* A short era-tinted rule stands in for the avatar column so
                      the rows still align — it is chrome, not a placeholder
                      for a photo that is coming. */}
                  <span
                    aria-hidden
                    className="h-6 w-[3px] shrink-0 rounded-full"
                    style={{ background: 'var(--era-color)' }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white/90">{c.name}</div>
                    {c.contact && (
                      <a
                        href={c.contact.includes('@') ? `mailto:${c.contact}` : `tel:${c.contact}`}
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
