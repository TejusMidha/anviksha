'use client';

/**
 * FAQ accordion, era-3 styled (glass surfaces, gentle motion, connection
 * backdrop) to match the section it sits next to.
 *
 * Built on <details>/<summary>: open/close, keyboard operation and
 * find-in-page all work natively, and the answers are in the DOM for crawlers
 * even while collapsed. The chevron is the only JS-free-able bit we style.
 *
 * Answers still carrying a "[NEED: …]" bracket are UNCONFIRMED POLICY, not
 * copy — they render as a visibly flagged open question rather than an
 * invented answer. Fill them in and set `resolved: true`, or flip
 * SHOW_UNRESOLVED_FAQS to false to hide them until then.
 */

import { FAQS, SHOW_UNRESOLVED_FAQS, type Faq as FaqItem } from '@/lib/content';
import EraBackdrop from './era/EraBackdrop';
import { ChevronDownIcon } from './Icons';

const NEED_RE = /\[NEED:[^\]]*\]/g;

/** Splits an answer so the bracketed gaps can be styled apart from the copy. */
function renderAnswer(a: string) {
  const parts: (string | { need: string })[] = [];
  let last = 0;
  for (const m of a.matchAll(NEED_RE)) {
    if (m.index === undefined) continue;
    if (m.index > last) parts.push(a.slice(last, m.index));
    parts.push({ need: m[0] });
    last = m.index + m[0].length;
  }
  if (last < a.length) parts.push(a.slice(last));

  return parts.map((p, i) =>
    typeof p === 'string' ? (
      <span key={i}>{p}</span>
    ) : (
      <mark
        key={i}
        className="mx-0.5 rounded bg-amber/15 px-1.5 py-0.5 font-mono text-[11px] text-amber"
      >
        {p.need}
      </mark>
    ),
  );
}

function Item({ item, index }: { item: FaqItem; index: number }) {
  return (
    <details
      className="era-surface group overflow-hidden [&[open]_.chev]:rotate-180"
      name="anviksha-faq"
    >
      <summary
        className="focus-era flex cursor-pointer list-none items-center gap-4 px-5 py-4
                   marker:hidden [&::-webkit-details-marker]:hidden"
        style={{ minHeight: 56 }}
      >
        <span className="era-text shrink-0 font-mono text-[11px] tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-[15px] font-medium leading-snug text-white/90">
          {item.q}
        </span>
        <span className="chev tap-target -mr-3 shrink-0 text-white/40 transition-transform duration-300">
          <ChevronDownIcon size={18} />
        </span>
      </summary>

      <div className="border-t border-[color:var(--chrome-line-soft)] px-5 py-4 pl-[3.4rem]">
        <p className="text-sm leading-relaxed text-white/65">{renderAnswer(item.a)}</p>
      </div>
    </details>
  );
}

export default function Faq() {
  const items = SHOW_UNRESOLVED_FAQS ? FAQS : FAQS.filter((f) => f.resolved);
  if (!items.length) return null;

  return (
    <section id="faq" className="era-3 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <EraBackdrop era={3} />

      {/* Centred as a block: the header text is centred AND the accordion
          column is `mx-auto`, so the stack sits on the section's axis rather
          than hugging the left of a max-w-7xl row. The question/answer copy
          inside each item stays left-aligned — centred prose is unreadable,
          and only the block-level position needed changing. */}
      <div className="relative">
        <header className="mb-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            06 / Questions
          </p>
          <h2 className="section-title mt-3 font-pixel text-lg leading-[1.6] sm:text-2xl">
            BEFORE YOU REGISTER
          </h2>
        </header>

        <div className="mx-auto max-w-3xl space-y-3 text-left">
          {items.map((item, i) => (
            <Item key={item.q} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
