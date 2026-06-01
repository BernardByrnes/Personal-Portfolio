"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PORTFOLIO } from "@/lib/constants";
import styles from "./Preloader.module.css";

interface PreloaderProps {
  isReady: boolean;
  onComplete: () => void;
}

export default function Preloader({ isReady, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("LOADING");
  const contentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef({ value: 0 });
  const completedRef = useRef(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introDuration = reducedMotion ? 0.15 : 0.35;
    const countDuration = reducedMotion ? 0.35 : 1.1;
    const tl = gsap.timeline();
    startTimeRef.current = performance.now();

    tl.fromTo(
      contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: introDuration, ease: "power2.out" }
    );

    tl.to(
      counterRef.current,
      {
        value: 92,
        duration: countDuration,
        ease: "power1.inOut",
        onUpdate: () => {
          setProgress(Math.floor(counterRef.current.value));
        },
      },
      introDuration
    );

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!isReady || completedRef.current) return;

    completedRef.current = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minimumVisibleMs = reducedMotion ? 550 : 1350;
    const outroDuration = reducedMotion ? 0.2 : 0.45;
    const elapsed = performance.now() - startTimeRef.current;
    const delay = Math.max(0, minimumVisibleMs - elapsed) / 1000;
    const tl = gsap.timeline({ delay });

    tl.to(
      counterRef.current,
      {
        value: 100,
        duration: 0.25,
        ease: "power2.out",
        onUpdate: () => {
          setProgress(Math.floor(counterRef.current.value));
        },
        onComplete: () => {
          setStatus("READY");
        },
      },
    );

    tl.to(
      contentRef.current,
      {
        opacity: 0,
        duration: outroDuration,
        ease: "power2.inOut",
        onComplete: onComplete,
      },
      "+=0.1"
    );

    return () => {
      tl.kill();
    };
  }, [isReady, onComplete]);

  return (
    <div className={styles.preloader}>
      <div ref={contentRef} className={styles.content}>
        <h1 className={styles.name}>{PORTFOLIO.name}</h1>
        <div className={styles.progress}>
          <div
            ref={progressBarRef}
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
          <span className={styles.percentage}>{progress}%</span>
        </div>
        <p className={styles.status}>{status}</p>
      </div>
    </div>
  );
}
