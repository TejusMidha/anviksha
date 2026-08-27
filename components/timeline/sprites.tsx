/**
 * Original pixel art for the timeline.
 *
 * IP NOTE — read before editing. The brochure's timeline page uses Nintendo
 * sprites and its Technical divider uses Bandai Namco sprites. Nothing in this
 * file reproduces either. What is borrowed is the REGISTER only: 16-bit
 * platformer, chunky pixel grid, thick outline, bright flat colour.
 *
 * The character is "the Voyager" — a helmeted explorer with a visor, a back
 * canister and a short tabard. No cap, no moustache, no dungarees, no white
 * gloves, and an unrelated palette (teal/amber/cyan). The creature is a
 * "bit-mite" — a floating cube-body with a single scanning eye and two
 * antennae. Neither has a counterpart in any existing game.
 *
 * Each pose is a character grid; one <rect> per filled cell. At 12x14 that is
 * ~70 rects, which the browser rasterises once and then only transforms.
 */

const INK: Record<string, string> = {
  '.': 'transparent',
  k: '#10131c', // outline
  h: '#2fd3c4', // helmet shell (teal)
  v: '#7ff0ff', // visor (cyan)
  s: '#ffb42e', // suit (amber)
  t: '#c9502e', // tabard / boots (brick)
  c: '#e8eef7', // canister highlight
  e: '#ff4f9a', // creature body
  y: '#fff3c4', // creature eye
};

/* 12 wide x 14 tall. Read them as pictures — that is the point of the format. */

const IDLE = [
  '....kkkk....',
  '...khhhhk...',
  '..khvvvvhk..',
  '..khvvvvhk..',
  '..kkhhhhkk..',
  '...ksssck...',
  '..kcssssck..',
  '..ktssssttk.',
  '..ktssssttk.',
  '...ksssssk..',
  '....kssk....',
  '...kttkttk..',
  '...kttkkttk.',
  '...kkk.kkk..',
];

const WALK = [
  '....kkkk....',
  '...khhhhk...',
  '..khvvvvhk..',
  '..khvvvvhk..',
  '..kkhhhhkk..',
  '...ksssck...',
  '..kcssssck..',
  '.ktssssttk..',
  '.ktssssttk..',
  '...ksssssk..',
  '....kssk....',
  '..kttk.kttk.',
  '.kttk...kttk',
  '.kkk.....kkk',
];

const LAND = [
  '............',
  '....kkkk....',
  '...khhhhk...',
  '..khvvvvhk..',
  '..kkhhhhkk..',
  '..kcssssck..',
  '.ktsssssstk.',
  '.ktsssssstk.',
  '..ksssssssk.',
  '..kssssssk..',
  '.kttk..kttk.',
  '.kttk..kttk.',
  'kkk......kkk',
  '............',
];

export type Pose = 'idle' | 'walk' | 'land';

const POSES: Record<Pose, string[]> = { idle: IDLE, walk: WALK, land: LAND };

const CELL = 4;

function Grid({ rows, cell = CELL }: { rows: string[]; cell?: number }) {
  const out: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    // Run-length merge: consecutive same-colour cells become one <rect>,
    // which roughly halves the node count on these sprites.
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      if (ch !== '.' && INK[ch]) {
        out.push(
          <rect
            key={`${x}-${y}`}
            x={x * cell}
            y={y * cell}
            width={run * cell}
            height={cell}
            fill={INK[ch]}
          />,
        );
      }
      x += run;
    }
  });
  return <>{out}</>;
}

/** The Voyager — original character, see the IP note above. */
export function VoyagerSprite({ pose = 'idle', size = 56 }: { pose?: Pose; size?: number }) {
  const rows = POSES[pose];
  return (
    <svg
      width={size}
      height={size * (14 / 12)}
      viewBox={`0 0 ${12 * CELL} ${14 * CELL}`}
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      <Grid rows={rows} />
    </svg>
  );
}

/* Bit-mite: original creature. Cube body, one scanning eye, two antennae. */
const MITE = [
  '.k......k.',
  '.k.kkkk.k.',
  '.kkeeeekk.',
  'kkeeeeeekk',
  'keeyyyyeek',
  'keeyyyyeek',
  'kkeeeeeekk',
  '.kkeeeekk.',
  '..k.kk.k..',
  '...k..k...',
];

export function BitMiteSprite({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${10 * CELL} ${10 * CELL}`}
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      <Grid rows={MITE} />
    </svg>
  );
}
