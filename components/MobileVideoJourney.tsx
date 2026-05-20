"use client";

import FinalSection from "@/components/FinalSection";
import MobileLoadMore from "@/components/MobileLoadMore";
import MobileProjectIntro from "@/components/MobileProjectIntro";
import MobileProjectProgress from "@/components/MobileProjectProgress";
import VideoScrollExperience from "@/components/VideoScrollExperience";
import { acquireMobileVideoPrepare } from "@/lib/mobile-video-readiness";
import { MOBILE_VIDEO_PROJECTS } from "@/lib/mobile-video-projects";
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
    setVisibleCount((prev) => Math.min(totalProjects, prev + LOAD_MORE_STEP));
    // Note: no ScrollTrigger.refresh() here. Each newly-mounted
    // `VideoScrollExperience` calls its own `ScrollTrigger.refresh()`
    // inside `bindScroll()` once its video metadata is ready, and the
    // existing triggers above the button are unaffected by content
    // appended below them (their cached start/end positions stay
    // valid). An external refresh also risks amplifying the perceived
    // micro-jump on iOS Safari at the exact moment the button is
    // replaced by full-sized intro/video sections (same lesson as the
    // `handleUnlocked` fix).
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

  /**
   * Anticipatory prepare of the FIRST project of the next batch —
   * geometric variant.
   *
   * Why this exists: progressive disclosure intentionally leaves later
   * projects unmounted until the user clicks "Explore more residences",
   * which keeps initial mobile pressure low (only 2 <video> elements +
   * 2 ScrollTriggers + 2 gates on first paint). Side effect: the first
   * project of each new batch has zero buffering head start at click
   * time — its <video src> only attaches AT mount, so on weak networks
   * the gate engages while the first range request is still in flight,
   * which the user reads as a micro freeze / mini chargement.
   *
   * Previous iteration used `activeIndex >= visibleCount - 1` as the
   * trigger (i.e. fire prep once Bekish becomes the IO-highest-ratio
   * section, around scrollY ≈ 500vh). That removed the cold-mount stall
   * but Adma 527 still showed a ~0.5s residual delay on weak networks
   * because the head start was capped at ~500vh of scrolling before the
   * Load More click — only a few seconds on fast finger flicks.
   *
   * This version listens for the LAST visible project wrapper entering
   * an EXPANDED root (viewport + 100% bottom rootMargin) via a dedicated
   * IntersectionObserver. With each project section being ~500vh tall,
   * the Bekish wrapper (body 500–1000vh for batch 1) crosses the
   * expanded root at scrollY ≈ 300vh — i.e. 60% through the Adma Cliff
   * scrub, 200vh earlier than the previous trigger. Head start grows
   * from ~500vh to ~700vh of scrolling, ~+2-3s on typical mobile scroll
   * speed, enough to absorb the residual stall.
   *
   * Why observe the project wrapper rather than the Load More button:
   * with ~500vh per project, observing the button (at body ~1000vh for
   * batch 1) would require rootMargin ≥ 400% to fire earlier than the
   * activeIndex signal — geometrically equivalent to observing the last
   * project wrapper with rootMargin 100% but far less legible. The
   * wrapper-based anchor expresses the same signal directly: "user is
   * approaching the end of the current batch".
   *
   * Invariants preserved:
   *   - Exactly ONE anticipatory hidden prepare in flight (no mount, no
   *     gate, no ScrollTrigger for later projects before their click).
   *   - The hidden <video> + <link rel="preload"> are the only DOM
   *     additions — same lightweight mechanism the gates already use
   *     internally for in-batch transitions.
   *   - Subscription is kept alive until visibleCount changes or hasMore
   *     flips. When the new intro eventually mounts on Load More click,
   *     its own useVideoReadyGate `subscribe` joins the already-warm
   *     entry by URL (entries are keyed by resolved href).
   *
   * Timing in practice:
   *   - visibleCount=2 (initial): anchor on Bekish wrapper, fires at
   *     scrollY ≈ 300vh → warms Adma 527 (next slot).
   *   - visibleCount=4 (after click 1): anchor on Adma 514 wrapper,
   *     fires roughly mid-Adma 527 scrub → warms Dusk.
   *   - visibleCount=5 (after click 2): hasMore=false, no anticipatory
   *     work (FinalSection has no video).
   */
  useEffect(() => {
    if (!hasMore) return;
    const nextProject = MOBILE_VIDEO_PROJECTS[visibleCount];
    if (!nextProject) return;
    const anchor = document.querySelector<HTMLElement>(
      "[data-mobile-prefetch-anchor='true']",
    );
    if (!anchor) return;

    let cleanup: (() => void) | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (cleanup) return; /* idempotent — already started */
        const { subscribe } = acquireMobileVideoPrepare(
          nextProject.videoSrc,
        );
        cleanup = subscribe(() => {
          /* hold the entry alive; snapshot updates not consumed here */
        });
      },
      { rootMargin: "0px 0px 100% 0px" },
    );
    observer.observe(anchor);

    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, [visibleCount, hasMore]);

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
        /**
         * Geometric anchor for the next-batch anticipatory prepare (see
         * the dedicated `useEffect` below). Tagged on the LAST visible
         * project wrapper while `hasMore` is true so an IO with bottom
         * `rootMargin` can fire prep as the user APPROACHES the end of
         * the current batch — not only once they have reached it.
         */
        const isPrefetchAnchor =
          hasMore && project.index === visibleCount - 1;

        return (
          <div
            key={project.slug}
            data-mobile-prefetch-anchor={
              isPrefetchAnchor ? "true" : undefined
            }
          >
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
