/**
 * Social links, shared by the nav and the footer.
 *
 * ANVIKSHA runs one social account, Instagram, so SOCIALS has one entry and
 * the footer variant is a full labelled pill (icon + handle) rather than one
 * anonymous 44px icon square in a row of five. Nothing about this file
 * assumes a single entry — add another and both variants keep working.
 *
 * A link whose href is still a marked placeholder ("#…-url-needed") renders
 * as a disabled chip rather than a live anchor, so nothing broken can ship by
 * accident — see `isPlaceholderHref` in lib/content.ts.
 *
 * Every target is at least 44x44 (`tap-target`).
 */

import { SOCIALS, isPlaceholderHref, type Social } from '@/lib/content';
import { SOCIAL_ICONS } from './Icons';

/** Compact icon-only square. Used in the nav bar. */
function SocialIconLink({ social, size }: { social: Social; size: number }) {
  const Icon = SOCIAL_ICONS[social.key];
  const pending = isPlaceholderHref(social.href);

  const shared =
    'tap-target focus-era rounded-md border border-[color:var(--chrome-line)] text-white/60 transition-colors duration-200';

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
      className={`${shared} hover:border-arcade hover:bg-arcade/10 hover:text-arcade`}
    >
      <Icon size={size} />
    </a>
  );
}

/** Roomy labelled pill. Used wherever the link has space to be the only one. */
function SocialPill({ social }: { social: Social }) {
  const Icon = SOCIAL_ICONS[social.key];
  const pending = isPlaceholderHref(social.href);

  const shared =
    'social-pill focus-era inline-flex min-h-[52px] items-center gap-3 rounded-full px-5 py-3';

  const inner = (
    <>
      <Icon size={20} />
      <span className="flex flex-col leading-tight">
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] opacity-60">
          {social.label}
        </span>
        <span className="text-[13px] font-medium">{social.handle ?? social.label}</span>
      </span>
    </>
  );

  if (pending) {
    return (
      <span
        className={`${shared} cursor-default opacity-40`}
        title={`${social.label} — URL not supplied yet`}
      >
        {inner}
      </span>
    );
  }

  return (
    <a
      href={social.href}
      target={social.href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      aria-label={`${social.label} — ${social.handle ?? social.label}`}
      className={shared}
    >
      {inner}
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
        <SocialIconLink key={s.key} social={s} size={17} />
      ))}
    </div>
  );
}

/** Footer / register variant: everything we have, given room. */
export function FooterSocials() {
  if (!SOCIALS.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {SOCIALS.map((s) => (
        <SocialPill key={s.key} social={s} />
      ))}
    </div>
  );
}
