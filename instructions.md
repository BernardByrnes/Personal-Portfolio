# Portfolio Improvement Roadmap

> Last updated: 2026-04-11
> Status legend: ✅ Done | 🟡 Pending | 🔴 Blocked | 🚀 Future

---

## ✅ DONE

### 1. Font Optimization
- Switched from Google Fonts `@import` CDN to `next/font/google` (self-hosted)
- Updated `layout.tsx` with Syne, Inter, JetBrains Mono via CSS variables
- Removed `@import` from `globals.css`
- Updated all CSS modules to use `var(--font-display)` / `var(--font-body)` / `var(--font-mono)`

### 2. Mobile Hero Fallback
- Added `isMobile` detection in `HeroSection.tsx` (< 768px threshold)
- `MobileHero` component uses CSS radial gradient + noise texture (no video)
- GSAP text entrance animation on mobile (no ScrollTrigger dependency)
- Returns `null` on server to prevent hydration mismatch

### 3. Contact Form (EmailJS)
- `ContactForm.tsx` built with 4 status states: idle / sending / success / error
- Name + email in 2-column row (stacks on mobile < 540px)
- GSAP ScrollTrigger entrance animation on fields
- `role="status" aria-live="polite"` for screen reader announcements
- Auto-resets to idle after 5s on success
- Integrated into `ContactSection.tsx` above social links

### 4. Accessibility
- `:focus-visible` styles added to `globals.css`
- Escape key closes `ProjectModal` (keydown listener in `useEffect`)
- `aria-label` and `aria-expanded` on hamburger button (Navigation)
- Reduced-motion: `gsap.globalTimeline.clear()` + `ScrollTrigger.kill()` in `page.tsx`

### 5. Video Performance
- `IntersectionObserver` in `HeroSection.tsx` pauses both videos when section exits viewport
- GSAP `onUpdate` scrubs video `currentTime` (replaced manual Lenis listener)

### 6. Error Boundaries + Lazy Loading
- `ErrorBoundary.tsx` class component wrapping each section in `page.tsx`
- `SectionSkeleton.tsx` as loading fallback (dark bg, matches site theme)
- `AboutSection`, `ProjectsSection`, `SkillsSection`, `ContactSection` use `next/dynamic`
- `HeroSection` and `Navigation` are eagerly loaded (above-the-fold)

### 7. Mobile Navigation Drawer
- Hamburger button with 3 `<span>` bars
- GSAP drawer: `x: 100% → 0`, link stagger, body scroll lock
- Backdrop `<div>` for click-to-close

### 8. Cinematic Hero (Desktop)
- SVG `<clipPath id="heroNameClip">` with two `<text>` elements for name mask
- Video plays inside letter shapes via `clip-path: url(#heroNameClip)` on div
- 3-phase scroll story: text expand → scale → video reveal
- `sectionRef` height: 300vh; sticky inner div holds 100vh viewport

### 9. Project Modal
- GSAP timeline: overlay fade → modal scale expand → content stagger
- Click-outside-to-close via `e.target === overlayRef.current`
- Dispatches `modal:open` / `modal:close` to pause/resume Lenis

### 10. Skills Section
- CSS `--accent` custom property per category (blue / green / amber)
- Independent GSAP float per cluster (sine.inOut yoyo)
- Scroll velocity `blur` + `scale` on container

---

## 🔴 BLOCKED (needs user action)

### EmailJS Credentials
`ContactForm.tsx` is wired up and ready. You just need to:

1. Create account at emailjs.com
2. Add an email service (Gmail, Outlook, etc.)
3. Create an email template with these variables:
   ```
   From: {{from_name}} ({{from_email}})
   Subject: Portfolio Contact: {{subject}}
   Message: {{message}}
   ```
4. Create `.env.local` in the portfolio root:
   ```env
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   ```

---

## 🟡 PENDING

### 1. Real Hero Video
**File:** `/public/videos/hero-video.mp4` (currently missing — hero shows blank)

Requirements:
- Cinematic b-roll: code editor, design tools, or abstract motion
- MP4 H.264, 1920×1080, 2–3 Mbps, 8–12s seamless loop
- Compress with HandBrake (target 2–3MB)
- Optional WebM version: `ffmpeg -i hero-video.mp4 -c:v libvpx-vp9 -b:v 1.5M hero-video.webm`
- Add poster fallback: `/public/videos/hero-poster.jpg`

### 2. Real Project Images
**File:** `src/data/projects.ts` — all `images` point to `/projects/*.jpg` paths that don't exist

Steps:
- Screenshot 3–5 real projects (1920×1080 minimum)
- Optimize: `npx @squoosh/cli --webp auto --resize 1920x1080 *.jpg`
- Add to `project.images[]` in `projects.ts`

### 3. Modal Focus Trap
Current modal does not trap focus (Tab key can leave the modal while it's open).

**File:** `src/components/ProjectsSection/ProjectModal.tsx`

Add focus trap:
```tsx
// On mount: collect all focusable elements inside modal, intercept Tab key
const focusableSelectors = 'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])';
const focusables = modalRef.current?.querySelectorAll(focusableSelectors);
// Trap Tab/Shift+Tab within focusables[0] → focusables[last]
```

### 4. Update `PORTFOLIO` Constants
**File:** `src/lib/constants.ts`
- Replace placeholder email, GitHub URL, LinkedIn URL, Twitter URL with real values

### 5. Update `src/data/projects.ts`
- Replace placeholder `challenge`, `solution`, `impact` text with real case study content
- Add real `liveUrl` and `githubUrl` per project

---

## 🚀 FUTURE (not prioritized)

### Dark / Light Mode Toggle
Intentionally deferred to a future version. The site is dark-only for now.

### Case Studies / Blog (MDX)
`npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter`
Route: `app/blog/[slug]/page.tsx`

### Analytics (Privacy-Friendly)
Options: Plausible (`next-plausible`) or Fathom Analytics

### Testimonials Section
Data structure in `src/data/testimonials.ts`, grid component with GSAP scroll reveal

### Animated Page Transitions
`npm install next-view-transitions` + wrap layout in `<ViewTransitions>`

---

## Testing Checklist

### Functional
- [ ] All nav links scroll to correct section
- [ ] Project cards open modals correctly
- [ ] Modal closes on backdrop click and Escape key
- [ ] Contact form validates input (name ≥2, email valid, message ≥20 chars)
- [ ] Contact form sends email (needs EmailJS credentials)
- [ ] CV download link works (`/Bernard Mutambo CV.pdf`)
- [ ] Social links open in new tabs

### Visual
- [ ] Hero video plays and scrubs on scroll (once video file is added)
- [ ] SVG text mask renders properly at all viewport widths
- [ ] Mobile hero shows gradient (no video)
- [ ] Mobile nav drawer opens/closes smoothly
- [ ] Form loading/success/error states display correctly

### Performance
- [ ] Lighthouse ≥ 90 performance
- [ ] Videos pause when hero is off-screen ✅
- [ ] Sections lazy-load below fold ✅

### Accessibility
- [ ] Fully keyboard navigable (Tab order logical)
- [ ] Focus trap inside modal
- [ ] Screen reader: form live region announces status ✅
- [ ] `prefers-reduced-motion` kills GSAP animations ✅
- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
