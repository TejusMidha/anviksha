/**
 * Social links, shared by the nav and the footer.
 *
 * A link whose href is still a marked placeholder ("#instagram-url-needed")
 * renders as a disabled chip rather than a live anchor, so nothing broken can
 * ship by accident — see `isPlaceholderHref` in lib/content.ts. Replace the
 * href and it becomes a real link with no other change.
 *
 * Every target is at least 44x44 (`tap-target`) — these are the smallest
 * things on the page and the most likely to be tapped on a phone.
 */

import { SOCIALS, isPlaceholderHref, type Social } from '@/lib/content';
import { SOCIAL_ICONS } from './Icons';

function SocialLink({ social, size }: { social: Social; size: number }) {
  const Icon = SOCIAL_ICONS[social.key];
  const pending = isPlaceholderHref(social.href);

  const shared =
    'tap-target focus-era rounded-md border border-white/10 text-white/55 transition-colors duration-200';

  if (pending) {
    return (
      <span
        className={`${shared} cursor-default opacity-40`}
        title={`${social.label} — URL not supplied yet`}
        aria-label={`${social.label} link coming soon`}
      >
        <Icon size={size} />
      </span>
    );
  }

  return (
    <a
      href={social.href}
      target={social.href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      aria-label={social.label}
      className={`${shared} hover:border-[color:var(--era-color)] hover:bg-[color-mix(in_srgb,var(--era-color)_12%,transparent)] hover:text-[color:var(--era-color)]`}
    >
      <Icon size={size} />
    </a>
  );
}

/** Nav variant: the primary handles only, so the bar stays uncluttered. */
export function NavSocials() {
  const shown = SOCIALS.filter((s) => s.primary);
  if (!shown.length) return null;

  return (
    <div className="flex items-center gap-1">
      {shown.map((s) => (
        <SocialLink key={s.key} social={s} size={17} />
      ))}
    </div>
  );
}

/** Footer variant: everything we have. */
export function FooterSocials() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {SOCIALS.map((s) => (
        <SocialLink key={s.key} social={s} size={19} />
      ))}
    </div>
  );
}
