import { CONTACT, FEST } from '@/lib/content';
import { FooterSocials } from './Socials';

export default function Footer() {
  return (
    <footer className="era-5 relative border-t border-white/10 bg-void/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-pixel text-xs text-phosphor">ANVIKSHA</span>
            <span className="font-pixel text-xs text-holo">&apos;26</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              / {FEST.subtitle}
            </span>
          </div>

          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
            {FEST.theme}
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/40">
            {FEST.themeSubtitle}
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
            Hosted by {FEST.institute}, {FEST.venue}.
          </p>

          <div className="mt-6">
            <FooterSocials />
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
            Navigate
          </div>
          <ul className="mt-4 space-y-1 text-sm text-white/60">
            {[
              ['/#about', 'About the fest'],
              ['/#eras', 'Events'],
              ['/#schedule', 'Schedule'],
              ['/#prizes', 'Prize pool'],
              ['/#faq', 'FAQ'],
              ['/#register', 'Register'],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="focus-era inline-flex min-h-[44px] items-center transition-colors hover:text-holo"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
            Contact
          </div>
          <ul className="mt-4 space-y-1 font-mono text-sm text-white/60">
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="focus-era inline-flex min-h-[44px] items-center transition-colors hover:text-holo"
              >
                {CONTACT.email}
              </a>
            </li>
            {/* Handle and phone render only once supplied — see CONTACT in
                lib/content.ts. No invented placeholders ship. */}
            {CONTACT.instagramHandle && <li className="flex min-h-[44px] items-center">{CONTACT.instagramHandle}</li>}
            {CONTACT.phone && (
              <li>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="focus-era inline-flex min-h-[44px] items-center transition-colors hover:text-holo"
                >
                  {CONTACT.phone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-5 sm:px-6">
        <p className="mx-auto max-w-7xl font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          © {new Date().getFullYear()} ANVIKSHA · STME NMIMS Chandigarh · built with procedural
          geometry, zero downloaded assets
        </p>
      </div>
    </footer>
  );
}
