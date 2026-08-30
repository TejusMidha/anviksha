# ANVIKSHA '26 — The Epoch

Techfest site for **STME, NMIMS Chandigarh** — 12 September 2026.

Theme: **Digital Voyage: Charting the Course of Innovation** — charted across five eras of
gaming, from arcade to AI. The eras are the *visual system* used to express the theme, not a
second theme: everywhere copy appears the order is fest → theme → eras.

Next.js 14 (App Router) · TypeScript · Tailwind · react-three-fiber · framer-motion.
**Zero external assets**: every 3D object is generated in the browser from Three.js primitives.
There is no `/public` payload, no `.glb`, no textures, no backend.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Deploy

```bash
vercel --prod
```

No environment variables, no `vercel.json`, no build overrides. Vercel detects Next 14 and ships it.

> The build downloads the three Google fonts at build time via `next/font` (they are then
> self-hosted — no runtime CDN request). That means the machine running `npm run build`
> needs network access to `fonts.googleapis.com`, which Vercel has.

---

## Structure

```
app/
  layout.tsx          fonts (next/font), metadata, MotionConfig
  page.tsx            section composition
  globals.css         design tokens, five era token blocks, per-era backdrops
  @modal/(.)events/[slug]  intercepting route -> event opens as a modal
  @modal/default.tsx       null when no modal is active
  events/[slug]            standalone event page (deep link / hard refresh)
components/
  HeroBackground.tsx  fixed full-page canvas wrapper; owns scroll progress
  BootSequence.tsx    first-load-only boot animation (sessionStorage guarded)
  Countdown.tsx       isolated 1s interval; owns the only timer on the page
  EventDetail.tsx     detail body, shared by the modal AND the standalone page
  EventModal.tsx      modal shell: esc / backdrop / focus trap / canvas suspend
  PrizePool.tsx       count-up total; renders null until a total is supplied
  Faq.tsx / Sponsors.tsx / Socials.tsx / Icons.tsx
  era/
    EraBackdrop.tsx   per-era background medium + ERA_MOTION presets
    ConnectionField.tsx  era 3's drifting node/link network (2D canvas)
  timeline/
    TimelineTrack.tsx  brick-staircase run-of-show (scroll-driven, DOM only)
    sprites.tsx        ORIGINAL pixel art — read the IP note at the top
  Hero / About / EraStrip / EraNav / EventCard / Schedule / Coordinators / Register / Footer
  three/
    HeroField.tsx     the morphing instanced field
    EventCanvas.tsx   per-event <Canvas> (dpr cap, frameloop control)
    scenes/
      shared.tsx      colours, era lighting rigs, material factories, helpers
      technical.tsx   era 1 — 6 scenes
      esports.tsx     era 2 — 4 scenes
      nontechnical.tsx era 3 — 5 scenes
      era4.tsx        era 4 — robotics + media, 5 scenes
      nextgen.tsx     era 5 — Game-Athon particle field
      index.tsx       SceneKey -> component registry (+ camera framing)
lib/
  content.ts          ALL copy: fest info, eras, events, schedule, committee
  palettes.ts         per-event colour, read by BOTH the 3D objects and the
                      timeline callouts — one source of truth for event colour
  timeline.ts         staircase layout maths (pure, no React)
  hooks.ts            reduced-motion, IntersectionObserver, render/mount
                      budgets, canvas suspension, device tier
```

### Editing content

Everything user-facing lives in `lib/content.ts`. Adding an event = one entry in an era's
`events` array + one scene component + one line in `components/three/scenes/index.tsx`.

**Fields awaiting real data are typed `| null` and every consumer omits the row rather than
printing "TBD".** Grep `NEEDS DATA` in `lib/content.ts` for the full list. Sections whose data
is entirely missing (`PRIZE_POOL.total`, `SPONSORS`, and faculty coordinators) render **nothing**
— supply the data and they appear, no code change.

Still open: per-event `rules` / `teamSize` / `prize`, the prize pool, sponsors, faculty names,
and **per-event Drive links** — every event's "More Details" button currently points at the one
shared brochures folder (`FEST.brochureUrl`), because Drive folder IDs cannot be derived from an
event name.

`SCHEDULE` is still scaffolding: replace the rows, then flip `SCHEDULE_IS_PLACEHOLDER` to
`false` to drop the on-page caveat.

---

## The design system

### Base palette (the brochure's own)

The site's foundation — background, headings, body text, the action colour and all structural
chrome — is one block of custom properties at the top of `app/globals.css`. Base colours are
stored as bare `R G B` triples so the **same token** feeds Tailwind's slash-opacity
(`bg-void/80`) and raw `rgb(… / a)` in CSS; `tailwind.config.ts` only points at them. Changing a
shade is a one-line edit there, never a component-by-component sweep.

| role | token | value |
| --- | --- | --- |
| page ground | `--void` / `--void-hi` / `--void-lo` | deep violet → navy gradient, magenta bloom top-right |
| headings | `.brochure-title` / `.section-title` | cyan fill + magenta outline glow |
| body | `--paper` | off-white `#eef1fa` |
| action | `--amber` | the ONE CTA colour: `.cta-amber` filled, `.cta-amber-ghost` outlined |
| chrome | `--brick` → `--chrome`, `--chrome-line`, `--chrome-line-soft` | every border, divider and HUD edge |
| glow pair | `--arcade` + `--holo` | hover, focus, ambient light |

The five era languages and the per-event palettes layer **on top of** this base; they do not
replace it.

### Era tokens

Five era token blocks in `globals.css` (`.era-1` … `.era-5`) each set the same five variables:

| token | era 1 (arcade) | era 5 (AI) |
| --- | --- | --- |
| `--era-radius` | `0px` | `26px` |
| `--era-blur` | `0px` | `20px` |
| `--era-glow` | `0px` | `44px` |
| `--era-color` | `#39ff6a` | `#4ce0ff` |
| `--era-surface` | near-opaque | translucent glass |

`.era-surface`, `.era-chip` and `.era-text` read only those variables, so a section's whole
visual language changes by swapping one class on its wrapper. The 3D side mirrors it: era 1
uses `flatShading` + wireframe + a near-unlit rig; era 5 uses additive points and rim glow.

Type: **Press Start 2P** (hero + era labels), **Space Grotesk** (body), **JetBrains Mono**
(schedule, data, labels) — all via `next/font/google`.

### Per-event colour

`lib/palettes.ts` gives each of the 20 events its own `base / accent / hot / rim`, taken from
that event's page in the brochure. Both consumers read it:

- the 3D object **and its lighting rig** (`Rig` is keyed off the event's palette, not its era)
- the matching row's callout on the timeline

So the Valorant row on the run-of-show and the Valorant object on its card are the same pink by
construction, not by coincidence.

### The staircase timeline

`components/timeline/` renders the run-of-show as a descending staircase of brick blocks with a
character walking down it. **Pure DOM/SVG — no WebGL context**, deliberately: the mount budget
below is the tightest resource on the page and the timeline must not compete for it.

Vertical position comes from each row's **actual clock time**, so distance down the track is
elapsed time; `lib/timeline.ts` then relaxes colliding rows apart by a minimum gap so two 10:00
events stay legible. The horizontal zigzag is ornament and carries no data.

Scroll drives the character through a rAF tick that writes a transform and a `data-active`
attribute directly to the DOM — **no React state in the scroll path**, the same discipline the
hero field uses.

**IP**: the brochure's own timeline page uses Nintendo sprites and its Technical divider uses
Bandai Namco sprites. None of that is reproduced. The character ("the Voyager") and creature
("bit-mite") are original designs in the same 16-bit register — see the note at the top of
`components/timeline/sprites.tsx`.

---

## Performance model

- **Pixel ratio** is capped at 2 on every canvas (`dpr={[1, 2]}`), so 3x phones don't render 3x.
- **Lazy mount with hysteresis**: an event canvas is created when its card comes near the viewport
  and destroyed once it is well past. Margins are asymmetric *per axis* (`400px 120px` in,
  `1000px 400px` out) because the era rails are horizontal — a symmetric margin mounted cards
  scrolled off to the right that nobody can see.
- **Mount budget** (`useMountSlot`): margins alone cannot bound the context count, because a tall
  viewport straddling two horizontal rails legitimately has ~12 cards "near". Measured at 13 live
  contexts before this was added, against a browser ceiling of roughly 16 — with the detail modal
  about to add a 14th. At most **8** cards may hold a canvas, granted nearest-viewport-first, which
  measured back down to 9 contexts (8 cards + hero field) with the same 12 cards asking.
  The budget is re-evaluated **on scroll**, not only when a card's `wanted` flips: without that,
  a long scroll with no transition left every slot held by cards that had already gone off-screen
  (scrolling era 1 → era 3 rendered era 3's wells empty).
- **Parked loops**: an off-screen canvas is switched to `frameloop="demand"`, which stops
  rAF entirely — an idle section costs nothing per frame.
- **Global semaphore** (`useRenderSlot`, `lib/hooks.ts`): at most **3** event canvases may run
  their loop at once, regardless of how many are visible on a wide monitor. Cards waiting for a
  slot still show a rendered static frame, so nothing looks broken.
- **Device tier**: narrow viewport or ≤4 logical cores drops segment counts, particle counts and
  icosahedron detail, and disables MSAA. Objects are simplified, never hidden.
- **Hero field** is 2 instanced meshes = 2 draw calls for the whole background, at 44 instances
  (22 on low tier).
- **Scroll** is read through a ref inside `useFrame`, never React state, so scrolling never
  triggers a re-render of the 3D tree.
- **Modal canvas suspension** (`suspendBackgroundCanvases`): the detail modal mounts its own scene
  on top of a live strip. Rather than raise any ceiling, every background card releases its render
  slot while the modal is open — so the modal's scene runs *inside* the existing budget of 3.
- **Countdown isolation**: the countdown owns the only `setInterval` on the page and renders
  nothing but its own digits, so a tick cannot re-render the hero or the 3D tree.
- **Per-era backdrops are CSS or 2D canvas only.** Eras 2 and 4 read scroll through `useScrollVar`,
  which writes a CSS custom property on a rAF tick and never touches React state.
- **`prefers-reduced-motion`**: all canvases render a single static frame and stop; framer-motion
  is globally set to `reducedMotion="user"`; the boot sequence is skipped entirely.

### What I simplified deliberately

1. **No postprocessing / real bloom.** `@react-three/postprocessing` costs a fullscreen
   multi-pass pipeline per canvas — with up to 3 canvases live that is the single most expensive
   thing we could add. Glow is done with emissive materials, additive blending and CSS
   `box-shadow`/`text-shadow` instead. Visually very close at a fraction of the cost.
2. **No `transmission`/real glass** in era 3–5. `MeshPhysicalMaterial.transmission` re-renders the
   scene into a backbuffer per frame. The "glass" look is transparency + low roughness + emissive
   rim + CSS `backdrop-filter` on the card itself.
3. **Hero morph is a cross-fade, not a live subdivision.** Changing geometry detail or the
   `wireframe` flag at runtime forces a shader recompile and a visible hitch mid-scroll. Two
   instanced meshes sharing identical transforms cross-fade instead — same read, no stalls.
4. **No environment maps / HDRIs.** drei's `<Environment preset>` fetches from a CDN, which would
   break the "nothing fetched from a third party" rule. Lighting is 2–3 analytic lights per era
   rig. (The site does now ship local images — the three brand logos in `public/logos` and the
   committee photos in `public/team` — but every one is served from this origin. Nothing is
   fetched from a CDN at runtime.)
5. **No drei `<Text>`** — it fetches a font file. The "1010" digits in Algorithm Auction are
   boxes and tori.
6. **Value noise, not simplex**, in the hero vertex shader — a few ALU ops instead of dozens, and
   at this displacement scale the difference is not visible.
7. **Cloth is a sine ripple**, not a solver. The Capture-the-Flag flag is a 14×10 plane deformed
   on the CPU (≈165 verts) — cheap and reads correctly at card size.
8. **`@react-three/drei` is installed but unused at runtime.** It is in the stack spec and stays
   in `package.json`, but every scene is built from plain `@react-three/fiber` primitives, so
   drei contributes nothing to the shipped bundle. Import from it freely if you extend the
   scenes — the dependency is already there.
9. **Shared per-scene materials.** Each scene allocates 2–4 materials and reuses them across all
   its meshes, so a scene is a handful of draw calls rather than one per part.

---

## Accessibility notes

- Hero copy sits on a radial scrim (`.hero-scrim`) plus a page-wide `bg-void/45` layer, so text
  contrast never depends on what the 3D field happens to be doing behind it.
- Canvases are `pointer-events: none` and decorative; all information is in the DOM.
- The era rails are native horizontal scroll containers — keyboard and touch scrolling work
  without JS.
