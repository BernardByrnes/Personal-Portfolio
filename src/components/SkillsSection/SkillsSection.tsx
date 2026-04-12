"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categoryMeta } from "./skillsData";
import styles from "./SkillsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const SkillOrbitCanvas = dynamic(
  () => import("./SkillOrbitCanvas").then(m => m.SkillOrbitCanvas),
  { ssr: false, loading: () => <div className={styles.orbitPlaceholder} /> }
);

export default function SkillsSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const canvasRef   = useRef<HTMLDivElement>(null);
  const infoRef     = useRef<HTMLDivElement>(null);

  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
        }
      );
      gsap.fromTo(canvasRef.current,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1, scale: 1, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <h2 ref={titleRef} className={styles.title}>Tech Stack</h2>

        {/* 3D orbit canvas */}
        <div ref={canvasRef} className={styles.orbitWrap}>
          <SkillOrbitCanvas onHover={setHoveredSkill} />

          {/* Hovered skill name — shows in centre */}
          <div ref={infoRef} className={styles.hoverLabel} aria-live="polite">
            {hoveredSkill ?? ""}
          </div>
        </div>

        {/* Category legend */}
        <div className={styles.legend}>
          {(Object.entries(categoryMeta) as [keyof typeof categoryMeta, typeof categoryMeta[keyof typeof categoryMeta]][]).map(
            ([key, { label, accent }]) => (
              <span key={key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
                {label}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
