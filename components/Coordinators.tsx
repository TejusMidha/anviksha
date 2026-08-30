/**
 * The committee.
 *
 * Rebuilt around COMMITTEES in lib/content.ts: a per-person record (photo +
 * LinkedIn) joined to a membership list, so the three people who sit on two
 * committees each — Reetpal Kaur, Devanshu Juneja, Gauri Dhiman — render in
 * both places from one record and can never drift apart.
 *
 * GRACEFUL DEGRADATION IS BUILT IN BUT NOT CURRENTLY VISIBLE. All 38 members
 * have a photo and a LinkedIn URL today, so no card falls back. The fallbacks
 * exist so the next roster edit is a data change and nothing here has to move:
 *   - no photo    -> an initials disc in the era colour, same size and shape
 *                    as the photo, so the grid does not reflow
 *   - no LinkedIn -> the card renders as a plain <div>, not a dead <a>
 *
 * Photos are lazy by default (next/image) and requested at the size actually
 * painted — `sizes` is a fixed pixel value because the avatar is a fixed
 * square, so the browser never downloads a 1080x1920 portrait to fill 64px.
 *
 * Renders nothing at all while COMMITTEES is empty.
 */

import Image from 'next/image';
import { COMMITTEES, initials, teamPhotoSrc, type TeamMember } from '@/lib/content';
import EraBackdrop from './era/EraBackdrop';
import { LinkedInIcon } from './Icons';

function Avatar({ member }: { member: TeamMember }) {
  const src = teamPhotoSrc(member);

  return (
    <span
      className="relative block h-14 w-14 shrink-0 overflow-hidden border border-[color:var(--chrome-line)] bg-void/70 sm:h-16 sm:w-16"
      style={{ borderRadius: 'calc(var(--era-radius) * 0.7 + 4px)' }}
    >
      {src ? (
        <Image
          src={src}
          // The name is already read out by the card's link text, so the photo
          // is decorative for a screen reader and takes an empty alt.
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="era-text flex h-full w-full items-center justify-center font-pixel text-[11px]"
        >
          {initials(member.name)}
        </span>
      )}
    </span>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const body = (
    <>
      <Avatar member={member} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white/90 group-hover:text-white">
          {member.name}
        </span>
        {member.linkedin && (
          <span className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition-colors group-hover:text-holo">
            <LinkedInIcon size={12} />
            LinkedIn
          </span>
        )}
      </span>
    </>
  );

  const shared = 'era-surface flex items-center gap-3.5 px-4 py-3.5';

  if (!member.linkedin) {
    return <div className={shared}>{body}</div>;
  }

  return (
    <a
      href={member.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${member.name} on LinkedIn`}
      className={`${shared} focus-era group transition-colors hover:border-[color:var(--era-color)]`}
    >
      {body}
    </a>
  );
}

export default function Coordinators() {
  if (!COMMITTEES.length) return null;

  return (
    <section id="team" className="era-4 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <EraBackdrop era={4} />

      <div className="relative">
        <header className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            08 / Credits
          </p>
          <h2 className="section-title mt-3 font-pixel text-lg leading-[1.6] sm:text-2xl">
            THE CREW
          </h2>
          <p className="mt-4 max-w-2xl text-white/60">
            Every fest ends with a credits roll. This one starts with it. Every name below links
            to that person&apos;s LinkedIn.
          </p>
        </header>

        {COMMITTEES.map((committee) => (
          <div key={committee.name} className="mb-12">
            <div className="mb-5 flex items-center gap-4">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-holo/85">
                {committee.name}
              </h3>
              <span className="h-px flex-1 bg-gradient-to-r from-[color:var(--chrome)] to-transparent" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {committee.members.map((member) => (
                <MemberCard key={`${committee.name}-${member.name}`} member={member} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
