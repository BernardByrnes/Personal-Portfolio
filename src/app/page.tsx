"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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
import { shouldUseLightEffects } from "@/lib/performance";

const AboutSection    = dynamic(() => import("@/components/AboutSection"),    { loading: () => <SectionSkeleton /> });
const ProjectsSection = dynamic(() => import("@/components/ProjectsSection"), { loading: () => <SectionSkeleton /> });
const SkillsSection   = dynamic(() => import("@/components/SkillsSection"),   { loading: () => <SectionSkeleton /> });
const ContactSection  = dynamic(() => import("@/components/ContactSection"),  { loading: () => <SectionSkeleton /> });

function DeferredSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin: "900px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <div ref={ref}>
      {ready ? children : <SectionSkeleton />}
    </div>
  );
}

export default function Home() {
  const [loadingState, setLoadingState] = useState(true);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fallback = window.setTimeout(() => {
      setHeroReady(true);
    }, 5000);

    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (loadingState !== false) return;

    gsap.registerPlugin(ScrollTrigger);
    const lightEffects = shouldUseLightEffects();

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.globalTimeline.clear();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      return;
    }

    if (lightEffects) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
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

  const handlePreloaderComplete = useCallback(() => {
    setLoadingState(false);
  }, []);

  const handleHeroReady = useCallback(() => {
    setHeroReady(true);
  }, []);

  return (
    <>
      {loadingState && (
        <Preloader isReady={heroReady} onComplete={handlePreloaderComplete} />
      )}
      <CustomCursor />
      <ScrollProgress />
      <Navigation />
      <main>
        <ErrorBoundary>
          <HeroSection onReady={handleHeroReady} />
        </ErrorBoundary>
        <ErrorBoundary>
          <DeferredSection>
            <AboutSection />
          </DeferredSection>
        </ErrorBoundary>
        <ErrorBoundary>
          <DeferredSection>
            <ProjectsSection />
          </DeferredSection>
        </ErrorBoundary>
        <ErrorBoundary>
          <DeferredSection>
            <SkillsSection />
          </DeferredSection>
        </ErrorBoundary>
        <ErrorBoundary>
          <DeferredSection>
            <ContactSection />
          </DeferredSection>
        </ErrorBoundary>
      </main>
    </>
  );
}
