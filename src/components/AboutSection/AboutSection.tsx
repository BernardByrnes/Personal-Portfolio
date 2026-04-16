"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./AboutSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const FloatingShape = dynamic(
  () => import("./FloatingShape").then(m => m.FloatingShape),
  { ssr: false }
);

const stats = [
  { value: "2+",   label: "Years Experience" },
  { value: "20+",  label: "Projects Shipped" },
  { value: "10M+", label: "Events Processed Daily" },
];

const chips = ["React", "Next.js", "TypeScript", "D3.js", "GSAP", "Node.js"];

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
            <img
              src="/portfolio.png"
              alt="Mutambo Bernard"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Body */}
          <div ref={bodyRef} className={styles.body}>
            <h2 className={styles.title}>
              I craft interfaces<br />that feel{" "}
              <em className={styles.em}>alive</em>.
            </h2>

            <p className={styles.lead}>
              Frontend Developer with 2+ years building production dashboards,
              editorial platforms, and animated interfaces for clients across
              media, education, and logistics.
            </p>

            <p>
              I specialise in React, Next.js, and TypeScript, with a strong
              focus on data visualisation and motion design. I care about
              performance, accessibility, and pixel-perfect execution from
              Figma to production.
            </p>

            <div className={styles.chips}>
              {chips.map((t) => (
                <span key={t} className={styles.chip}>{t}</span>
              ))}
            </div>

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
                  Open to full-time &amp; freelance software roles &mdash; <strong>open to remote work</strong>
                </p>
              </div>
            </div>

            <div className={styles.linkRow}>
              <a href="/Bernard Mutambo CV.pdf" download className={styles.cvLink}>
                Download CV
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
              <a href="https://github.com/BernardByrnes" target="_blank" rel="noopener noreferrer" className={styles.githubLink} aria-label="GitHub profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
            </div>

            <div className={styles.directContact}>
              <a href={`mailto:bernardtambo40@gmail.com`} className={styles.contactEmail}>
                bernardtambo40@gmail.com
              </a>
              <div className={styles.contactPhones}>
                <a href="tel:+256700606335" className={styles.phoneLink}>+256 700 606 335</a>
                <span className={styles.separator}>/</span>
                <a href="tel:+256788139736" className={styles.phoneLink}>+256 788 139 736</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
