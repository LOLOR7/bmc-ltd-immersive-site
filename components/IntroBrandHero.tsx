"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

/** Cream recolor of client PNG — RGB only, alpha unchanged */
const BMC_LOGO_SRC = "/assets/bmc-logo-client-cream.png?v=1";

const INTRO_HEIGHT_VH = 100;

/** Minimal architectural plan strokes — drawn on load */
const PLAN_PATHS = [
  "M 120 420 L 1080 420",
  "M 120 420 L 120 180 L 480 180",
  "M 480 180 L 480 420",
  "M 480 260 L 720 260 L 720 420",
  "M 720 180 L 1080 180 L 1080 420",
  "M 120 420 L 120 620 L 360 620",
  "M 360 620 L 360 520 L 600 520 L 600 620",
  "M 600 520 L 600 420",
  "M 600 620 L 840 620 L 840 420",
  "M 840 620 L 1080 620 L 1080 420",
  "M 240 180 L 240 120 L 960 120 L 960 180",
  "M 300 620 L 300 700 L 900 700 L 900 620",
  "M 180 320 L 1020 320",
  "M 180 500 L 1020 500",
  "M 540 180 L 540 120",
  "M 780 260 L 900 260",
];

export default function IntroBrandHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const logoBlockRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const stage = stageRef.current;
    const svg = linesRef.current;
    const logoBlock = logoBlockRef.current;
    const scrollHint = scrollHintRef.current;

    if (!section || !stage || !svg || !logoBlock || !scrollHint) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const paths = svg.querySelectorAll<SVGPathElement>(".plan-stroke");

    gsap.set(logoBlock, { opacity: 0, y: 24, scale: 0.98 });
    gsap.set(scrollHint, { opacity: 0, y: 8 });
    gsap.set(stage, { opacity: 1 });

    paths.forEach((path) => {
      const len = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: len,
        strokeDashoffset: len,
        opacity: 0.35,
      });
    });

    const ctx = gsap.context(() => {
      const enterTl = gsap.timeline({ delay: 0.2 });

      enterTl.to(logoBlock, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: reducedMotion ? 0.5 : 1.4,
        ease: "power3.out",
      });

      enterTl.to(
        scrollHint,
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? 0.35 : 0.9,
          ease: "power2.out",
        },
        "-=0.7",
      );

      if (!reducedMotion) {
        paths.forEach((path, i) => {
          enterTl.to(
            path,
            {
              strokeDashoffset: 0,
              opacity: 0.38,
              duration: 1.8,
              ease: "power2.inOut",
            },
            0.15 + i * 0.06,
          );
        });
      } else {
        gsap.set(paths, { strokeDashoffset: 0, opacity: 0.32 });
      }

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: reducedMotion ? 0.35 : 0.9,
        },
      });

      scrollTl.to(
        logoBlock,
        { opacity: 0, y: -48, ease: "power2.in" },
        0,
      );
      scrollTl.to(scrollHint, { opacity: 0, y: -16 }, 0);
      scrollTl.to(paths, { opacity: 0, duration: 0.4 }, 0);
    }, section);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="brand-intro"
      style={{ height: `${INTRO_HEIGHT_VH}vh` }}
      aria-label="BMC brand introduction"
    >
      <div ref={stageRef} className="brand-intro__stage">
        <div className="brand-intro__vignette" aria-hidden="true" />

        <svg
          ref={linesRef}
          className="brand-intro__lines"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {PLAN_PATHS.map((d, i) => (
            <path
              key={i}
              className="plan-stroke"
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div ref={logoBlockRef} className="brand-intro__center">
          <div className="brand-intro__logo-wrap">
            <img
              src={BMC_LOGO_SRC}
              alt="BMC Developments S.A.L"
              width={640}
              height={384}
              decoding="async"
              draggable={false}
              className="brand-intro__logo"
            />
          </div>
          <p className="brand-intro__tagline">Construction and Development</p>
        </div>

        <div ref={scrollHintRef} className="brand-intro__scroll">
          <div className="brand-intro__scroll-rod" aria-hidden="true">
            <span className="brand-intro__scroll-track" />
            <span className="brand-intro__scroll-dot" />
          </div>
          <span className="brand-intro__scroll-text">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}
