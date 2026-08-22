import { ERAS } from '@/lib/content';
import EraNav from './EraNav';
import EventCard from './EventCard';

export default function EraStrip() {
  return (
    <section id="eras" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <header className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
          02 / The Evolution Strip
        </p>
        <h2 className="mt-3 font-pixel text-xl leading-[1.5] text-white sm:text-2xl">
          FIVE ERAS
          <span className="text-holo">.</span> TWENTY-ONE EVENTS
          <span className="text-holo">.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Scroll a track sideways to browse its events. Each object is generated in the browser from
          plain geometry — no models, no textures, nothing to download.
        </p>
      </header>

      <EraNav />

      <div className="space-y-24">
        {ERAS.map((era) => (
          <div key={era.id} id={`era-${era.id}`} className={`era-${era.id} scroll-mt-32`}>
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
                <h3 className="era-text mt-4 font-pixel text-lg leading-[1.5] sm:text-xl">
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

            <div
              className="rail -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0"
            >
              {era.events.map((event) => (
                <EventCard key={event.id} event={event} eraId={era.id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
