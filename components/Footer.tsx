import { CONTACT, FEST } from '@/lib/content';

export default function Footer() {
  return (
    <footer className="era-5 relative border-t border-white/10 bg-void/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-pixel text-xs text-phosphor">ANVIKSHA</span>
            <span className="font-pixel text-xs text-holo">&apos;26</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            {FEST.subtitle} — {FEST.motif}. Hosted by {FEST.institute}, {FEST.venue}.
          </p>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
            Navigate
          </div>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            {[
              ['#about', 'The Brief'],
              ['#eras', 'Events'],
              ['#schedule', 'Schedule'],
              ['#team', 'Credits'],
              ['#register', 'Register'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="transition-colors hover:text-holo">
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
          <ul className="mt-4 space-y-2 font-mono text-sm text-white/60">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-holo">
                {CONTACT.email}
              </a>
            </li>
            <li>{CONTACT.instagram}</li>
            <li>{CONTACT.phone}</li>
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
