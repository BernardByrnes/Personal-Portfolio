import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Core easing ─────────────────────────────────────────────── */
export const EASING = {
  smooth:   "power2.out",
  snappy:   "power3.out",
  elastic:  "elastic.out(1, 0.3)",
  bounce:   "bounce.out",
  cinematic: "power4.inOut",
  reveal:   "power2.inOut",
};

/* ─── Motion presets ──────────────────────────────────────────── */
export const MOTION = {
  // Text reveal — staggered upward fade
  textReveal: {
    duration: 0.6,
    ease: EASING.smooth,
    stagger: 0.08,
    y: 30,
    opacity: 0,
  },

  // Generic section entrance
  sectionReveal: {
    duration: 0.9,
    ease: EASING.smooth,
    y: 60,
    opacity: 0,
  },

  // Card entrance — staggered
  cardReveal: {
    duration: 0.7,
    ease: EASING.smooth,
    stagger: 0.12,
    y: 40,
    opacity: 0,
  },

  // Hover scale for cards
  cardHover: {
    scale: 1.03,
    duration: 0.4,
    ease: "power1.out",
  },

  // Hover scale for buttons/CTAs
  buttonHover: {
    scale: 1.05,
    duration: 0.3,
    ease: "power1.out",
  },

  // Magnetic pull — for interactive elements
  magnetic: {
    strength: 0.3,
    duration: 0.4,
    ease: EASING.smooth,
  },

  // Scrub: use inside ScrollTrigger with scrub: 1
  scrollScrub: {
    scrub: 1,
    ease: "none",
  },

  // Page/section transition
  pageTransition: {
    duration: 0.6,
    ease: EASING.cinematic,
  },

  // ── New cinematic presets ──────────────────────────────────────

  // "Film fade" — slow fade with slight zoom, like a scene cut
  filmFade: {
    duration: 1.4,
    ease: EASING.cinematic,
    opacity: 0,
    scale: 1.04,
  },

  // "Slow zoom drift" — subtle parallax-style zoom over scroll
  slowZoomDrift: {
    scale: 1.08,
    duration: 1,
    ease: "none", // used with scrub
  },

  // "Mask reveal" — clip-path wipe from bottom (for text/image reveals)
  maskReveal: {
    clipPath: "inset(100% 0 0 0)",
    duration: 0.9,
    ease: EASING.snappy,
    stagger: 0.1,
  },

  // "Drift float" — idle floating animation for skill clusters
  driftFloat: {
    y: "-=12",
    duration: 3,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  },

  // "Scroll velocity blur" — applied based on scroll speed
  velocityBlur: {
    duration: 0.3,
    ease: "power2.out",
  },
};

/* ─── Reusable helpers ────────────────────────────────────────── */

/** Fade-up a section when it enters the viewport */
export const revealSection = (
  selector: string | Element | null,
  options?: { start?: string; delay?: number }
) => {
  if (!selector) return;
  gsap.from(selector, {
    ...MOTION.sectionReveal,
    delay: options?.delay ?? 0,
    scrollTrigger: {
      trigger: selector as Element,
      start: options?.start ?? "top 80%",
      end: "top 50%",
      toggleActions: "play none none reverse",
    },
  });
};

/** Staggered card reveal triggered by scroll */
export const revealCards = (
  cards: Element[] | NodeListOf<Element> | null,
  trigger: Element | null
) => {
  if (!cards || !trigger) return;
  gsap.from(Array.from(cards), {
    ...MOTION.cardReveal,
    scrollTrigger: {
      trigger,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });
};

/** Mask-reveal wipe (clip-path from bottom) */
export const revealByMask = (
  elements: Element[] | null,
  trigger: Element | null
) => {
  if (!elements || !trigger) return;
  gsap.fromTo(
    elements,
    { clipPath: "inset(100% 0 0 0)" },
    {
      clipPath: "inset(0% 0 0 0)",
      ...MOTION.maskReveal,
      scrollTrigger: {
        trigger,
        start: "top 78%",
        toggleActions: "play none none reverse",
      },
    }
  );
};

/** Film fade (opacity + subtle scale) for cinematic entrances */
export const filmFadeIn = (
  element: Element | null,
  trigger: Element | null,
  delay = 0
) => {
  if (!element || !trigger) return;
  gsap.fromTo(
    element,
    { opacity: 0, scale: 1.04 },
    {
      opacity: 1,
      scale: 1,
      duration: MOTION.filmFade.duration,
      ease: MOTION.filmFade.ease,
      delay,
      scrollTrigger: {
        trigger,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
};

/** Idle float drift — for skill clusters */
export const startDrift = (element: Element | null, delayOffset = 0) => {
  if (!element) return;
  gsap.to(element, {
    ...MOTION.driftFloat,
    delay: delayOffset,
  });
};

export { gsap, ScrollTrigger };
