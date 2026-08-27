/**
 * Intercepting route: a client-side navigation to /events/[slug] from anywhere
 * on the site renders this INSTEAD of the standalone page, so the event opens
 * as a modal over whatever the user was looking at.
 *
 * A hard load of the same URL (refresh, pasted link, new tab) does not hit the
 * interceptor — it renders app/events/[slug]/page.tsx, the full page. Same
 * body component either way; see components/EventDetail.tsx.
 */

import { notFound } from 'next/navigation';
import { eraForEvent, eventBySlug } from '@/lib/content';
import EventModal from '@/components/EventModal';

export default function InterceptedEventPage({ params }: { params: { slug: string } }) {
  const event = eventBySlug(params.slug);
  const era = eraForEvent(params.slug);
  if (!event || !era) notFound();

  return <EventModal event={event} era={era} />;
}
