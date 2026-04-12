"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { X, ExternalLink, Code2 } from "lucide-react";
import { Project } from "@/types";
import styles from "./ProjectModal.module.css";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("modal:open"));

    const tl = gsap.timeline();

    // Overlay fades in
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" }
    )
    // Modal expands from center
    .fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.88, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "power3.out" },
      "-=0.2"
    )
    // Content items stagger in
    .fromTo(
      contentRef.current ? Array.from(contentRef.current.children) : [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" },
      "-=0.2"
    );

    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("modal:close"));
    };
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(contentRef.current ? Array.from(contentRef.current.children) : [], {
      opacity: 0, y: -10, duration: 0.2, stagger: 0.03, ease: "power2.in",
    })
    .to(modalRef.current, {
      opacity: 0, scale: 0.92, y: 20, duration: 0.35, ease: "power2.in",
    }, "-=0.1")
    .to(overlayRef.current, {
      opacity: 0, duration: 0.25, ease: "power2.in",
    }, "-=0.2");
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={handleOverlayClick}>
      <div ref={modalRef} className={styles.modal}>

        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Hero area */}
        <div className={styles.heroArea}>
          <div className={styles.heroPlaceholder}>
            <span>{project.title.charAt(0)}</span>
          </div>
          <div className={styles.heroOverlay} />
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} className={styles.content}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>{project.title}</h1>
              <p className={styles.tagline}>{project.tagline}</p>
            </div>
            <div className={styles.links}>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                  <ExternalLink size={14} />
                  Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                  <Code2 size={14} />
                  GitHub
                </a>
              )}
            </div>
          </header>

          <div className={styles.techGrid}>
            {project.techStack.map((tech) => (
              <span key={tech} className={styles.techBadge}>{tech}</span>
            ))}
          </div>

          <div className={styles.sections}>
            <div className={styles.caseSection}>
              <h2 className={styles.caseLabel}>The Challenge</h2>
              <p className={styles.caseText}>{project.challenge}</p>
            </div>
            <div className={styles.caseSection}>
              <h2 className={styles.caseLabel}>The Solution</h2>
              <p className={styles.caseText}>{project.solution}</p>
            </div>
            <div className={styles.caseSection}>
              <h2 className={styles.caseLabel}>The Impact</h2>
              <p className={styles.caseText}>{project.impact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
