"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss,
  SiGreensock, SiNodedotjs, SiD3, SiFigma,
} from "react-icons/si";
import { PORTFOLIO } from "@/lib/constants";
import { shouldUseLightEffects } from "@/lib/performance";
import styles from "./AboutSection.module.css";
import SimpleProfileCard from "./SimpleProfileCard";

const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const chips: Array<{ label: string; icon: any }> = [
  { label: "React", icon: SiReact },
  { label: "Next.js", icon: SiNextdotjs },
  { label: "TypeScript", icon: SiTypescript },
  { label: "Tailwind", icon: SiTailwindcss },
  { label: "GSAP", icon: SiGreensock },
  { label: "Node.js", icon: SiNodedotjs },
  { label: "D3.js", icon: SiD3 },
  { label: "Figma", icon: SiFigma },
];

const words: Array<{ text: string; em?: boolean; br?: boolean }> = [
  { text: "I" },
  { text: "build" },
  { text: "web" },
  { text: "experiences", br: true },
  { text: "people" },
  { text: "enjoy" },
  { text: "using.", em: true },
];

export default function AboutSection() {
  const sectionRef    = useRef<HTMLElement>(null);
  const labelRef      = useRef<HTMLSpanElement>(null);
  const wordRefs      = useRef<(HTMLSpanElement | null)[]>([]);
  const ruleRef       = useRef<HTMLDivElement>(null);
  const line1Ref      = useRef<HTMLParagraphElement>(null);
  const line2Ref      = useRef<HTMLParagraphElement>(null);
  const chipRefs      = useRef<(HTMLSpanElement | null)[]>([]);
  const linksRef      = useRef<HTMLDivElement>(null);
  const lockupRef     = useRef<HTMLDivElement>(null);
  const blob1WrapRef = useRef<HTMLDivElement>(null);
  const blob2WrapRef = useRef<HTMLDivElement>(null);
  const photoWrapRef = useRef<HTMLDivElement>(null);
  const [lightEffects, setLightEffects] = useState(true);

  useEffect(() => {
    setLightEffects(shouldUseLightEffects());
  }, []);

  // Reveal animation — fires once on enter
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
        const all = [
          labelRef.current,
          ...wordRefs.current,
          ruleRef.current,
          line1Ref.current,
          line2Ref.current,
          ...chipRefs.current,
          linksRef.current,
          lockupRef.current,
          photoWrapRef.current,
        ].filter(Boolean);
        gsap.set(all, { opacity: 1, y: 0, yPercent: 0, scaleX: 1 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const wordEls = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
      const chipEls = chipRefs.current.filter(Boolean) as HTMLSpanElement[];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl
        // Label sets the frame
        .from(labelRef.current, { opacity: 0, duration: 0.6 })

        // Heading words slide up from clip — expo.out = editorial snap
        .from(
          wordEls,
          { yPercent: 110, stagger: 0.07, duration: 0.85, ease: "expo.out" },
          "-=0.3",
        )

        // Signature moment: rule draws left → right
        .from(
          ruleRef.current,
          { scaleX: 0, transformOrigin: "left center", duration: 0.7, ease: "power4.inOut" },
          "-=0.45",
        )

        // Bio lines — lighter than heading, trails off
        .from(
          [line1Ref.current, line2Ref.current],
          { opacity: 0, y: 20, stagger: 0.1, duration: 0.7 },
          "-=0.5",
        )

        // Chips — last, quick, effortless
        .from(
          chipEls,
          { opacity: 0, y: 8, stagger: 0.04, duration: 0.4 },
          "-=0.35",
        )

        // Links settle
        .from(linksRef.current, { opacity: 0, y: 6, duration: 0.4 }, "-=0.25")

    // Lockup fades in slowly, behind everything
    .from(lockupRef.current, { opacity: 0, duration: 1.4, ease: "power2.out" }, 0.15)

    // Photo card fade-in — opacity only, no transform to avoid conflicts
    .from(photoWrapRef.current, { opacity: 0, duration: 0.9, ease: "power2.out" }, 0.6);
    });

    return () => mm.revert();
  }, []);

  // Mouse parallax — rAF throttled, fine pointer only
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      gsap.to(lockupRef.current, { x: x * 6, y: y * 6, duration: 1.4, ease: "power2.out" });
      gsap.to(blob1WrapRef.current, { x: x * 22, y: y * 22, duration: 2.2, ease: "power2.out" });
      gsap.to(blob2WrapRef.current, { x: x * -14, y: y * -14, duration: 1.8, ease: "power2.out" });
    };

    const throttled = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { onMove(e); rafId = 0; });
    };

    section.addEventListener("mousemove", throttled);
    return () => {
      section.removeEventListener("mousemove", throttled);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className={styles.section}>

      {/* Fluid cursor effect scoped to this section */}
      <SplashCursor
        key={lightEffects ? "smoke-light" : "smoke-full"}
        SIM_RESOLUTION={lightEffects ? 48 : 64}
        DYE_RESOLUTION={lightEffects ? 256 : 384}
        PRESSURE_ITERATIONS={lightEffects ? 12 : 20}
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        CURL={3}
        SPLAT_RADIUS={0.18}
        RAINBOW_MODE={true}
        TRANSPARENT={true}
      />

      {/* Ambient blobs — CSS drift, outer wrap gets GSAP mouse offset */}
      <div ref={blob1WrapRef} className={styles.blobWrap1} aria-hidden="true">
        <div className={styles.blob1} />
      </div>
      <div ref={blob2WrapRef} className={styles.blobWrap2} aria-hidden="true">
        <div className={styles.blob2} />
      </div>

      <div className={styles.container}>
        <span ref={labelRef} className={styles.label}>— About Me</span>

        <div className={styles.layout}>
          <div className={styles.body}>

            <h2
              className={styles.title}
              aria-label="I build web experiences people enjoy using."
            >
              {words.map(({ text, em, br }, i) => (
                <span key={i} style={{ display: "contents" }}>
                  <span className={styles.wordWrap}>
                    <span
                      ref={(el) => { wordRefs.current[i] = el; }}
                      className={em ? `${styles.word} ${styles.em}` : styles.word}
                    >
                      {text}
                    </span>
                  </span>
                  {br && <br />}
                </span>
              ))}
            </h2>

            <div ref={ruleRef} className={styles.rule} aria-hidden="true" />

            <p ref={line1Ref} className={styles.lead}>
              Frontend Developer with 3+ years building production dashboards,
              editorial platforms, and animated interfaces for clients across
              media, education, and logistics.
            </p>

            <p ref={line2Ref}>
              I specialise in React, Next.js, and TypeScript, with a strong
              focus on data visualisation and motion design. I care about
              performance, accessibility, and pixel-perfect execution from
              Figma to production.
            </p>

          <div className={styles.chips}>
            {chips.map((c, i) => {
              const Icon = c.icon;
              return (
                <span
                  key={c.label}
                  ref={(el) => { chipRefs.current[i] = el; }}
                  className={styles.chip}
                >
                  {c.label}
                  <Icon size={13} />
                </span>
              );
            })}
          </div>

            <div ref={linksRef} className={styles.linkRow}>
              <a href="/Bernard Mutambo _ CV.pdf" download className={styles.cvLink}>
                Download CV
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
              <a
                href="https://github.com/BernardByrnes"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
                aria-label="GitHub profile"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <a
                href={PORTFOLIO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
                aria-label="LinkedIn profile"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.84v2.19h.05c.54-1.03 1.86-2.11 3.83-2.11 4.1 0 4.86 2.7 4.86 6.21V24h-4v-8.59c0-2.05-.04-4.69-2.86-4.69-2.86 0-3.3 2.23-3.3 4.54V24h-4V8z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

          {/* Right: simple profile card (no motion / holo effects) */}
      <div ref={photoWrapRef} className={styles.photoWrap}>
        <SimpleProfileCard
          onContactClick={() => {
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>
        </div>

        {/* Decorative typographic lockup — desktop only, sits behind body */}
        <div className={styles.lockupWrap} aria-hidden="true">
          <div ref={lockupRef} className={styles.lockup}>BM</div>
        </div>
      </div>
    </section>
  );
}
