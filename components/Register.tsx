import { FEST } from '@/lib/content';
import EraBackdrop from './era/EraBackdrop';
import { FooterSocials } from './Socials';
import { CalendarIcon, ExternalIcon, PinIcon } from './Icons';

export default function Register() {
  return (
    <section id="register" className="era-5 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <EraBackdrop era={5} />

      <div className="era-surface relative overflow-hidden px-6 py-16 text-center sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 60% at 50% 0%, rgba(76,224,255,0.16) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-holo/80">
            09 / Registration
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl font-pixel text-base leading-[1.7] text-white sm:text-2xl">
            THE NEXT ERA NEEDS
            <br />
            <span className="brochure-title">PLAYERS</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-white/65">
            Registration runs through Unstop. This button opens the fest-wide listing with every
            event in one place — or open a single event to register for it directly. Pick as many
            as your schedule allows.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={FEST.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-amber focus-era tap-target gap-2 px-8 py-4 font-pixel text-[10px] leading-none transition-transform hover:scale-[1.03]"
            >
              REGISTER NOW
              <ExternalIcon size={13} />
            </a>
            <a
              href={FEST.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-amber-ghost focus-era tap-target gap-2 px-8 py-4 font-pixel text-[10px] leading-none"
            >
              EVENT BROCHURES &amp; RULES
              <ExternalIcon size={13} />
            </a>
            {/* No fest inbox exists, so this jumps to the footer's phone and
                Instagram block rather than opening a mail client. */}
            <a
              href="#contact"
              className="focus-era tap-target border border-holo/40 px-8 py-4 font-pixel text-[10px] leading-none text-holo transition-colors hover:bg-holo/10"
              style={{ borderRadius: 'var(--era-radius)' }}
            >
              CONTACT US
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
            <span className="era-chip inline-flex items-center gap-2 px-3 py-2">
              <CalendarIcon size={14} />
              {FEST.date}
            </span>
            <span className="era-chip inline-flex items-center gap-2 px-3 py-2">
              <PinIcon size={14} />
              {FEST.venue}
            </span>
          </div>

          <div className="mt-8 flex justify-center">
            <FooterSocials />
          </div>
        </div>
      </div>
    </section>
  );
}
