"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./AboutSection.module.css";

const FloatingShape = dynamic(
  () => import("./FloatingShape").then(m => m.FloatingShape),
  { ssr: false }
);

const stats = [
  { value: "3+",   label: "Years Experience" },
  { value: "20+",  label: "Projects Shipped" },
  { value: "10M+", label: "Events Processed Daily" },
];

export default function AboutSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const gradientRef  = useRef<HTMLDivElement>(null);
  const labelRef     = useRef<HTMLSpanElement>(null);
  const imageRef     = useRef<HTMLDivElement>(null);
  const bodyRef      = useRef<HTMLDivElement>(null);
  const sidebarRef   = useRef<HTMLDivElement>(null);
  const statsRef     = useRef<HTMLDivElement>(null);
  const currentlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(gradientRef.current, {
        backgroundPosition: "100% 100%",
        duration: 12, ease: "none", repeat: -1, yoyo: true,
      });

      gsap.fromTo(labelRef.current, { y: 14, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
      });

      gsap.fromTo(imageRef.current, { x: -40, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });

      if (bodyRef.current) {
        gsap.fromTo(Array.from(bodyRef.current.children), { y: 35, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, stagger: 0.18, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 68%" },
        });
      }

      if (statsRef.current) {
        gsap.fromTo(Array.from(statsRef.current.children), { x: 40, opacity: 0, scale: 0.94 }, {
          x: 0, opacity: 1, scale: 1,
          duration: 0.8, stagger: 0.14, ease: "power3.out",
          scrollTrigger: { trigger: sidebarRef.current, start: "top 75%" },
        });
      }

      gsap.fromTo(currentlyRef.current, { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: sidebarRef.current, start: "top 65%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className={styles.section}>
      <div ref={gradientRef} className={styles.gradientBg} aria-hidden="true" />

      {/* Decorative 3D shape — bottom-right corner */}
      <div className={styles.shapeCanvas} aria-hidden="true">
        <FloatingShape />
      </div>

      <div className={styles.container}>
        <span ref={labelRef} className={styles.label}>— About Me</span>

        <div className={styles.layout}>
          {/* Profile image */}
          <div ref={imageRef} className={styles.imageWrapper}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.imagePlaceholderIcon}>+</span>
              <span className={styles.imagePlaceholderText}>Add your photo</span>
            </div>
          </div>

          {/* Body */}
          <div ref={bodyRef} className={styles.body}>
            <h2 className={styles.title}>
              I craft interfaces<br />that feel{" "}
              <em className={styles.em}>alive</em>.
            </h2>

            <p className={styles.lead}>
              I&apos;m Mutambo Bernard — a frontend engineer who lives at the
              intersection of design and engineering. I believe great interfaces
              are invisible: intuitive, responsive, and cinematic.
            </p>

            <p>
              Motion isn&apos;t decoration — it&apos;s communication. I use
              GSAP, scroll-driven storytelling, and thoughtful micro-interactions
              to build experiences that feel effortlessly alive across every device.
            </p>
          </div>

          {/* Sidebar */}
          <div ref={sidebarRef} className={styles.sidebar}>
            <div ref={statsRef} className={styles.stats}>
              {stats.map(({ value, label }) => (
                <div key={label} className={styles.stat}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>

            <div ref={currentlyRef} className={styles.currentlyBox}>
              <span className={styles.dot} />
              <div>
                <p className={styles.currentlyTitle}>Currently</p>
                <p className={styles.currentlyText}>
                  Open to full-time &amp; freelance frontend roles
                </p>
              </div>
            </div>

            <a href="/Bernard Mutambo CV.pdf" download className={styles.cvLink}>
              Download CV
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
