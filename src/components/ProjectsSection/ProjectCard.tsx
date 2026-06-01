"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/types";
import { hasFinePointer, shouldUseLightEffects } from "@/lib/performance";
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
  const rotateXTo = useRef<((value: number) => void) | null>(null);
  const rotateYTo = useRef<((value: number) => void) | null>(null);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  useEffect(() => {
    setTiltEnabled(hasFinePointer() && !shouldUseLightEffects());

    if (!cardRef.current) return;
    rotateXTo.current = gsap.quickTo(cardRef.current, "rotateX", {
      duration: 0.45,
      ease: "power2.out",
    });
    rotateYTo.current = gsap.quickTo(cardRef.current, "rotateY", {
      duration: 0.45,
      ease: "power2.out",
    });
    gsap.set(cardRef.current, { transformPerspective: 1000 });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tiltEnabled) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * 10;
    const rotateY = ((rect.width / 2 - x) / rect.width) * 10;
    rotateXTo.current?.(rotateX);
    rotateYTo.current?.(rotateY);
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
    rotateXTo.current?.(0);
    rotateYTo.current?.(0);
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
        {project.images && project.images.length > 0 ? (
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            quality={72}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <span>{project.title.charAt(0)}</span>
          </div>
        )}
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
