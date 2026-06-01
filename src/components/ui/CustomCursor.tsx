"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { hasFinePointer, shouldUseLightEffects } from "@/lib/performance";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || !hasFinePointer() || shouldUseLightEffects());
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;

    if (!cursor || !follower) return;

    const cursorX = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power2.out" });
    const cursorY = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power2.out" });
    const followerX = gsap.quickTo(follower, "x", { duration: 0.28, ease: "power2.out" });
    const followerY = gsap.quickTo(follower, "y", { duration: 0.28, ease: "power2.out" });

    const moveCursor = (e: MouseEvent) => {
      cursorX(e.clientX);
      cursorY(e.clientY);
      followerX(e.clientX);
      followerY(e.clientY);
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, { scale: 1.5, duration: 0.3 });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3 });
    };

    window.addEventListener("mousemove", moveCursor);

    const interactives = document.querySelectorAll("a, button, .interactive");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <div ref={cursorRef} className={styles.cursor} />
      <div ref={followerRef} className={styles.follower} />
    </>
  );
}
