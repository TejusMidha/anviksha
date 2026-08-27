/**
 * Sponsors / partners.
 *
 * Fully built and styled, and renders nothing while SPONSORS is empty — see
 * lib/content.ts. Turning it on is a data change, not a build: add entries
 * and the tiers that have members appear, in SPONSOR_TIERS order.
 *
 * Logos are inline SVG strings, not files. The site ships zero external
 * assets, so a partner logo is pasted into the data as <svg> source; a
 * sponsor with no logo falls back to its name set in the era's display type,
 * which reads fine in a logo grid.
 */

import { SPONSORS, SPONSOR_TIERS, type Sponsor } from '@/lib/content';
import EraBackdrop from './era/EraBackdrop';

/** Bigger tiles for bigger tiers. */
const TIER_SCALE: Record<Sponsor['tier'], string> = {
  title: 'sm:col-span-2 lg:col-span-2 min-h-[150px]',
  gold: 'min-h-[130px]',
  silver: 'min-h-[110px]',
  media: 'min-h-[100px]',
};

function Tile({ sponsor }: { sponsor: Sponsor }) {
  const inner = sponsor.logo ? (
    <span
      className="flex max-h-20 w-full items-center justify-center [&>svg]:h-auto [&>svg]:max-h-20 [&>svg]:w-auto [&>svg]:max-w-full"
      // Logos come from lib/content.ts, which is first-party source, not user
      // input — there is no untrusted path into this string.
      dangerouslySetInnerHTML={{ __html: sponsor.logo }}
    />
  ) : (
    <span className="px-4 text-center font-pixel text-[10px] leading-[1.7] text-white/80">
      {sponsor.name}
    </span>
  );

  const classes = `era-surface flex items-center justify-center p-6 grayscale
                   transition-all duration-300 hover:grayscale-0
                   hover:border-[color:var(--era-color)] ${TIER_SCALE[sponsor.tier]}`;

  if (!sponsor.url) {
    return (
      <div className={classes} title={sponsor.name}>
        {inner}
      </div>
    );
  }

  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={sponsor.name}
      className={`focus-era ${classes}`}
    >
      {inner}
    </a>
  );
}

export default function Sponsors() {
  // NEEDS DATA — no partners supplied yet, so the section does not render.
  if (!SPONSORS.length) return null;

  return (
    <section id="sponsors" className="era-4 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <EraBackdrop era={4} />

      <div className="relative">
        <header className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            07 / Partners
          </p>
          <h2 className="mt-3 font-pixel text-lg leading-[1.6] text-white sm:text-2xl">
            BACKED <span className="era-text">BY</span>
          </h2>
        </header>

        <div className="space-y-12">
          {SPONSOR_TIERS.map((tier) => {
            const members = SPONSORS.filter((s) => s.tier === tier.key);
            if (!members.length) return null;

            return (
              <div key={tier.key}>
                <div className="mb-5 flex items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                    {tier.label}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {members.map((s) => (
                    <Tile key={s.name} sponsor={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
