"use client";

import { useVideoReadyGate } from "@/hooks/useVideoReadyGate";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

type MobileProjectIntroProps = {
  projectIndex: number;
  title: string;
  description: string;
  videoSrc: string;
  onGateActiveChange?: (active: boolean) => void;
};

export default function MobileProjectIntro({
  projectIndex,
  title,
  description,
  videoSrc,
  onGateActiveChange,
}: MobileProjectIntroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<ScrollTrigger | null>(null);
  const [gateEngaged, setGateEngaged] = useState(false);

  const { progress, ready, error, timedOut, allowContinue } = useVideoReadyGate(
    videoSrc,
    true,
  );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const engaged =
          Boolean(entry?.isIntersecting) &&
          (entry?.intersectionRatio ?? 0) >= 0.35;
        setGateEngaged(engaged);
      },
      { threshold: [0, 0.35, 0.55, 0.75] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onGateActiveChange?.(gateEngaged && !allowContinue);
  }, [gateEngaged, allowContinue, onGateActiveChange]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    pinRef.current?.kill();
    pinRef.current = null;

    if (!gateEngaged || allowContinue) {
      ScrollTrigger.refresh();
      return;
    }

    pinRef.current = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=2400",
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
    });

    return () => {
      pinRef.current?.kill();
      pinRef.current = null;
    };
  }, [gateEngaged, allowContinue]);

  const statusLabel = error
    ? "Connection issue — continue when ready"
    : ready
      ? "Ready"
      : timedOut
        ? "Continue scrolling"
        : "Preparing visual experience";

  const progressPct = Math.round(progress * 100);

  return (
    <section
      ref={sectionRef}
      className={`mobile-project-intro${gateEngaged && !allowContinue ? " mobile-project-intro--gated" : ""}${allowContinue ? " mobile-project-intro--ready" : ""}`}
      style={{ minHeight: allowContinue ? "115vh" : "100vh" }}
      data-mobile-project-index={projectIndex}
      data-mobile-journey-section="intro"
      aria-label={`Introduction — ${title}`}
    >
      <div className="mobile-project-intro__inner">
        <p className="mobile-project-intro__eyebrow">Residence</p>
        <h2 className="mobile-project-intro__title">{title}</h2>
        <p className="mobile-project-intro__description">{description}</p>

        <div className="mobile-project-intro__gate" aria-live="polite">
          <div
            className="mobile-project-intro__gate-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            aria-label="Video preparation progress"
          >
            <span
              className="mobile-project-intro__gate-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p
            className={`mobile-project-intro__preparing${ready ? " mobile-project-intro__preparing--ready" : ""}${error ? " mobile-project-intro__preparing--error" : ""}`}
          >
            {!ready && !error && !timedOut && (
              <span className="mobile-project-intro__preparing-line" aria-hidden />
            )}
            {statusLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
