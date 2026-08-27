import { ALL_EVENTS, ERAS, FEST } from '@/lib/content';
import EraNav from './EraNav';
import EraBackdrop from './era/EraBackdrop';
import EventCard from './EventCard';

export default function EraStrip() {
  return (
    <section id="eras" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <header className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
          02 / Events
        </p>
        <h2 className="mt-3 font-pixel text-lg leading-[1.6] text-white sm:text-2xl">
          {ERAS.length} TRACKS<span className="text-holo">.</span> {ALL_EVENTS.length} EVENTS
          <span className="text-holo">.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Each track is a leg of {FEST.theme.split(':')[0]} — and each is styled as one era of
          gaming, arcade to AI. Scroll a track sideways to browse it; open any event for rules,
          timings and registration.
        </p>
      </header>

      <EraNav />

      <div className="space-y-24">
        {ERAS.map((era) => (
          <div
            key={era.id}
            id={`era-${era.id}`}
            className={`era-${era.id} relative scroll-mt-32 rounded-[var(--era-radius)] px-3 py-8 sm:px-5`}
          >
            {/* Each era's own medium: scanlines, speed lines, network, parallax
                or holo gradient. All CSS or 2D canvas — no new WebGL layers. */}
            <EraBackdrop era={era.id} />

            <div className="relative">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="era-chip px-2.5 py-1 font-pixel text-[8px] leading-none">
                      {era.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {era.years}
                    </span>
                  </div>
                  <h3
                    className={`era-text mt-4 font-pixel text-base leading-[1.6] sm:text-xl ${
                      era.id === 1 ? 'crt-aberrate' : ''
                    }`}
                  >
                    {era.headline}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                    {era.description}
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                  {era.category} · {era.events.length}{' '}
                  {era.events.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Native horizontal scroll: touch, trackpad and keyboard all work
                  without JS. `touch-pan-x` keeps a vertical swipe scrolling the
                  page instead of being captured by the rail. */}
              <div
                className="rail -mx-3 flex touch-pan-x snap-x snap-mandatory gap-5
                           overflow-x-auto overscroll-x-contain px-3 pb-4 sm:mx-0 sm:px-0"
              >
                {era.events.map((event) => (
                  <EventCard key={event.id} event={event} eraId={era.id} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
