"use client";

import MobileProjectIntro from "@/components/MobileProjectIntro";
import MobileProjectProgress from "@/components/MobileProjectProgress";
import VideoScrollExperience from "@/components/VideoScrollExperience";
import { MOBILE_VIDEO_PROJECTS } from "@/lib/mobile-video-projects";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useState } from "react";

export default function MobileVideoJourney() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [gateLoadingIndex, setGateLoadingIndex] = useState<number | null>(null);
  const [unlockedProjects, setUnlockedProjects] = useState<Set<number>>(
    () => new Set(),
  );

  const handleGateActiveChange = useCallback(
    (projectIndex: number, active: boolean) => {
      setGateLoadingIndex((prev) => {
        if (active) return projectIndex;
        return prev === projectIndex ? null : prev;
      });
    },
    [],
  );

  const handleUnlocked = useCallback((projectIndex: number) => {
    setUnlockedProjects((prev) => {
      if (prev.has(projectIndex)) return prev;
      const next = new Set(prev);
      next.add(projectIndex);
      return next;
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

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
      {MOBILE_VIDEO_PROJECTS.map((project) => {
        const isUnlocked = unlockedProjects.has(project.index);
        /**
         * Lazy strict — load video src only for prev / active / next
         * (max 3 simultaneous <video src> on mobile). Was previously 5
         * visible + 5 hidden = 10 elements racing for bandwidth.
         */
        const shouldLoadVideo =
          project.index >= activeIndex - 1 && project.index <= activeIndex + 1;
        /**
         * Hidden gate prepare — only for the active project (max 1 at a
         * time). The visible video for next/prev still preloads via the
         * lazy <video> above, so when user reaches next intro, gate
         * readiness fires fast via Safari's HTTP cache.
         */
        const shouldPrepareVideo = project.index === activeIndex;

        return (
          <div key={project.slug}>
            <MobileProjectIntro
              projectIndex={project.index}
              title={project.title}
              description={project.introDescription}
              videoSrc={project.videoSrc}
              shouldPrepareVideo={shouldPrepareVideo}
              onGateActiveChange={(active) =>
                handleGateActiveChange(project.index, active)
              }
              onUnlocked={() => handleUnlocked(project.index)}
            />
            <div
              data-mobile-project-index={project.index}
              data-mobile-journey-section="video"
              {...(!isUnlocked ? { inert: true as const } : {})}
            >
              <VideoScrollExperience
                config={project.config}
                videoSrc={project.videoSrc}
                shouldLoadVideo={shouldLoadVideo}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
