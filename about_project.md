# Portfolio — Project Brief for AI

## What This Is

A single-page personal portfolio website for **Mutambo Bernard**, a frontend developer. It is a purely client-side, cinematic, scroll-driven experience with no backend. The goal is to feel like a hybrid between a film opening sequence, an Apple product page, and a creative developer showcase — "a cinematic interactive experience that happens to contain a portfolio."

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | CSS Modules + Tailwind CSS v4 |
| Animation | GSAP 3.14.2 + ScrollTrigger plugin |
| Smooth Scroll | Lenis 1.3.21 |
| Icons | lucide-react |

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
    HeroSection/        — scroll-driven 3D laptop scene (React Three Fiber) + SVG text-mask video
      Laptop.tsx        — procedural laptop model: base, lid, screen texture, keyboard keys (InstancedMesh), spacebar, backlight
      LaptopScene.tsx   — R3F Canvas, camera arc rig, ambient particles, scene lighting
    AboutSection/       — bio text, stat cards, "currently" box, CV download, gradient drift bg
    ProjectsSection/    — staggered masonry grid, cinematic hover overlay, project modal
    SkillsSection/      — floating animated skill clusters with drift + scroll velocity response
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
- Canvas starts with camera behind the closed lid (`[0, 1.2, -5.5]`), sweeps over a quadratic Bézier arc to a front 3/4 position (`[2.8, 2.0, 8.0]`) as the user scrolls
- Scroll progress drives: lid opening (`-0.02 → -1.92 rad` over scroll `0.2–0.42`), screen glow (`0.4–0.56`), keyboard backlight (`0.42–0.58`), screen texture fade-in (`0.56–0.74`)
- Laptop model is fully procedural (no GLTF): base slab, hinge cylinder, lid shell, bezel, screen plane with Canvas texture, 65 keyboard keys via `InstancedMesh` + separate spacebar mesh
- Subtle mouse parallax layered on the camera arc (±0.18 X, ±0.12 Y)
- 160 ambient particles orbiting in a sphere (`r: 6–13`) with vertex colors, slow Y-axis rotation
- Lighting: boosted ambient (0.90), strong main key ([3,6,3] @ 2.4), blue rim ([-4,3,-4] @ 0.85), back-of-lid fill ([0,2,-6] @ 1.8), top-back fill ([0,5,-4] @ 1.1 blue-tinted) — the last two ensure the closed lid reads clearly at scroll=0

**The text-mask video effect:**
- An inline SVG defines a `<clipPath id="heroNameClip">` with two `<text>` elements ("MUTAMBO" / "BERNARD") using `fontFamily: Syne`, `fontSize: 13vw`, centered via `x="50%"` and `y` percentages
- A div with `clip-path: url(#heroNameClip)` wraps a `<video>` — this makes the video visible *only inside the letter shapes*
- A second full-background `<video>` sits behind, starts at `opacity: 0`

**3-phase GSAP ScrollTrigger scrub timeline** (scrub: 1.2):
- Phase 1→2 (0–40%): `letterSpacing` on SVG text elements animates from `0.04em` → `0.25em` via `gsap attr`
- Phase 2 (20–55%): tagline fades in (`opacity: 0 → 1`), sticky container scales up subtly (1 → 1.06)
- Phase 3 (55–100%): clipped video fades out, full background video fades in, dark overlay fades to transparent

A separate ScrollTrigger `onUpdate` scrubs both videos' `currentTime` in sync with scroll progress.

**Overlays:** dark base (`#0a0a0a`, z-index 1), grain (SVG fractalNoise, z-index 10, mix-blend-mode overlay), vignette (radial gradient, z-index 9).

### Preloader
Only on first visit (`localStorage.hasVisited`). GSAP timeline: fade in → counter 0→95 (2s) → 95→100 (0.5s) → fade out (1.2s) → calls `onComplete`. Sets `localStorage.hasVisited = "true"` at 100%.

### Navigation
- GSAP entrance from `y: -80` on mount
- `IntersectionObserver` on each `section[id]` — updates `activeSection` state for nav highlight
- `isScrolled` state: adds `.scrolled` class (dark blurred background) after 80px scroll
- Smooth scroll to section on link click via `element.scrollIntoView`
- **Mobile:** hamburger button (3-bar → X animated with CSS transforms). Drawer slides in from right via GSAP (`x: 100% → 0`), nav links stagger in. Body scroll locked while open. Backdrop click closes it.

### ProjectsSection
**Grid layout** (staggered masonry):
- Mobile: 1 column
- Tablet (`≥ 640px`): 2 columns, first card spans full width (`grid-column: 1/-1`)
- Desktop (`≥ 1024px`): 3 columns — first card spans 2 cols/1 row (feature), second card spans 1 col/2 rows (tall), fifth card spans 2 cols (wide)

**ProjectCard hover:**
- GSAP 3D tilt on `mousemove` (`rotateX`/`rotateY`, perspective 1000)
- `.cardOverlay` fades in on `mouseenter` (opacity 0→1) revealing tagline, tech tags (flicker stagger), CTA
- Tech tags animate from `opacity: 0, y: 6` on each hover
- Image area scales slightly on hover via CSS transition

**ProjectModal:**
- Full GSAP timeline: overlay fade-in → modal scale expand (0.88→1, y:40→0) → content children stagger up
- Close plays timeline in reverse (content → modal → overlay)
- Click outside (on overlay) closes
- Dispatches `modal:open`/`modal:close` to pause/resume Lenis

### SkillsSection
Three clusters (Frontend / Backend / Tools) each with:
- An accent color via CSS `--accent` custom property (`#667eea` / `#4ade80` / `#f59e0b`)
- Top glowing rule line using the accent color
- Pulsing dot indicator
- Tag hover uses `color-mix(in srgb, var(--accent) 12%, transparent)` for accent tinting
- Each cluster has an independent GSAP idle float drift (`y: -=14`, sine.inOut, yoyo, different duration + delay per cluster)
- Scroll velocity listener: measures `Math.abs(scrollY - lastScroll)` per frame, applies proportional blur + scale to the cluster container

### AboutSection
- Slow animated background: two radial gradients with `backgroundPosition` animated 0%→100% (12s, yoyo repeat) — subtle color drift
- 2-column layout (body left, sidebar right) at `≥ 1024px`; stacked below
- CV download link (`/Bernard Mutambo CV.pdf`) renders in the sidebar as a styled anchor with `download` attribute
- Stat cards: slide in from right (`x: 40`), scale from 0.94

### ContactSection
Film end-credits structure:
- `— Final Frame` mono label
- Large centered title ("Let's Build Something")
- Top horizontal rule: `scaleX: 0 → 1` draw-in on scroll (transform-origin: left)
- Grain texture with animated `backgroundPosition` for slow drift
- Bottom fade: a `div` at `position: absolute; bottom: 0` with `linear-gradient(transparent → #000)`, animated `opacity: 0 → 1` via ScrollTrigger scrub as user reaches the very bottom

### CustomCursor
- Two overlapping divs: fast dot (0.1s lag) and slow follower (0.3s lag), both GSAP-animated to mouse position
- Scales up on hover over `a`, `button`, `.interactive`
- Returns `null` on mobile (`window.innerWidth < 768`)

---

## Data Layer

**`src/lib/constants.ts`** — owner identity:
```ts
PORTFOLIO.name    = "MUTAMBO BERNARD"
PORTFOLIO.email   = "mutambo.bernard@example.com"
PORTFOLIO.github  = "https://github.com/mutambo"
PORTFOLIO.linkedin / .twitter
NAV_ITEMS — [{ label, href }] — drives both desktop nav and mobile drawer
```

**`src/data/projects.ts`** — projects array + skills:
- 5 projects, each: `id`, `title`, `tagline`, `description`, `challenge`, `solution`, `impact`, `techStack[]`, `images[]`, `liveUrl?`, `githubUrl?`, `featured`
- `skills` object: `{ Frontend: [...], Backend: [...], Tools: [...] }`

To add a project: add an entry to the `projects` array. No other files need changing.
To change owner info: edit `constants.ts`.

---

## Known Gaps / Things to Be Aware Of

- **Project images are placeholders** — `images[]` in `projects.ts` points to `/projects/*.jpg` paths that don't exist in `/public`. The modal and card image areas use letter-based placeholder divs. Real images or videos need to be dropped into `/public/projects/`.
- **Contact form is missing** — `ContactSection` has only a `mailto:` link. No form, no submission logic.
- **`lib/animations.ts` helpers are partially used** — helper functions (`revealSection`, `revealCards`, etc.) exist but most components still inline their GSAP animations directly. Consolidating to helpers is a future refactor opportunity.
- **SVG clip-path font dependency** — the hero text mask depends on the Syne font being loaded before the SVG `<clipPath>` renders. There is no explicit `document.fonts.ready` guard. If font loading is slow, the clip shape may briefly mismatch the visible text on first paint.
- **Video file required** — `/public/videos/hero-video.mp4` must exist for the hero to work. Without it both the background video and the text-mask video are blank. The section still renders and scrolls correctly, just without video.
- **`color-mix()` CSS** — used in SkillsSection for accent tinting. Requires a modern browser (Chrome 111+, Firefox 113+, Safari 16.2+). Falls back gracefully (transparent) in older browsers.
