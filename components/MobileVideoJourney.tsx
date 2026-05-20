"use client";

import FinalSection from "@/components/FinalSection";
import MobileLoadMore from "@/components/MobileLoadMore";
import MobileProjectIntro from "@/components/MobileProjectIntro";
import MobileProjectProgress from "@/components/MobileProjectProgress";
import VideoScrollExperience from "@/components/VideoScrollExperience";
import { MOBILE_VIDEO_PROJECTS } from "@/lib/mobile-video-projects";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useState } from "react";

/**
 * Progressive disclosure batches for mobile only:
 *   - INITIAL_VISIBLE projects mount on first render
 *   - LOAD_MORE_STEP additional projects mount per "Load more" click
 * Total batches with 5 projects: 2 → 4 → 5 (FinalSection follows).
 *
 * The goal is to keep <video> / ScrollTrigger / IntersectionObserver
 * pressure low on weak Safari/iOS — non-visible projects are NOT mounted
 * (zero DOM, zero observers, zero gates), so the lazy strict prev/active/
 * next window naturally clamps to the visible slice as well.
 */
const INITIAL_VISIBLE = 2;
const LOAD_MORE_STEP = 2;

export default function MobileVideoJourney() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [gateLoadingIndex, setGateLoadingIndex] = useState<number | null>(null);
  const [unlockedProjects, setUnlockedProjects] = useState<Set<number>>(
    () => new Set(),
  );
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const totalProjects = MOBILE_VIDEO_PROJECTS.length;
  const visibleProjects = MOBILE_VIDEO_PROJECTS.slice(0, visibleCount);
  const hasMore = visibleCount < totalProjects;
  const remaining = totalProjects - visibleCount;

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
    // Note: no ScrollTrigger.refresh() here. With the intro `minHeight`
    // now fixed at 100vh across the unlock transition, no layout shifts,
    // so the existing triggers' cached start/end positions stay valid.
    // The next-video's own VideoScrollExperience effect already calls
    // ScrollTrigger.refresh() inside `bindScroll()` when its trigger is
    // created. Refreshing here was the secondary cause of the micro
    // jump because `invalidateOnRefresh: true` on the previous video's
    // scrub could nudge `video.currentTime` mid-transition.
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const next = Math.min(totalProjects, prev + LOAD_MORE_STEP);
      if (next === prev) return prev;
      /**
       * Defer ScrollTrigger.refresh until after the new sections have
       * committed and painted. Double rAF guarantees the layout pass has
       * run so any newly-mounted scrub triggers can compute correct
       * start/end positions. Safe here (no active gate, no scroll lock,
       * no engaged scrub being nudged), unlike the previous `handleUnlocked`
       * site which we deliberately stripped of refresh().
       */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });
      return next;
    });
  }, [totalProjects]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      "[data-mobile-project-index]",
    );
    if (sections.length === 0) return;

    /**
     * Composite key tracker — intro-i and video-i share the same
     * `data-mobile-project-index` value, which previously caused a race
     * inside a single IO callback batch: ratios.delete(i) for the exiting
     * intro could wipe out the ratios.set(i) issued for the still-visible
     * video (entry order is not guaranteed). This made activeIndex
     * oscillate during the intro-N → video-N → intro-N+1 transition and
     * stuck the Bekish gate on a flicker. Tracking by element identity
     * (`${section-type}:${index}`) decouples the two and keeps the index
     * derivation correct.
     *
     * Effect re-runs on `visibleCount` change so newly-mounted batch
     * sections are observed too. Disconnecting the previous observer is
     * safe because all sections are re-queried on the next pass.
     */
    type RatioEntry = { index: number; ratio: number };
    const ratios = new Map<string, RatioEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const index = Number(target.dataset.mobileProjectIndex);
          const sectionType =
            target.dataset.mobileJourneySection ?? "unknown";
          if (!Number.isFinite(index)) continue;
          const key = `${sectionType}:${index}`;
          if (entry.isIntersecting) {
            ratios.set(key, { index, ratio: entry.intersectionRatio });
          } else {
            ratios.delete(key);
          }
        }
        if (ratios.size === 0) return;
        let bestIndex: number | null = null;
        let bestRatio = -1;
        for (const { index: idx, ratio } of ratios.values()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = idx;
          }
        }
        if (bestIndex === null) return;
        const next = bestIndex;
        setActiveIndex((prev) => (prev === next ? prev : next));
      },
      {
        threshold: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85],
      },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleCount]);

  return (
    <>
      <MobileProjectProgress
        activeIndex={activeIndex}
        isGateLoading={gateLoadingIndex === activeIndex}
      />
      {visibleProjects.map((project) => {
        const isUnlocked = unlockedProjects.has(project.index);
        /**
         * Lazy strict — load video src only for prev / active / next
         * (max 3 simultaneous <video src> on mobile). Was previously 5
         * visible + 5 hidden = 10 elements racing for bandwidth.
         */
        const shouldLoadVideo =
          project.index >= activeIndex - 1 && project.index <= activeIndex + 1;
        /**
         * Hysteresis-aware prepare flag (post-regression fix):
         *   - active project           → enabled
         *   - next project             → enabled (head start for the gate)
         *   - already-unlocked project → disabled (no need to keep prepping)
         * Tolerates transient activeIndex flips so the hidden video does
         * not get destroyed mid-gate and the gate stays subscribed across
         * intersection noise. Max 2 hidden prepares at a time.
         */
        const shouldPrepareVideo =
          !isUnlocked &&
          (project.index === activeIndex ||
            project.index === activeIndex + 1);

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
      {hasMore ? (
        <MobileLoadMore remaining={remaining} onLoadMore={handleLoadMore} />
      ) : (
        <FinalSection />
      )}
    </>
  );
}
