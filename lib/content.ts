/**
 * Single source of truth for every piece of copy on the site.
 *
 * NOTE: `SCHEDULE` and `COORDINATORS` below are PLACEHOLDERS built to the
 * right shape — swap in the real rows from the ANVIKSHA proposal and every
 * component updates automatically. Nothing else needs to change.
 */

export type EraId = 1 | 2 | 3 | 4 | 5;

export type SceneKey =
  | 'captureTheFlag'
  | 'escapeTheServer'
  | 'bridgeWars'
  | 'algorithmAuction'
  | 'aiWhisperer'
  | 'techMinute'
  | 'techTunes'
  | 'parallelProtocol'
  | 'nexusNegotiator'
  | 'arrayPataHai'
  | 'secretSeekers'
  | 'valorant'
  | 'fifa'
  | 'mortalKombat'
  | 'tekken'
  | 'roboSoccer'
  | 'roboRace'
  | 'throughTheLens'
  | 'questToCinema'
  | 'interfaceQuest'
  | 'gameAthon';

export interface AnvikshaEvent {
  id: string;
  name: string;
  tagline: string;
  blurb: string;
  scene: SceneKey;
  format: string;
}

export interface Era {
  id: EraId;
  key: string;
  label: string;
  years: string;
  category: string;
  headline: string;
  description: string;
  accent: string;
  events: AnvikshaEvent[];
}

export const FEST = {
  name: "ANVIKSHA '26",
  subtitle: 'The Epoch',
  theme: 'Digital Voyage: Charting the Course of Innovation',
  motif: 'The Evolution of Gaming',
  date: '12 September 2026',
  dateShort: '12.09.2026',
  venue: 'STME, NMIMS Chandigarh',
  institute: 'School of Technology Management & Engineering',
  registerUrl: '#register',
  brief:
    'One day. Five eras. ANVIKSHA 26 traces the arc of play from the phosphor glow of the first arcade cabinet to worlds generated on the fly by machines — and asks what engineers build next.',
} as const;

export const ERAS: Era[] = [
  {
    id: 1,
    key: 'arcade',
    label: 'ERA 01',
    years: '1972 — 1985',
    category: 'Technical',
    headline: 'PHOSPHOR',
    description:
      'Blocky sprites, one screen, no save file. Pure logic under hard constraints — which is exactly what the technical track asks of you.',
    accent: '#39ff6a',
    events: [
      {
        id: 'capture-the-flag',
        name: 'Capture the Flag',
        tagline: 'Jeopardy-style security gauntlet',
        blurb:
          'Crack layered challenges across crypto, forensics and web exploitation. Every flag planted is points on the board.',
        scene: 'captureTheFlag',
        format: 'Teams of 3 · 120 min',
      },
      {
        id: 'escape-the-server',
        name: 'Escape the Server',
        tagline: 'Locked in a rack, ticking clock',
        blurb:
          'A chained set of systems puzzles — logs, ports, permissions. Solve the sequence before the vault seals for good.',
        scene: 'escapeTheServer',
        format: 'Teams of 4 · 60 min',
      },
      {
        id: 'bridge-wars',
        name: 'Bridge Wars',
        tagline: 'Load-bearing engineering under pressure',
        blurb:
          'Design, build and test a truss that survives the load run. Least material, most strength, wins.',
        scene: 'bridgeWars',
        format: 'Teams of 3 · 90 min',
      },
      {
        id: 'algorithm-auction',
        name: 'Algorithm Auction',
        tagline: 'Bid for the code you need',
        blurb:
          'Spend a virtual purse on algorithm fragments, then assemble them into the fastest working solution. Bad bids cost you complexity.',
        scene: 'algorithmAuction',
        format: 'Teams of 2 · 75 min',
      },
      {
        id: 'ai-whisperer',
        name: 'AI Whisperer',
        tagline: 'Prompt-craft as a competitive sport',
        blurb:
          'Given a target output, steer the model there in the fewest tokens. Precision beats verbosity every round.',
        scene: 'aiWhisperer',
        format: 'Solo · 45 min',
      },
      {
        id: 'tech-minute-to-win-it',
        name: 'Tech Minute to Win It',
        tagline: 'Sixty seconds per station',
        blurb:
          'Rapid-fire micro-challenges: debug it, wire it, name it, ship it. The clock is the only judge that matters.',
        scene: 'techMinute',
        format: 'Solo · rolling heats',
      },
    ],
  },
  {
    id: 2,
    key: 'cabinet',
    label: 'ERA 02',
    years: '1985 — 1998',
    category: 'E-Sports',
    headline: 'CABINET',
    description:
      'Neon cabinets, quarter-fed rivalries, the first crowds around a screen. The competitive instinct that built e-sports starts here.',
    accent: '#ff2e7e',
    events: [
      {
        id: 'valorant',
        name: 'Valorant',
        tagline: '5v5 tactical shooter',
        blurb: 'Standard competitive map pool, single-elimination bracket, BO1 until the semis.',
        scene: 'valorant',
        format: 'Teams of 5 · bracket',
      },
      {
        id: 'fifa',
        name: 'FIFA',
        tagline: 'One-on-one on the pitch',
        blurb: 'Six-minute halves, no custom squads, golden goal in the knockouts.',
        scene: 'fifa',
        format: 'Solo · bracket',
      },
      {
        id: 'mortal-kombat',
        name: 'Mortal Kombat',
        tagline: 'Best of three, no mercy',
        blurb: 'Blind character select, first to two rounds, winner stays on the stick.',
        scene: 'mortalKombat',
        format: 'Solo · bracket',
      },
      {
        id: 'tekken',
        name: 'Tekken',
        tagline: 'Frame-perfect punishment',
        blurb: 'Classic iron-fist rules. Punish the whiff, close the round, take the set.',
        scene: 'tekken',
        format: 'Solo · bracket',
      },
    ],
  },
  {
    id: 3,
    key: 'polygon',
    label: 'ERA 03',
    years: '1998 — 2007',
    category: 'Non-Technical',
    headline: 'POLYGON',
    description:
      'Games grew stories, soundtracks and side quests. So does the fest — the non-technical track is where personality outranks syntax.',
    accent: '#8b5cff',
    events: [
      {
        id: 'tech-tunes',
        name: 'Tech Tunes',
        tagline: 'Name that loading screen',
        blurb:
          'Audio rounds pulled from game scores, startup chimes and dial-up nostalgia. Buzz first, sing later.',
        scene: 'techTunes',
        format: 'Teams of 3 · 4 rounds',
      },
      {
        id: 'the-parallel-protocol',
        name: 'The Parallel Protocol',
        tagline: 'Two worlds, one answer',
        blurb:
          'Paired teams solve mirrored halves of the same puzzle without seeing each other’s board.',
        scene: 'parallelProtocol',
        format: 'Teams of 4 · 60 min',
      },
      {
        id: 'nexus-negotiator',
        name: 'Nexus Negotiator',
        tagline: 'Talk your way to the top',
        blurb:
          'A live negotiation ladder — alliances, trades and betrayals, scored on outcome and nerve.',
        scene: 'nexusNegotiator',
        format: 'Solo · 3 rounds',
      },
      {
        id: 'array-pata-hai',
        name: 'Array Pata Hai',
        tagline: 'Charades for the terminally online',
        blurb: 'Act out the concept, guess the term, keep the streak alive down the row.',
        scene: 'arrayPataHai',
        format: 'Teams of 4 · 30 min',
      },
      {
        id: 'secret-seekers',
        name: 'Secret Seekers',
        tagline: 'Campus-wide treasure hunt',
        blurb: 'Chained clues across STME. Every lock has a key hidden in the last riddle you solved.',
        scene: 'secretSeekers',
        format: 'Teams of 4 · 90 min',
      },
    ],
  },
  {
    id: 4,
    key: 'openworld',
    label: 'ERA 04',
    years: '2007 — 2018',
    category: 'Robotics · Media',
    headline: 'OPEN WORLD',
    description:
      'Physics engines, streamed worlds, capture pipelines. Hardware meets lens — machines that move and the crews that frame them.',
    accent: '#8b5cff',
    events: [
      {
        id: 'robo-soccer',
        name: 'Robo Soccer',
        tagline: 'Bots on the pitch',
        blurb: 'Wired or wireless bots, two halves, one ball. Traction and control beat raw torque.',
        scene: 'roboSoccer',
        format: 'Teams of 4 · bracket',
      },
      {
        id: 'robo-race',
        name: 'Robo Race',
        tagline: 'Obstacle sprint against the clock',
        blurb: 'Ramps, gravel, hairpins. Fastest clean run through the track takes the podium.',
        scene: 'roboRace',
        format: 'Teams of 4 · timed runs',
      },
      {
        id: 'through-the-lens',
        name: 'Sidequest — Through the Lens',
        tagline: 'Photography sidequest',
        blurb: 'A shot list drops at the start of the day. Fill it before the sun does, submit unedited.',
        scene: 'throughTheLens',
        format: 'Solo · all day',
      },
      {
        id: 'quest-to-cinema',
        name: 'Quest to Cinema',
        tagline: '60-second film challenge',
        blurb: 'Prompt, shoot, cut and screen within the day. Sound design counts.',
        scene: 'questToCinema',
        format: 'Teams of 3 · all day',
      },
      {
        id: 'interface-quest',
        name: 'Interface Quest',
        tagline: 'UI/UX design sprint',
        blurb: 'Take a broken flow and redesign it for a real constraint. Defend it in a two-minute crit.',
        scene: 'interfaceQuest',
        format: 'Solo or duo · 120 min',
      },
    ],
  },
  {
    id: 5,
    key: 'generated',
    label: 'ERA 05',
    years: '2018 — NOW',
    category: 'Next-Gen / AI',
    headline: 'GENERATED',
    description:
      'Worlds assembled on demand, assets dreamt by models, mechanics tuned by agents. The last era is the one still being written.',
    accent: '#4ce0ff',
    events: [
      {
        id: 'game-athon',
        name: 'Game-Athon',
        tagline: 'Build a playable game in a day',
        blurb:
          'Theme drops at 09:30. Ship something playable by 17:00 — engine, art and AI tooling all fair game.',
        scene: 'gameAthon',
        format: 'Teams of 4 · 7 hours',
      },
    ],
  },
];

export const ALL_EVENTS = ERAS.flatMap((e) => e.events);

/* ---------------------------------------------------------------------------
   PLACEHOLDER — replace with the real run-of-show from the proposal.
   --------------------------------------------------------------------------- */
export interface ScheduleRow {
  time: string;
  slot: string;
  venue: string;
  track: string;
}

export const SCHEDULE: ScheduleRow[] = [
  { time: '08:30', slot: 'Registration & Kit Collection', venue: 'Main Foyer', track: 'ALL' },
  { time: '09:15', slot: 'Inauguration · Lighting of the Lamp', venue: 'Auditorium', track: 'ALL' },
  { time: '09:30', slot: 'Game-Athon — Theme Reveal', venue: 'Lab 204', track: 'NEXT-GEN' },
  { time: '10:00', slot: 'Capture the Flag · Round 1', venue: 'Lab 201', track: 'TECHNICAL' },
  { time: '10:00', slot: 'Valorant · Group Stage', venue: 'E-Sports Arena', track: 'E-SPORTS' },
  { time: '10:30', slot: 'Bridge Wars · Build Phase', venue: 'Workshop Bay', track: 'TECHNICAL' },
  { time: '11:00', slot: 'Tech Tunes · Prelims', venue: 'Seminar Hall A', track: 'NON-TECH' },
  { time: '11:30', slot: 'Robo Race · Qualifying Runs', venue: 'Central Quad', track: 'ROBOTICS' },
  { time: '12:00', slot: 'Escape the Server', venue: 'Lab 203', track: 'TECHNICAL' },
  { time: '12:30', slot: 'Lunch Break', venue: 'Cafeteria', track: 'ALL' },
  { time: '13:15', slot: 'Algorithm Auction', venue: 'Lab 202', track: 'TECHNICAL' },
  { time: '13:30', slot: 'Interface Quest · Design Sprint', venue: 'Studio 1', track: 'MEDIA' },
  { time: '14:00', slot: 'Robo Soccer · Knockouts', venue: 'Central Quad', track: 'ROBOTICS' },
  { time: '14:00', slot: 'Secret Seekers · Hunt Begins', venue: 'Campus-wide', track: 'NON-TECH' },
  { time: '14:30', slot: 'AI Whisperer', venue: 'Lab 205', track: 'TECHNICAL' },
  { time: '15:00', slot: 'MK · Tekken · FIFA Finals', venue: 'E-Sports Arena', track: 'E-SPORTS' },
  { time: '15:30', slot: 'Nexus Negotiator · Final Table', venue: 'Seminar Hall B', track: 'NON-TECH' },
  { time: '16:00', slot: 'Quest to Cinema · Screening', venue: 'Auditorium', track: 'MEDIA' },
  { time: '17:00', slot: 'Game-Athon · Submissions Close', venue: 'Lab 204', track: 'NEXT-GEN' },
  { time: '17:30', slot: 'Prize Distribution & Closing', venue: 'Auditorium', track: 'ALL' },
];

/* ---------------------------------------------------------------------------
   PLACEHOLDER — replace with the real coordinator list from the proposal.
   --------------------------------------------------------------------------- */
export interface Coordinator {
  name: string;
  role: string;
  group: string;
}

export const COORDINATORS: Coordinator[] = [
  { name: 'TBD', role: 'Faculty Convenor', group: 'Faculty' },
  { name: 'TBD', role: 'Faculty Co-Convenor', group: 'Faculty' },
  { name: 'TBD', role: 'Fest Head', group: 'Core' },
  { name: 'TBD', role: 'Fest Co-Head', group: 'Core' },
  { name: 'TBD', role: 'Technical Head', group: 'Core' },
  { name: 'TBD', role: 'E-Sports Head', group: 'Core' },
  { name: 'TBD', role: 'Non-Technical Head', group: 'Core' },
  { name: 'TBD', role: 'Robotics Head', group: 'Core' },
  { name: 'TBD', role: 'Media & Design Head', group: 'Core' },
  { name: 'TBD', role: 'Sponsorship Head', group: 'Core' },
  { name: 'TBD', role: 'Logistics Head', group: 'Core' },
  { name: 'TBD', role: 'Publicity Head', group: 'Core' },
];

export const CONTACT = {
  email: 'anviksha@nmims.edu.in',
  instagram: '@anviksha.stme',
  phone: '+91 00000 00000',
} as const;
