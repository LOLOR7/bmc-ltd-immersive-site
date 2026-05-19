"use client";

import MobileProjectIntro from "@/components/MobileProjectIntro";
import MobileProjectProgress from "@/components/MobileProjectProgress";
import VideoScrollExperience from "@/components/VideoScrollExperience";
import { MOBILE_VIDEO_PROJECTS } from "@/lib/mobile-video-projects";
import { useCallback, useEffect, useState } from "react";

export default function MobileVideoJourney() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [gateLoadingIndex, setGateLoadingIndex] = useState<number | null>(null);

  const handleGateActiveChange = useCallback(
    (projectIndex: number, active: boolean) => {
      setGateLoadingIndex((prev) => {
        if (active) return projectIndex;
        return prev === projectIndex ? null : prev;
      });
    },
    [],
  );

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      "[data-mobile-project-index]",
    );
    if (sections.length === 0) return;

    const ratios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            (entry.target as HTMLElement).dataset.mobileProjectIndex,
          );
          if (!Number.isFinite(index)) continue;
          if (entry.isIntersecting) {
            ratios.set(index, entry.intersectionRatio);
          } else {
            ratios.delete(index);
          }
        }
        if (ratios.size === 0) return;
        let bestIndex = 0;
        let bestRatio = -1;
        for (const [idx, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = idx;
          }
        }
        setActiveIndex((prev) => (prev === bestIndex ? prev : bestIndex));
      },
      {
        threshold: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85],
      },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <MobileProjectProgress
        activeIndex={activeIndex}
        isGateLoading={gateLoadingIndex === activeIndex}
      />
      {MOBILE_VIDEO_PROJECTS.map((project) => (
        <div key={project.slug}>
          <MobileProjectIntro
            projectIndex={project.index}
            title={project.title}
            description={project.introDescription}
            videoSrc={project.videoSrc}
            onGateActiveChange={(active) =>
              handleGateActiveChange(project.index, active)
            }
          />
          <div
            data-mobile-project-index={project.index}
            data-mobile-journey-section="video"
          >
            <VideoScrollExperience
              config={project.config}
              videoSrc={project.videoSrc}
            />
          </div>
        </div>
      ))}
    </>
  );
}
