"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "@/components/Preloader";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ErrorBoundary from "@/components/ErrorBoundary";
import SectionSkeleton from "@/components/ui/SectionSkeleton";
import { CustomCursor, ScrollProgress } from "@/components/ui";

const AboutSection    = dynamic(() => import("@/components/AboutSection"),    { loading: () => <SectionSkeleton /> });
const ProjectsSection = dynamic(() => import("@/components/ProjectsSection"), { loading: () => <SectionSkeleton /> });
const SkillsSection   = dynamic(() => import("@/components/SkillsSection"),   { loading: () => <SectionSkeleton /> });
const ContactSection  = dynamic(() => import("@/components/ContactSection"),  { loading: () => <SectionSkeleton /> });

export default function Home() {
  const [loadingState, setLoadingState] = useState<boolean | null>(null);

  useEffect(() => {
    const visited = localStorage.getItem("hasVisited");
    setLoadingState(visited ? false : true);
  }, []);

  useEffect(() => {
    if (loadingState !== false) return;

    gsap.registerPlugin(ScrollTrigger);

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.globalTimeline.clear();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    (window as any).__lenis = lenis;

    const handleLenisScroll = ({ scroll }: { scroll: number }) => {
      window.dispatchEvent(
        new CustomEvent("lenis.scroll", { detail: { scroll } })
      );
      ScrollTrigger.update();
    };

    lenis.on("scroll", handleLenisScroll);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const stopLenis = () => lenis.stop();
    const startLenis = () => lenis.start();
    window.addEventListener("modal:open", stopLenis);
    window.addEventListener("modal:close", startLenis);

    requestAnimationFrame(() => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    });

    return () => {
      lenis.off("scroll", handleLenisScroll);
      gsap.ticker.remove(tickerFn);
      window.removeEventListener("modal:open", stopLenis);
      window.removeEventListener("modal:close", startLenis);
      delete (window as any).__lenis;
      lenis.destroy();
    };
  }, [loadingState]);

  if (loadingState === null) return null;

  const handlePreloaderComplete = () => {
    setLoadingState(false);
  };

  if (loadingState) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <Navigation />
      <main>
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <AboutSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ProjectsSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <SkillsSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ContactSection />
        </ErrorBoundary>
      </main>
    </>
  );
}