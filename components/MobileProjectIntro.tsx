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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const rect = entry.boundingClientRect;
        const engaged =
          entry.isIntersecting &&
          (entry.intersectionRatio >= 0.45 ||
            (rect.top <= window.innerHeight * 0.2 &&
              rect.bottom > window.innerHeight * 0.35));
        setGateEngaged(engaged);
      },
      { threshold: [0, 0.15, 0.35, 0.55] },
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
        style={{ minHeight: hasUnlocked ? "115vh" : "100vh" }}
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
