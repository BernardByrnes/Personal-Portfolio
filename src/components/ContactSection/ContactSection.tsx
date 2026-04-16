"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, Globe, Code2, Send, Phone } from "lucide-react";
import { PORTFOLIO } from "@/lib/constants";
import ContactForm from "./ContactForm";
import styles from "./ContactSection.module.css";

export default function ContactSection() {
  const sectionRef    = useRef<HTMLElement>(null);
  const grainRef      = useRef<HTMLDivElement>(null);
  const topLineRef    = useRef<HTMLDivElement>(null);
  const headerRef     = useRef<HTMLDivElement>(null);
  const fadeBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Top rule line draws in
      gsap.fromTo(
        topLineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.2, ease: "power3.inOut",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
        }
      );

      // Header stagger
      if (headerRef.current) {
        gsap.fromTo(
          Array.from(headerRef.current.children),
          { opacity: 0, y: 35 },
          {
            opacity: 1, y: 0, duration: 1, stagger: 0.16, ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
          }
        );
      }

      // Fade to black at very bottom
      gsap.fromTo(
        fadeBottomRef.current,
        { opacity: 0 },
        {
          opacity: 1, duration: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "80% bottom", end: "bottom bottom", scrub: 1 },
        }
      );

      // Grain drift
      gsap.to(grainRef.current, {
        backgroundPosition: "100% 100%",
        duration: 8, ease: "none", repeat: -1, yoyo: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className={styles.section}>
      <div ref={grainRef} className={styles.grain} aria-hidden="true" />
      <div ref={topLineRef} className={styles.topLine} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <div ref={headerRef} className={styles.header}>
          <span className={styles.creditLabel}>— Final Frame</span>
          <h2 className={styles.title}>Let&apos;s Build<br />Something</h2>
          <p className={styles.subtitle}>
            Have a project in mind? Let&apos;s talk about how we can bring it to life.
          </p>
        </div>

        {/* Contact form */}
        <ContactForm />

        {/* Divider */}
        <div className={styles.divider}>
          <span>or reach me directly</span>
        </div>

        {/* Social links */}
        <div className={styles.social}>
          <a href={PORTFOLIO.github} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Code2 size={16} /><span>GitHub</span>
          </a>
          <a href={PORTFOLIO.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Globe size={16} /><span>LinkedIn</span>
          </a>
          <a href={PORTFOLIO.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Send size={16} /><span>Twitter</span>
          </a>
          <a href={`mailto:${PORTFOLIO.email}`} className={styles.socialLink}>
            <Mail size={16} /><span>{PORTFOLIO.email}</span>
          </a>
          <a href="tel:+256700606335" className={styles.socialLink}>
            <Phone size={16} /><span>+256 700 606 335</span>
          </a>
          <a href="tel:+256788139736" className={styles.socialLink}>
            <Phone size={16} /><span>+256 788 139 736</span>
          </a>
        </div>

        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} {PORTFOLIO.name}</p>
          <p className={styles.footerSub}>Designed &amp; Built with intention</p>
        </footer>
      </div>

      <div ref={fadeBottomRef} className={styles.fadeToBlack} aria-hidden="true" />
    </section>
  );
}
