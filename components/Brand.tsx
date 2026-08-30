/**
 * Brand marks, in one place.
 *
 * Three logos with three different jobs, and they are NOT interchangeable:
 *   - NMIMS lockup    the host institution. Wide horizontal (578x132), so it
 *                     is sized by height and never forced into a square.
 *   - Anviksha "A"    the fest brand. Square (512x512).
 *   - Unstop          the registration partner. Only ever appears as the
 *                     "Powered by" tag below, never on its own.
 *
 * All three are served from public/logos, which holds BUILT output only —
 * `npm run logos` regenerates them from Assets/Logos. The delivered Unstop
 * file is 4000x1592; nothing here should ever point at that.
 *
 * The NMIMS and Unstop artwork are both dark-on-light, so each sits on its own
 * light plate rather than directly on the near-black page. That is what the
 * NMIMS lockup already has baked in as a rounded pill, and `.brand-plate`
 * gives the Unstop mark the same treatment so the two read as a set.
 */

import Image from 'next/image';
import { FEST } from '@/lib/content';

export function NmimsLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/logos/nmims.png"
      alt="SVKM's NMIMS Chandigarh"
      width={578}
      height={132}
      priority
      className={className}
    />
  );
}

export function AnvikshaMark({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/logos/anviksha.png"
      alt={`${FEST.name} — ${FEST.subtitle}`}
      width={512}
      height={512}
      priority
      className={className}
    />
  );
}

/**
 * "Powered by Unstop" — the co-branding tag that accompanies every prominent
 * ANVIKSHA brand mention (nav, hero, footer, and the metadata strings in
 * app/layout.tsx).
 *
 * `size` scales the whole tag as a unit so the label can never end up larger
 * than the mark it labels:
 *   sm  the nav bar, where it competes with two CTAs
 *   md  the hero and footer, where it has room
 */
export function PoweredByUnstop({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  const label = size === 'sm' ? 'text-[7px] tracking-[0.18em]' : 'text-[9px] tracking-[0.22em]';
  const plate = size === 'sm' ? 'h-[15px] px-1.5' : 'h-[22px] px-2';
  const mark = size === 'sm' ? 'h-[9px]' : 'h-[13px]';

  return (
    <a
      href={FEST.partnerUnstopUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered by Unstop"
      className={`focus-era group inline-flex items-center gap-1.5 whitespace-nowrap ${className}`}
    >
      <span className={`font-mono uppercase text-white/40 transition-colors group-hover:text-white/70 ${label}`}>
        Powered by
      </span>
      <span className={`brand-plate inline-flex items-center rounded-sm ${plate}`}>
        <Image
          src="/logos/unstop.png"
          alt="Unstop"
          width={600}
          height={239}
          className={`w-auto ${mark}`}
        />
      </span>
    </a>
  );
}
