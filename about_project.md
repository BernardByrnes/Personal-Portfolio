# Portfolio — Project Brief for AI

## What This Is

A single-page personal portfolio website for **Mutambo Bernard**, a software developer. It is a purely client-side, cinematic, scroll-driven experience with no backend. The goal is to feel like a hybrid between a film opening sequence, an Apple product page, and a creative developer showcase — "a cinematic interactive experience that happens to contain a portfolio."

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | CSS Modules + Tailwind CSS v4 |
| 3D / WebGL | React Three Fiber v9 + Three.js v0.183 |
| 3D Helpers | @react-three/drei v10 |
| Post-processing | @react-three/postprocessing v3 |
| Physics | @react-three/rapier v2 (Rapier WASM) |
| Animation | GSAP 3.14.2 + ScrollTrigger plugin |
| Smooth Scroll | Lenis 1.3.21 |
| Icons | lucide-react, react-icons/si |

No component library (no shadcn/ui, no Radix). All UI is hand-rolled with CSS Modules. No backend, no database, no API routes.

---

## File Structure

```
src/
  app/
    layout.tsx          — root layout, sets metadata (title, OG tags)
    page.tsx            — entry point, orchestrates Lenis + GSAP, renders all sections
    globals.css         — global CSS reset and base styles

  components/
    Preloader/          — full-screen loading screen (first visit only)
    Navigation/         — sticky nav with active section tracking + mobile hamburger drawer
    HeroSection/        — scroll-driven 3D laptop scene (React Three Fiber)
      Laptop.tsx        — procedural laptop model: base, lid, animated screen texture
                          (typewriter), keyboard keys (InstancedMesh ×2 + 12 wide-key meshes)
      LaptopScene.tsx   — R3F Canvas, camera arc rig, ambient particles, lighting,
                          Environment map (city HDRI), Bloom + Vignette post-processing
    AboutSection/       — bio text, stat cards, "currently" box, CV download,
                          gradient drift bg, FloatingShape with Rapier physics
    ProjectsSection/    — staggered masonry grid, cinematic hover overlay, project modal
    SkillsSection/      — fibonacci-sphere skill orbit (R3F + drei Html nodes)
    ContactSection/     — film end-credits layout, fade to black at bottom
    ui/
      CustomCursor      — dual-element GSAP cursor (hidden on mobile)
      ScrollProgress    — thin progress bar at top of viewport

  data/
    projects.ts         — all project data + skills data (single source of truth)

  lib/
    constants.ts        — owner identity (name, email, socials), nav items
    animations.ts       — reusable GSAP animation presets (MOTION, EASING, helpers)
    utils.ts            — general utility functions

  types/
    index.ts            — TypeScript interfaces: Project, SkillCategory
```

---

## How the App Boots

`page.tsx` controls the entire startup sequence:

1. On mount, checks `localStorage.hasVisited`
2. If first visit → renders `<Preloader />` (GSAP counter 0→100%, ~4s, fades out, calls `onComplete`)
3. On complete (or repeat visits) → `loadingState` becomes `false`, Lenis + GSAP initialize, all sections render
4. Lenis is stored on `window.__lenis` so other components can reference it
5. Lenis dispatches a custom `lenis.scroll` DOM event on every tick — components can listen to this
6. `modal:open` / `modal:close` custom events pause/resume Lenis when a project modal is open

---

## Motion System

All animations go through GSAP + ScrollTrigger. Centralized presets in `lib/animations.ts`:

**MOTION presets:**
- `textReveal` — staggered upward fade (0.6s, power2.out)
- `sectionReveal` — section entrance (0.9s, y:60)
- `cardReveal` — staggered card entrance (0.7s, stagger 0.12)
- `cardHover` / `buttonHover` — hover scale
- `filmFade` — slow opacity + scale (1.4s, power4.inOut) — cinematic scene cut feel
- `slowZoomDrift` — subtle zoom for scrub timelines
- `maskReveal` — clip-path wipe from bottom (`inset(100% 0 0 0)` → `inset(0%)`)
- `driftFloat` — idle float loop (`y: -=12`, sine.inOut, yoyo repeat)
- `velocityBlur` — applied based on scroll speed

**EASING constants:** `smooth`, `snappy`, `elastic`, `bounce`, `cinematic`, `reveal`

**Helper functions:**
- `revealSection(el, options)` — fade-up on scroll
- `revealCards(cards, trigger)` — staggered card reveal
- `revealByMask(elements, trigger)` — clip-path wipe reveal
- `filmFadeIn(element, trigger, delay)` — cinematic entrance
- `startDrift(element, delayOffset)` — idle float loop

`gsap.context()` is used in every component for scoped cleanup via `ctx.revert()`.

---

## Component Notes

### HeroSection _(most complex)_
Section height: `300vh`. Inner container is `position: sticky; height: 100vh`.

**Two layers run simultaneously:**
1. **3D laptop scene** (React Three Fiber, full-screen Canvas behind everything)
2. **SVG text-mask video** (overlaid on top, fades out as scroll progresses)

**3D Laptop scene (`LaptopScene.tsx` + `Laptop.tsx`):**
- Canvas: `dpr={[1, 1.5]}`, no shadows (removed for performance), `powerPreference: "high-performance"`
- Camera arc: `QuadraticBezierCurve3` from `[0, 1.2, -5.5]` (behind closed lid) → `[0, 6.5, 0.5]` (control) → `[2.8, 2.0, 8.0]` (front 3/4). Custom `progressToT` remapper gives slow start/end with fast arc middle.
- Scroll progress drives: lid opening (`-0.02 → -1.92 rad` over `0.2–0.42`), screen glow (`0.4–0.56`), keyboard backlight (`0.42–0.58`), screen texture fade-in (`0.56–0.74`)
- **Laptop model** is fully procedural (no GLTF):
  - Base slab, hinge cylinder, lid shell, bezel, screen glow plane, screen texture plane
  - **Keyboard**: 15-step column grid (`STEP=0.164`, `KB_TOT=2.446`). Two `InstancedMesh`es — 46 standard keys + 14 fn-row keys — plus 12 individual wide-key meshes (Tab, CapsLock, Enter, Shifts, Space, Ctrl/Alt). Space bar width = `kw(9.5)`, centred at `x=0` by symmetry.
  - **Animated screen**: Canvas2D texture with typewriter effect. 8 lines of portfolio config code type out at 22 chars/sec with per-line syntax colours (blue keywords, green strings, orange arrays, purple numbers). Starts at `progress > 0.38`. Only redraws when char count or cursor blink state changes.
- **Environment map**: `<Environment preset="city" background={false} />` wrapped in `<Suspense fallback={null}>` (HDRI loads from CDN without blocking the render loop)
- **Post-processing**: `<EffectComposer>` with `<Bloom luminanceThreshold=0.55 intensity=0.45>` + `<Vignette offset=0.4 darkness=0.55>`
- **Ambient particles**: 80 points in a sphere shell (`r: 6–13`) with vertex colors, slow rotation
- Subtle mouse parallax layered on the camera arc (±0.18 X, ±0.12 Y)
- Lighting: ambient 0.90, key light [3,6,3] @2.4, blue rim [-4,3,-4] @0.85, back-of-lid fill [0,2,-6] @1.8, top-back fill [0,5,-4] @1.1 blue-tinted

**The text-mask video effect:**
- An inline SVG defines a `<clipPath id="heroNameClip">` with two `<text>` elements ("MUTAMBO" / "BERNARD") using `fontFamily: Syne`, `fontSize: 13vw`, centered
- A div with `clip-path: url(#heroNameClip)` wraps a `<video>` — video visible only inside letter shapes
- A second full-background `<video>` sits behind, starts at `opacity: 0`

**3-phase GSAP ScrollTrigger scrub timeline** (scrub: 1.2):
- Phase 1→2 (0–40%): `letterSpacing` animates `0.04em → 0.25em`
- Phase 2 (20–55%): tagline fades in, sticky container scales up (1 → 1.06)
- Phase 3 (55–100%): clipped video fades out, full background video fades in, dark overlay fades

Name overlay (`h1` + subtitle) fades in at scroll `72% → 84%` via a separate ScrollTrigger scrub.

**Overlays:** dark base (`#0a0a0a`), grain (SVG fractalNoise, mix-blend-mode overlay), vignette (radial gradient).

### Preloader
Only on first visit (`localStorage.hasVisited`). GSAP timeline: fade in → counter 0→95 (2s) → 95→100 (0.5s) → fade out (1.2s) → calls `onComplete`. Sets `localStorage.hasVisited = "true"` at 100%.

### Navigation
- GSAP entrance from `y: -80` on mount
- `IntersectionObserver` on each `section[id]` — updates `activeSection` state for nav highlight
- `isScrolled` state: adds `.scrolled` class after 80px scroll
- Smooth scroll to section on link click via `element.scrollIntoView`
- **Mobile:** hamburger button (3-bar → X). Drawer slides in from right via GSAP, nav links stagger in. Body scroll locked while open.

### ProjectsSection
**Grid layout** (staggered masonry):
- Mobile: 1 column
- Tablet (`≥ 640px`): 2 columns, first card spans full width
- Desktop (`≥ 1024px`): 3 columns — first card spans 2 cols/1 row (feature), second spans 1 col/2 rows (tall), fifth spans 2 cols (wide)

**ProjectCard hover:** GSAP 3D tilt on `mousemove`, `.cardOverlay` fades in revealing tagline + tech tags (flicker stagger) + CTA.

**ProjectModal:**
- Full GSAP timeline: overlay fade → modal scale expand → content stagger
- `data-lenis-prevent` attribute stops Lenis intercepting wheel events inside the modal
- `overscroll-behavior: contain` + `touch-action: pan-y` for mobile finger scroll
- Dispatches `modal:open` / `modal:close` to pause/resume Lenis

### SkillsSection
- Fibonacci sphere distribution (`fibonacciSphere(n, 2.4)`) of all skills rendered as `<Html>` nodes inside an R3F Canvas
- Group rotates continuously; depth-fade via quaternion `world.z` mapping
- Canvas pauses via `IntersectionObserver` + `frameloop="demand"` when off-screen
- `dpr={[1, 1.5]}`
- Category legend below the orbit with accent-coloured dots

### AboutSection
- Slow animated background: two radial gradients with `backgroundPosition` animated (12s, yoyo)
- 2-column layout (body left, sidebar right) at `≥ 1024px`
- CV download link (`/Bernard Mutambo CV.pdf`) in the sidebar
- **FloatingShape** (decorative, bottom-right, `opacity: 0.28`):
  - 5 icosahedra driven by **Rapier physics** (zero gravity, `timeStep="vary"`)
  - Invisible `CuboidCollider` walls keep shapes in bounds (`±1.50` on X/Y, `±0.85` on Z)
  - Shapes get random initial `linvel`/`angvel` impulse on mount (300ms delay for WASM ready)
  - Sinusoidal drift force per shape keeps motion perpetual without gravity
  - Scroll velocity listener applies vertical impulse proportional to scroll speed
  - Canvas pauses via `IntersectionObserver` + `frameloop="demand"` when off-screen

### ContactSection
Film end-credits structure:
- `— Final Frame` mono label, large title, subtitle
- Top horizontal rule: `scaleX: 0 → 1` draw-in on scroll
- Grain texture with animated `backgroundPosition` drift
- Bottom fade: `linear-gradient(transparent → #000)`, opacity scrubbed to 1 as user reaches bottom

### CustomCursor
Two overlapping divs: fast dot (0.1s lag) and slow follower (0.3s lag), both GSAP-animated to mouse position. Returns `null` on mobile.

---

## Performance Architecture

Multiple WebGL contexts on the page — each canvas pauses when off-screen:

| Canvas | Pause mechanism |
|---|---|
| LaptopScene (hero) | Always active while hero section is sticky |
| SkillOrbitCanvas | `IntersectionObserver` → `frameloop="demand"` |
| FloatingShape (about) | `IntersectionObserver` → `frameloop="demand"` |

**Render budget decisions:**
- No shadow maps (removed — saved a 1024×1024 GPU pass every frame)
- Bloom without `mipmapBlur` (standard single-pass blur)
- DPR capped at 1.5× on all canvases
- Ambient particles: 80 (not 160)
- Post-processing stack: Bloom + Vignette only (ChromaticAberration removed)

---

## Data Layer

**`src/lib/constants.ts`** — owner identity:
```ts
PORTFOLIO.name    = "MUTAMBO BERNARD"
PORTFOLIO.title   = "Software Developer"
PORTFOLIO.email   = "bernardtambo40@gmail.com"
PORTFOLIO.github  = "https://github.com/mutambo"
PORTFOLIO.linkedin / .twitter
NAV_ITEMS — [{ label, href }] — drives both desktop nav and mobile drawer
```

**`src/data/projects.ts`** — projects array + skills:
- 5 projects, each: `id`, `title`, `tagline`, `description`, `challenge`, `solution`, `impact`, `techStack[]`, `images[]`, `liveUrl?`, `githubUrl?`, `featured`
- `skills` object used by SkillsSection

To add a project: add an entry to the `projects` array. No other files need changing.
To change owner info: edit `constants.ts`.

---

## Known Gaps / Things to Be Aware Of

- **Project images are placeholders** — `images[]` points to `/projects/*.jpg` paths that don't exist. Real images need to be dropped into `/public/projects/`.
- **CV file required** — `/public/Bernard Mutambo CV.pdf` must exist for the download link to work.
- **Video file required** — `/public/videos/hero-video.mp4` must exist for the hero video layers to render. Section still scrolls correctly without it.
- **Environment HDRI loads from CDN** — `@react-three/drei` fetches the city preset from `raw.githack.com`. Wrapped in `<Suspense fallback={null}>` so a network failure or slow load won't block the scene.
- **Rapier WASM** — `@react-three/rapier` loads a ~800 KB WASM binary on first render of the About section. The `setTimeout(300)` before setting initial velocities gives WASM time to initialise.
- **SVG clip-path font dependency** — hero text mask depends on the Syne font being loaded before the SVG `<clipPath>` renders. No explicit `document.fonts.ready` guard.
- **`color-mix()` CSS** — used in SkillsSection. Requires Chrome 111+, Firefox 113+, Safari 16.2+.
- **Contact form is a `mailto:` link** — no form submission / backend wired up yet.
- **`lib/animations.ts` helpers are partially used** — most components still inline GSAP animations directly.
