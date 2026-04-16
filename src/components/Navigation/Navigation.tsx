"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NAV_ITEMS, PORTFOLIO } from "@/lib/constants";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Nav entrance
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.4 }
    );

    ScrollTrigger.create({
      start: "top -80",
      onUpdate: (self) => setIsScrolled(self.progress > 0),
    });

    const sections = document.querySelectorAll("section[id]");
    const observers = Array.from(sections).map((section) => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(`#${section.id}`); },
        { rootMargin: "-40% 0px -40% 0px" }
      );
      observer.observe(section);
      return observer;
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Drawer open/close animation
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    if (menuOpen) {
      gsap.fromTo(
        drawer,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" }
      );
      // Stagger links
      const links = drawer.querySelectorAll("a");
      gsap.fromTo(
        links,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.07, ease: "power2.out", delay: 0.15 }
      );
      document.body.style.overflow = "hidden";
    } else {
      gsap.to(drawer, {
        x: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      });
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "#") return;
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`${styles.nav} ${isScrolled ? styles.scrolled : ""}`}
      >
        <a href="#" className={styles.logo} onClick={(e) => handleNavClick(e, "#")}>
          {PORTFOLIO.name.split(" ")[0]}
          <span className={styles.logoDot}>.</span>
        </a>

        {/* Desktop links */}
        <ul className={styles.links}>
          {NAV_ITEMS.filter((item) => item.href !== "#").map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`${styles.link} ${activeSection === item.href ? styles.active : ""}`}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.navRight}>
          <a 
            href="#contact" 
            className={styles.ctaBtn}
            onClick={(e) => handleNavClick(e, "#contact")}
          >
            Hire Me
          </a>

          {/* Hamburger — mobile only */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        className={styles.drawer}
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerInner}>
          <ul className={styles.drawerLinks}>
            {NAV_ITEMS.filter((item) => item.href !== "#").map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`${styles.drawerLink} ${activeSection === item.href ? styles.active : ""}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a 
            href="#contact" 
            className={styles.drawerCta}
            onClick={(e) => handleNavClick(e, "#contact")}
          >
            Hire Me
          </a>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
