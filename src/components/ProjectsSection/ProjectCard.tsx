"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/types";
import styles from "./ProjectsSection.module.css";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  featured?: boolean;
}

export default function ProjectCard({ project, onClick, featured }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * 10;
    const rotateY = ((rect.width / 2 - x) / rect.width) * 10;
    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseEnter = () => {
    gsap.to(overlayRef.current, { opacity: 1, duration: 0.35, ease: "power2.out" });
    // Flicker tech tags in
    if (techRef.current) {
      const tags = techRef.current.querySelectorAll("span");
      gsap.fromTo(
        tags,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.05, ease: "power2.out" }
      );
    }
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${featured ? styles.cardFeatured : ""}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Background image area */}
      <div className={styles.cardImage}>
        <div className={styles.cardImagePlaceholder}>
          <span>{project.title.charAt(0)}</span>
        </div>
      </div>

      {/* Cinematic hover overlay */}
      <div ref={overlayRef} className={styles.cardOverlay}>
        <div className={styles.overlayContent}>
          <p className={styles.overlayTagline}>{project.tagline}</p>
          <div ref={techRef} className={styles.overlayTech}>
            {project.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className={styles.overlayTechTag}>{tech}</span>
            ))}
          </div>
          <div className={styles.overlayCta}>
            <span>View Case Study</span>
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>

      {/* Always-visible title strip at bottom */}
      <div className={styles.cardFooter}>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        {featured && <span className={styles.featuredBadge}>Featured</span>}
      </div>
    </div>
  );
}
