import { FEST, SCHEDULE } from '@/lib/content';

const TRACK_COLOR: Record<string, string> = {
  ALL: '#e8ecf4',
  TECHNICAL: '#39ff6a',
  'E-SPORTS': '#ff2e7e',
  'NON-TECH': '#8b5cff',
  ROBOTICS: '#a78bff',
  MEDIA: '#7fd0ff',
  'NEXT-GEN': '#4ce0ff',
};

export default function Schedule() {
  return (
    <section id="schedule" className="era-1 relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
          03 / Run of Show
        </p>
        <h2 className="mt-3 font-pixel text-xl leading-[1.5] text-white sm:text-2xl">
          <span className="text-phosphor">SCHEDULE</span>.LOG
        </h2>
      </header>

      <div className="terminal overflow-hidden">
        {/* terminal chrome */}
        <div className="flex items-center gap-2 border-b border-phosphor/20 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-arcade/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-phosphor/70" />
          <span className="ml-3 font-mono text-[10px] text-phosphor/70">
            anviksha@stme:~$ cat schedule --date {FEST.dateShort}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-mono text-[12px]">
            <thead>
              <tr className="border-b border-phosphor/15 text-left">
                {['TIME', 'SLOT', 'VENUE', 'TRACK'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-normal uppercase tracking-[0.2em] text-phosphor/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((row, i) => (
                <tr
                  key={`${row.time}-${row.slot}`}
                  className="border-b border-white/5 transition-colors hover:bg-phosphor/[0.06]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-phosphor">{row.time}</td>
                  <td className="px-4 py-3 text-white/85">
                    <span className="mr-2 text-white/25">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {row.slot}
                  </td>
                  <td className="px-4 py-3 text-white/50">{row.venue}</td>
                  <td className="px-4 py-3">
                    <span
                      className="border px-2 py-1 text-[10px] tracking-[0.14em]"
                      style={{
                        color: TRACK_COLOR[row.track] ?? '#e8ecf4',
                        borderColor: `${TRACK_COLOR[row.track] ?? '#e8ecf4'}44`,
                      }}
                    >
                      {row.track}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-phosphor/15 px-4 py-3 font-mono text-[11px] text-phosphor/70">
          {SCHEDULE.length} entries · all timings IST
          <span className="animate-blink ml-1">_</span>
        </div>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-amber/70">
        ⚠ placeholder run-of-show — replace SCHEDULE in lib/content.ts with the proposal timings
      </p>
    </section>
  );
}
