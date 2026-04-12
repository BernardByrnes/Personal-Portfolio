"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(ScrollTrigger);

// Three.js canvas — browser-only, no SSR
const LaptopScene = dynamic(
  () => import("./LaptopScene").then((m) => m.LaptopScene),
  { ssr: false, loading: () => <div className={styles.canvasPlaceholder} /> }
);

const SkillOrbitCanvas = dynamic(
  () => import("../SkillsSection/SkillOrbitCanvas").then((m) => m.SkillOrbitCanvas),
  { ssr: false, loading: () => <div className={styles.orbitPlaceholder} /> }
);

export default function HeroSection() {
  const sectionRef     = useRef<HTMLElement>(null);
  const overlayRef     = useRef<HTMLDivElement>(null);
  const scrollCueRef   = useRef<HTMLDivElement>(null);

  // Mutable state shared with R3F (no re-renders needed)
  const progress = useRef(0);
  const mouse    = useRef({ x: 0, y: 0 });

  const [mounted,  setMounted]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hydration-safe detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    setMounted(true);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mouse parallax — passes coords to R3F without causing re-renders
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // GSAP scroll driver (desktop only)
  useEffect(() => {
    if (!mounted || isMobile) return;

    const ctx = gsap.context(() => {
      // Drives progress.current 0 → 1 as user scrolls through 400vh
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end:   "bottom bottom",
          scrub: 0.5,
        },
      });

      // HTML name overlay — fades in during last 12% of scroll
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "72% top",
              end:   "84% top",
              scrub: true,
            },
          }
        );
      }

      // Scroll cue disappears on first scroll
      if (scrollCueRef.current) {
        gsap.to(scrollCueRef.current, {
          opacity: 0,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "1% top",
            end:   "6% top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted, isMobile]);

  // Dark placeholder — shown before JS hydrates (prevents flash)
  if (!mounted) {
    return <section id="hero" className={styles.placeholder} aria-hidden="true" />;
  }

  // ── Mobile — orbit sphere hero ──────────────────────────────────
  if (isMobile) {
    return (
      <section id="hero" className={styles.mobileHero}>
        <div className={styles.mobileGrain} aria-hidden="true" />

        {/* Skills orbit — fills top portion of screen */}
        <div className={styles.mobileOrbit} aria-hidden="true">
          <SkillOrbitCanvas onHover={() => {}} />
        </div>

        {/* Name + role anchored below the orbit */}
        <div className={styles.mobileContent}>
          <h1 className={styles.mobileName}>Mutambo Bernard</h1>
          <p className={styles.mobileSubtitle}>Software Developer</p>
          <p className={styles.mobileTagline}>Engineered for Experience</p>
        </div>

        <div className={styles.mobileCue}>
          <span>Scroll</span>
          <svg width="16" height="22" viewBox="0 0 16 22" fill="none" aria-hidden="true">
            <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="2,10 8,16 14,10" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>
    );
  }

  // ── Desktop — 3D laptop hero ────────────────────────────────────
  return (
    <section id="hero" ref={sectionRef} className={styles.heroSection}>
      <div className={styles.sticky}>

        {/* Three.js full-bleed canvas */}
        <div className={styles.canvasWrap}>
          <LaptopScene progress={progress} mouse={mouse} />
        </div>

        {/* Name / title overlay — fades in when screen text is visible */}
        <div ref={overlayRef} className={styles.overlay} style={{ opacity: 0 }}>
          <h1 className={styles.overlayName}>Mutambo Bernard</h1>
          <p className={styles.overlayTitle}>Software Developer</p>
        </div>

        {/* Scroll cue */}
        <div ref={scrollCueRef} className={styles.scrollCue}>
          <span>Scroll</span>
          <svg
            className={styles.scrollArrow}
            width="16"
            height="22"
            viewBox="0 0 16 22"
            fill="none"
            aria-hidden="true"
          >
            <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="2,10 8,16 14,10" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

      </div>
    </section>
  );
}
