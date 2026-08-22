# ANVIKSHA '26 — The Epoch

Techfest site for **STME, NMIMS Chandigarh** — 12 September 2026.
Theme: _Digital Voyage: Charting the Course of Innovation_, told through the evolution of gaming.

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
  globals.css         design tokens + the five era token blocks
components/
  HeroBackground.tsx  fixed full-page canvas wrapper; owns scroll progress
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
  content.ts          ALL copy: fest info, eras, events, schedule, coordinators
  hooks.ts            reduced-motion, IntersectionObserver, render-slot semaphore, device tier
```

### Editing content

Everything user-facing lives in `lib/content.ts`. Adding an event = one entry in an era's
`events` array + one scene component + one line in `components/three/scenes/index.tsx`.

**Two blocks are placeholders and are marked as such in the file and on the page:**
`SCHEDULE` and `COORDINATORS`. Drop in the real rows from the proposal — the shapes are
already correct, nothing else changes.

---

## The design system

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

---

## Performance model

- **Pixel ratio** is capped at 2 on every canvas (`dpr={[1, 2]}`), so 3x phones don't render 3x.
- **Lazy mount with hysteresis**: an event canvas is created when its card is within 500px of the
  viewport and destroyed once it is 1200px away. This is not just a memory optimisation — browsers
  cap live WebGL contexts at roughly 16 and this page has 21 scenes, so keeping them all mounted
  would silently kill the earliest contexts. The asymmetric margins stop short scrolls from
  thrashing context creation.
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
- **`prefers-reduced-motion`**: all canvases render a single static frame and stop; framer-motion
  is globally set to `reducedMotion="user"`.

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
   break the "no external assets" rule. Lighting is 2–3 analytic lights per era rig.
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
