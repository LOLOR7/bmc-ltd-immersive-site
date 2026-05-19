"use client";

import { preloadMobileVideo } from "@/lib/preload-mobile-video";
import { useEffect, useRef } from "react";

type MobileProjectIntroProps = {
  projectIndex: number;
  title: string;
  description: string;
  videoSrc: string;
};

export default function MobileProjectIntro({
  projectIndex,
  title,
  description,
  videoSrc,
}: MobileProjectIntroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            preloadMobileVideo(videoSrc);
          }
        }
      },
      { rootMargin: "40% 0px", threshold: 0.05 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [videoSrc]);

  return (
    <section
      ref={sectionRef}
      className="mobile-project-intro"
      style={{ minHeight: "115vh" }}
      data-mobile-project-index={projectIndex}
      data-mobile-journey-section="intro"
      aria-label={`Introduction — ${title}`}
    >
      <div className="mobile-project-intro__inner">
        <p className="mobile-project-intro__eyebrow">Residence</p>
        <h2 className="mobile-project-intro__title">{title}</h2>
        <p className="mobile-project-intro__description">{description}</p>
        <p className="mobile-project-intro__preparing">
          <span className="mobile-project-intro__preparing-line" aria-hidden />
          Preparing visual experience
        </p>
      </div>
    </section>
  );
}
