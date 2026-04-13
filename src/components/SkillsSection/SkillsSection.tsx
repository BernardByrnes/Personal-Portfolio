"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { allSkills, categoryMeta } from "./skillsData";
import styles from "./SkillsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const SkillOrbitCanvas = dynamic(
  () => import("./SkillOrbitCanvas").then(m => m.SkillOrbitCanvas),
  { ssr: false, loading: () => <div className={styles.orbitPlaceholder} /> }
);

/* ── Mobile pill grid — grouped by category ──────────────── */
function SkillPillGrid() {
  return (
    <div className={styles.pillGrid}>
      {(Object.entries(categoryMeta) as [keyof typeof categoryMeta, typeof categoryMeta[keyof typeof categoryMeta]][]).map(
        ([cat, { label, accent }]) => {
          const skills = allSkills.filter(s => s.category === cat);
          return (
            <div key={cat} className={styles.pillGroup}>
              <p className={styles.pillGroupLabel}>
                <span className={styles.pillGroupDot} style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
                {label}
              </p>
              <div className={styles.pillRow}>
                {skills.map(skill => {
                  const Icon = skill.icon;
                  return (
                    <div
                      key={skill.name}
                      className={styles.pill}
                      style={{
                        borderColor: `${accent}35`,
                        background:  `${accent}0a`,
                      }}
                    >
                      <Icon size={13} color={skill.color} />
                      <span>{skill.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const infoRef    = useRef<HTMLDivElement>(null);

  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [mounted,      setMounted]      = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    setMounted(true);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
        }
      );
      if (canvasRef.current) {
        gsap.fromTo(canvasRef.current,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1, scale: 1, duration: 1.1, ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <h2 ref={titleRef} className={styles.title}>Tech Stack</h2>

        {mounted && isMobile ? (
          /* Mobile — categorized pill grid (orbit is already in the hero) */
          <SkillPillGrid />
        ) : (
          /* Desktop — 3D orbit canvas */
          <>
            <div ref={canvasRef} className={styles.orbitWrap}>
              <SkillOrbitCanvas onHover={setHoveredSkill} />
              <div
                ref={infoRef}
                className={styles.hoverLabel}
                style={{ opacity: hoveredSkill ? 1 : 0 }}
                aria-live="polite"
              >
                {hoveredSkill ?? ""}
              </div>
            </div>

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
          </>
        )}
      </div>
    </section>
  );
}
