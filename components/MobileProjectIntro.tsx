"use client";

import { useVideoReadyGate } from "@/hooks/useVideoReadyGate";
import { lockMobileScroll } from "@/lib/mobile-scroll-lock";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MobileProjectIntroProps = {
  projectIndex: number;
  title: string;
  description: string;
  videoSrc: string;
  /**
   * Lazy-prep flag from the parent journey. When false, the gate hook does
   * not subscribe → no hidden <video> is created for this project. Flips
   * true when the project becomes active (and optionally the very next one).
   */
  shouldPrepareVideo: boolean;
  onGateActiveChange?: (active: boolean) => void;
  onUnlocked?: () => void;
};

function IntroContent({
  title,
  description,
  progressPct,
  statusLabel,
  ready,
  error,
  showContinueAnyway,
  onContinueAnyway,
}: {
  title: string;
  description: string;
  progressPct: number;
  statusLabel: string;
  ready: boolean;
  error: boolean;
  showContinueAnyway: boolean;
  onContinueAnyway?: () => void;
}) {
  return (
    <>
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
          {!ready && !error && (
            <span className="mobile-project-intro__preparing-line" aria-hidden />
          )}
          {statusLabel}
        </p>
        {showContinueAnyway && onContinueAnyway && (
          <button
            type="button"
            className="mobile-project-intro__continue-btn"
            onClick={onContinueAnyway}
          >
            Continue anyway
          </button>
        )}
      </div>
    </>
  );
}

export default function MobileProjectIntro({
  projectIndex,
  title,
  description,
  videoSrc,
  shouldPrepareVideo,
  onGateActiveChange,
  onUnlocked,
}: MobileProjectIntroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [gateEngaged, setGateEngaged] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [manualContinue, setManualContinue] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { progress, ready, error, allowContinue, showContinueAnyway } =
    useVideoReadyGate(videoSrc, shouldPrepareVideo, manualContinue);

  const shouldGate = gateEngaged && !hasUnlocked && !allowContinue;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hasUnlocked) return;

    /**
     * Engagement criterion (final): only when the intro section has
     * scrolled to fill the viewport — its top is at or above the viewport
     * top. Both the underlying section and the overlay center their
     * content; aligning their positions eliminates the "page remonte"
     * perceived jump (ratio 0.7 left a 30vh mismatch). A small 5vh
     * tolerance is allowed so fast scrolls do not miss the engagement.
     * The ratio >= 0.95 fallback catches the case where intro height ever
     * exceeds the viewport (e.g. taller devices / dynamic content).
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const rect = entry.boundingClientRect;
        const viewportH = window.innerHeight;
        const engaged =
          entry.isIntersecting &&
          (rect.top <= viewportH * 0.05 ||
            entry.intersectionRatio >= 0.95);
        setGateEngaged(engaged);
      },
      { threshold: [0, 0.5, 0.9, 0.95, 1] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasUnlocked]);

  useEffect(() => {
    onGateActiveChange?.(shouldGate);
  }, [shouldGate, onGateActiveChange]);

  useEffect(() => {
    if (!shouldGate) return;
    const unlockScroll = lockMobileScroll();

    const blockTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(".mobile-project-gate-overlay")) return;
      event.preventDefault();
    };

    document.addEventListener("touchmove", blockTouch, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockTouch);
      unlockScroll();
    };
  }, [shouldGate]);

  useEffect(() => {
    if (allowContinue && gateEngaged && !hasUnlocked) {
      setHasUnlocked(true);
      onUnlocked?.();
    }
  }, [allowContinue, gateEngaged, hasUnlocked, onUnlocked]);

  const handleContinueAnyway = useCallback(() => {
    setManualContinue(true);
    setHasUnlocked(true);
    onUnlocked?.();
  }, [onUnlocked]);

  const statusLabel = error
    ? "Connection issue — you may continue"
    : ready
      ? "Ready — continue scrolling"
      : showContinueAnyway
        ? "Still preparing…"
        : "Preparing visual experience";

  const progressPct = Math.round(progress * 100);

  const overlay =
    shouldGate && mounted
      ? createPortal(
          <div
            className="mobile-project-gate-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={`Preparing ${title}`}
          >
            <div className="mobile-project-intro__inner mobile-project-gate-overlay__inner">
              <IntroContent
                title={title}
                description={description}
                progressPct={progressPct}
                statusLabel={statusLabel}
                ready={ready}
                error={error}
                showContinueAnyway={showContinueAnyway}
                onContinueAnyway={handleContinueAnyway}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {overlay}
      <section
        ref={sectionRef}
        className={`mobile-project-intro${hasUnlocked ? " mobile-project-intro--ready" : ""}`}
        // Height MUST stay constant across the unlock transition. A previous
        // `hasUnlocked ? 115vh : 100vh` caused a 7.5vh vertical content drift
        // (content is centered via `align-items: center`, so the centre moves
        // when the container resizes) — perceived as a small upward jump
        // revealing the end of the previous project right when the gate
        // released. Fixed at 100vh = perfect alignment with the centred
        // overlay content, zero shift at unlock.
        style={{ minHeight: "100vh" }}
        data-mobile-project-index={projectIndex}
        data-mobile-journey-section="intro"
        aria-label={`Introduction — ${title}`}
      >
        <div className="mobile-project-intro__inner">
          <IntroContent
            title={title}
            description={description}
            progressPct={progressPct}
            statusLabel={statusLabel}
            ready={ready}
            error={error}
            showContinueAnyway={false}
          />
        </div>
      </section>
    </>
  );
}
