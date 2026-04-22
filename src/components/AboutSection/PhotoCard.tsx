"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import VanillaTilt from "vanilla-tilt";
import { gsap } from "gsap";
import styles from "./PhotoCard.module.css";

export default function PhotoCard() {
  const tiltRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const magneticRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tiltEl = tiltRef.current;
    const floatEl = floatRef.current;
    if (!tiltEl || !floatEl) return;

    VanillaTilt.init(tiltEl, {
      max: 5,
      speed: 600,
      glare: false,
      scale: 1.02,
      perspective: 1000,
      easing: "cubic-bezier(0.03,0.98,0.52,0.99)",
    });

    gsap.to(floatEl, {
      y: -6,
      duration: 4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      (tiltEl as any).vanillaTilt?.destroy();
      gsap.killTweensOf(floatEl);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = magneticRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);

    const moveX = (x - rect.width / 2) * 0.06;
    const moveY = (y - rect.height / 2) * 0.06;

    gsap.to(card, {
      x: moveX,
      y: moveY,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = magneticRef.current;
    if (!card) return;
    gsap.to(card, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, []);

  return (
    <div ref={floatRef} className={styles.floatWrap}>
      <div
        ref={magneticRef}
        className={styles.magneticWrap}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={tiltRef} className={styles.card}>
          <div className={styles.bg} aria-hidden="true" />
          <div className={styles.bgAccent} aria-hidden="true" />
          <div className={styles.cursorLight} aria-hidden="true" />
          <div className={styles.imgWrap}>
            <Image
              src="/portfolio.png"
              alt="Bernard Mutambo"
              fill
              sizes="(min-width: 1024px) 380px, 0px"
              className={styles.img}
              priority
            />
          </div>
          <div className={styles.nameTag}>
            <span className={styles.name}>Bernard Mutambo</span>
            <span className={styles.role}>Frontend Developer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
