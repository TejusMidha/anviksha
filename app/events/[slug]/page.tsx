/**
 * Standalone event page — what a deep link, a hard refresh or a shared URL
 * renders. anviksha.xyz/events/capture-the-flag is a real page, not just a
 * modal state.
 *
 * Statically generated for all 21 events (generateStaticParams below), with
 * per-event metadata so a shared link previews as that event rather than the
 * site homepage.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ALL_EVENTS, FEST, eraForEvent, eventBySlug } from '@/lib/content';
import EventDetail from '@/components/EventDetail';
import EraBackdrop from '@/components/era/EraBackdrop';
import Footer from '@/components/Footer';
import Nav from '@/components/Nav';
import { ArrowLeftIcon } from '@/components/Icons';

export function generateStaticParams() {
  return ALL_EVENTS.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const event = eventBySlug(params.slug);
  const era = eraForEvent(params.slug);
  if (!event || !era) return { title: `Event not found — ${FEST.name}` };

  /* Bare event name: the root layout's title template appends
     " | ANVIKSHA '26", so including the fest name here too would render it
     twice. openGraph has no template, so it spells the full title out. */
  const description = `${event.tagline}. ${event.blurb} ${era.category} track · ${FEST.date} · ${FEST.venue}.`;

  return {
    title: event.name,
    description,
    openGraph: {
      title: `${event.name} — ${FEST.name}`,
      description,
      type: 'website',
    },
  };
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = eventBySlug(params.slug);
  const era = eraForEvent(params.slug);
  if (!event || !era) notFound();

  return (
    <>
      <Nav />
      <main className={`era-${era.id} relative min-h-[100svh] pt-20`}>
        <EraBackdrop era={era.id} />

        <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
          <Link
            href="/#eras"
            className="focus-era tap-target -ml-3 mb-4 inline-flex gap-2 font-mono text-[11px]
                       uppercase tracking-[0.18em] text-white/50 transition-colors
                       hover:text-[color:var(--era-color)]"
          >
            <ArrowLeftIcon size={15} />
            All events
          </Link>

          <div className="era-surface overflow-hidden">
            <EventDetail event={event} era={era} canvasHeight={340} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
