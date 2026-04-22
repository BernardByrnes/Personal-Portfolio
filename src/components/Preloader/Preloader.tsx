"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PORTFOLIO } from "@/lib/constants";
import styles from "./Preloader.module.css";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("LOADING");
  const contentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    const counter = { value: 0 };

    tl.to(
      counter,
      {
        value: 95,
        duration: 2.4,
        ease: "power1.inOut",
        onUpdate: () => {
          setProgress(Math.floor(counter.value));
        },
      },
      0.6
    );

    tl.to(
      counter,
      {
        value: 100,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: () => {
          setProgress(Math.floor(counter.value));
        },
        onComplete: () => {
          setStatus("READY");
        },
      },
      3.0
    );

    tl.to(
      contentRef.current,
      {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: onComplete,
      },
      3.4
    );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

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