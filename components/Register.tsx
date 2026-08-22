import { CONTACT, FEST } from '@/lib/content';

export default function Register() {
  return (
    <section id="register" className="era-5 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
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
            05 / Registration
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl font-pixel text-lg leading-[1.6] text-white sm:text-2xl">
            THE NEXT ERA NEEDS
            <br />
            <span className="text-holo [text-shadow:0_0_30px_rgba(76,224,255,0.5)]">PLAYERS</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-white/65">
            Registrations open on campus and online. One pass, every track — pick your events on the
            day, or lock them in early.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={FEST.registerUrl}
              className="cta-amber px-8 py-4 font-pixel text-[10px] leading-none transition-transform hover:scale-[1.03]"
            >
              REGISTER NOW
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="border border-holo/40 px-8 py-4 font-pixel text-[10px] leading-none text-holo transition-colors hover:bg-holo/10"
              style={{ borderRadius: 'var(--era-radius)' }}
            >
              CONTACT US
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
            <span className="era-chip px-3 py-2">{FEST.date}</span>
            <span className="era-chip px-3 py-2">{FEST.venue}</span>
            <span className="era-chip px-3 py-2">{CONTACT.instagram}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
