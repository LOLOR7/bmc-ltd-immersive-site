"use client";

import MetricPill from "@/components/MetricPill";
import ViewProjectLink from "@/components/ViewProjectLink";
import {
  resolvePanel,
  type PanelState,
} from "@/lib/experience-panel";
import type { FrameExperienceConfig } from "@/lib/experiences/types";
import type { SceneContent } from "@/lib/scenes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Stay below reported duration — iOS Safari stalls when seeking to the exact end. */
const END_CLAMP_S = 0.1;
const START_CLAMP_S = 0.001;
/** Min delta before issuing a new seek (reduces scrub jank). */
const MIN_SEEK_DELTA_S = 0.035;
const isDev = process.env.NODE_ENV === "development";

function getSafeScrollDuration(duration: number): number {
  if (!Number.isFinite(duration) || duration <= END_CLAMP_S + START_CLAMP_S) {
    return 0;
  }
  return duration - END_CLAMP_S;
}

function scrollTimeFromProgress(progress: number, safeDuration: number): number {
  const p = Math.min(1, Math.max(0, progress));
  if (safeDuration <= 0) return START_CLAMP_S;
  return Math.min(
    safeDuration,
    Math.max(START_CLAMP_S, p * safeDuration),
  );
}

function shouldSeek(
  video: HTMLVideoElement,
  target: number,
  lastSeekTarget: number,
): boolean {
  if (!Number.isFinite(target)) return false;
  if (Math.abs(video.currentTime - target) < MIN_SEEK_DELTA_S) return false;
  if (Math.abs(lastSeekTarget - target) < MIN_SEEK_DELTA_S) return false;
  return true;
}

function applyScrollSeek(
  video: HTMLVideoElement,
  target: number,
  lastSeekTargetRef: { current: number },
): boolean {
  if (!shouldSeek(video, target, lastSeekTargetRef.current)) return false;
  try {
    video.currentTime = target;
    lastSeekTargetRef.current = target;
    return true;
  } catch {
    return false;
  }
}

type VideoStatus = "idle" | "loading" | "ready" | "error";

type VideoScrollExperienceProps = {
  config: FrameExperienceConfig;
  videoSrc: string;
  /**
   * Lazy-load flag from the parent journey. When false, the <video> has no
   * src — Safari does not preload, no network/buffer cost. Flips true for
   * prev/active/next projects only (max 3 simultaneous video elements).
   */
  shouldLoadVideo: boolean;
};

function logDev(label: string, video: HTMLVideoElement, experienceId: string) {
  if (!isDev) return;
  console.log(`[VideoScroll:${experienceId}] ${label}`, {
    currentSrc: video.currentSrc,
    readyState: video.readyState,
    networkState: video.networkState,
    duration: video.duration,
  });
}

function primeIosFirstFrame(
  video: HTMLVideoElement,
  lastSeekTargetRef?: { current: number },
) {
  const safeDuration = getSafeScrollDuration(video.duration);
  const t = scrollTimeFromProgress(0, safeDuration);
  try {
    video.currentTime = t;
    if (lastSeekTargetRef) lastSeekTargetRef.current = t;
  } catch {
    /* iOS may reject seek before buffer */
  }
}

function SceneBlock({
  scene,
  experienceId,
}: {
  scene: SceneContent;
  experienceId: string;
}) {
  return (
    <div className="scene-block max-w-3xl">
      {scene.index && (
        <p className="mb-3 text-[0.65rem] tracking-[0.35em] text-cream/45 uppercase md:text-xs">
          {scene.index}
        </p>
      )}
      <h2 className="text-2xl leading-[1.05] font-light tracking-[-0.02em] text-cream sm:text-4xl md:text-5xl lg:text-6xl">
        {scene.title}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60 md:mt-4 md:text-base">
        {scene.description}
      </p>
      {scene.metrics && scene.metrics.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
          {scene.metrics.map((metric) => (
            <li key={metric.label}>
              <MetricPill label={metric.label} />
            </li>
          ))}
        </ul>
      )}
      <ViewProjectLink experienceId={experienceId} />
    </div>
  );
}

export default function VideoScrollExperience({
  config,
  videoSrc: videoPath,
  shouldLoadVideo,
}: VideoScrollExperienceProps) {
  const {
    id,
    ariaLabel,
    projectName,
    subtitle,
    hint = "Scroll to explore",
    heroStats,
    brandLabel,
    projectType,
    featureLine,
    surfaceLine,
    location,
    scenes,
    scrollHeightVh,
  } = config;

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef(0);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<VideoStatus>("idle");
  const [activePanel, setActivePanel] = useState<PanelState>("hero");

  useEffect(() => {
    if (!shouldLoadVideo) {
      setResolvedSrc(null);
      return;
    }
    setResolvedSrc(
      typeof window !== "undefined"
        ? new URL(videoPath, window.location.href).href
        : videoPath,
    );
  }, [videoPath, shouldLoadVideo]);

  /**
   * Detach pass: when shouldLoadVideo flips to false, free the buffer to
   * unblock Safari iOS network/memory budget. Done in a dedicated effect so
   * the main bind effect can early-return when there's no src.
   */
  useEffect(() => {
    if (shouldLoadVideo) return;
    const video = videoRef.current;
    if (!video) return;
    try {
      video.pause();
      video.removeAttribute("src");
      video.load();
    } catch {
      /* iOS may throw during teardown */
    }
    setStatus("idle");
  }, [shouldLoadVideo]);

  useEffect(() => {
    if (!resolvedSrc) return;
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    setStatus("loading");

    let ctx: gsap.Context | undefined;
    let scrollBound = false;
    let rafId = 0;
    const lastSeekTargetRef = { current: START_CLAMP_S };
    let safeDuration = 0;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    video.preload = "auto";
    video.load();

    const bindScroll = () => {
      if (scrollBound) return;
      const duration = video.duration;
      safeDuration = getSafeScrollDuration(duration);
      if (safeDuration <= 0) return;

      scrollBound = true;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: reducedMotion ? 0.4 : true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            const target = scrollTimeFromProgress(self.progress, safeDuration);
            applyScrollSeek(video, target, lastSeekTargetRef);
          },
        });
      }, section);

      ScrollTrigger.refresh();
    };

    const markReady = () => {
      setStatus("ready");
      primeIosFirstFrame(video, lastSeekTargetRef);
      bindScroll();
      void video
        .play()
        .then(() => {
          video.pause();
          primeIosFirstFrame(video, lastSeekTargetRef);
        })
        .catch(() => {
          /* autoplay blocked until scroll */
        });
    };

    const onLoadedMetadata = () => {
      logDev("loadedmetadata", video, id);
      primeIosFirstFrame(video, lastSeekTargetRef);
      bindScroll();
    };

    const onCanPlay = () => {
      logDev("canplay", video, id);
      markReady();
    };

    const onError = () => {
      logDev("error", video, id);
      setStatus("error");
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      onLoadedMetadata();
    }
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      onCanPlay();
    }

    const tick = () => {
      const nextPanel = resolvePanel(progressRef.current, config);
      setActivePanel((prev) => (prev === nextPanel ? prev : nextPanel));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      ctx?.revert();
    };
  }, [resolvedSrc, config, id]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="frame-section video-scroll-experience"
      style={{ height: `${scrollHeightVh}vh` }}
      aria-label={ariaLabel}
    >
      <div className="frame-sticky">
        <video
          ref={videoRef}
          className="frame-image video-scroll-experience__video"
          {...(resolvedSrc ? { src: resolvedSrc } : {})}
          muted
          playsInline
          preload={resolvedSrc ? "auto" : "none"}
          disablePictureInPicture
          controls={false}
          aria-hidden
        />
        <div className="frame-exposure" aria-hidden="true" />
        <div className="frame-overlay" aria-hidden="true" />

        <div className="frame-text-layer">
          {activePanel === "hero" && (
            <div className="scene-block max-w-4xl">
              {(brandLabel || location) && (
                <p className="mb-3 text-[0.65rem] tracking-[0.35em] text-cream/45 uppercase">
                  {brandLabel ?? location}
                </p>
              )}
              <h1 className="text-[clamp(1.75rem,6.5vw,4.75rem)] leading-[1.02] font-light tracking-[-0.03em] text-cream">
                {projectName}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/60 md:mt-5 md:text-base">
                {subtitle}
              </p>
              {(projectType || featureLine || surfaceLine) && (
                <div className="hero-meta mt-6 space-y-2 border-l border-cream/15 pl-4 md:mt-8">
                  {projectType && (
                    <p className="text-[0.65rem] tracking-[0.22em] text-cream/50 uppercase">
                      {projectType}
                    </p>
                  )}
                  {featureLine && (
                    <p className="text-sm font-light tracking-[0.06em] text-cream/55">
                      {featureLine}
                    </p>
                  )}
                  {surfaceLine && (
                    <p className="text-[0.7rem] tracking-[0.12em] text-cream/40">
                      {surfaceLine}
                    </p>
                  )}
                </div>
              )}
              {heroStats && heroStats.length > 0 && (
                <ul className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
                  {heroStats.map((stat) => (
                    <li key={stat.label}>
                      <MetricPill label={stat.label} />
                    </li>
                  ))}
                </ul>
              )}
              <ViewProjectLink experienceId={id} />
              <p className="mt-8 flex items-center gap-2 text-[0.6rem] tracking-[0.28em] text-cream/40 uppercase md:mt-10">
                <ChevronDown
                  className="h-3.5 w-3.5 animate-pulse"
                  strokeWidth={1.25}
                />
                {hint}
              </p>
            </div>
          )}
          {typeof activePanel === "number" && (
            <SceneBlock scene={scenes[activePanel]} experienceId={id} />
          )}
        </div>

        {status === "loading" && (
          <p className="video-scroll-experience__status" role="status">
            Video loading…
          </p>
        )}
        {status === "error" && (
          <p
            className="video-scroll-experience__status video-scroll-experience__status--error"
            role="alert"
          >
            Video unavailable — check connection or use www.bmcdevelopmentlb.com
          </p>
        )}
      </div>
    </section>
  );
}
