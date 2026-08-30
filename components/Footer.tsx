/**
 * Footer.
 *
 * Two columns, not three: the "Navigate" link list was removed (the nav bar
 * and the era strip already carry every one of those destinations), so the
 * remaining brand and contact blocks share the row on a 1.15/1 split rather
 * than leaving a dead third column.
 *
 * Instagram is the only social ANVIKSHA runs, so it gets a full labelled
 * pill instead of one anonymous icon in a row of five — see FooterSocials.
 */

import { CONTACT, FEST, formatPhone } from '@/lib/content';
import { FooterSocials } from './Socials';
import { PoweredByUnstop } from './Brand';
import { ExternalIcon, PhoneIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="era-5 relative border-t border-[color:var(--chrome-line)] bg-void/80">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:gap-16">
        {/* --- Brand -------------------------------------------------------- */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-pixel text-xs text-holo">ANVIKSHA</span>
            <span className="font-pixel text-xs text-arcade">&apos;26</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              / {FEST.subtitle}
            </span>
          </div>

          <div className="mt-4">
            <PoweredByUnstop />
          </div>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">{FEST.theme}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/40">
            {FEST.themeSubtitle}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
            Hosted by {FEST.institute}, {FEST.venue}.
          </p>

          <div className="mt-7">
            <FooterSocials />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={FEST.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-amber focus-era tap-target gap-2 px-5 py-3 font-pixel text-[9px]
                         leading-none transition-transform hover:scale-[1.03]"
            >
              REGISTER NOW
              <ExternalIcon size={12} />
            </a>
            <a
              href={FEST.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-amber-ghost focus-era tap-target gap-2 px-5 py-3 font-pixel text-[9px]
                         leading-none"
            >
              BROCHURES &amp; RULES
              <ExternalIcon size={12} />
            </a>
          </div>
        </div>

        {/* --- Contact ------------------------------------------------------
            Phone and Instagram only. There is no fest email address, so none
            is printed — see CONTACT in lib/content.ts. */}
        <div id="contact" className="scroll-mt-24">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
            Contact
          </div>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
            Call any of the three coordinators below, or DM us on Instagram — that is the
            fastest route on the day itself.
          </p>

          {/* Phone contacts from the official contact card. `tel:` uses the
              raw E.164 string; the label is the spaced display form. */}
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            {CONTACT.people.map((p) => (
              <li key={p.phone}>
                <a
                  href={`tel:${p.phone}`}
                  className="era-surface focus-era flex min-h-[56px] items-center gap-3 px-4 py-2.5
                             transition-colors hover:border-[color:var(--era-color)]"
                >
                  <span className="era-text shrink-0">
                    <PhoneIcon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] leading-tight text-white/85">
                      {p.name}
                    </span>
                    <span className="block font-mono text-[11px] leading-tight text-white/50">
                      {formatPhone(p.phone)}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--chrome-line-soft)] px-4 py-5 sm:px-6">
        <p className="mx-auto max-w-7xl font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          © {new Date().getFullYear()} ANVIKSHA · STME NMIMS Chandigarh · Powered by{' '}
          {FEST.partner}
        </p>
      </div>
    </footer>
  );
}
