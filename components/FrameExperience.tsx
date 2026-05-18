"use client";

import MetricPill from "@/components/MetricPill";
import type { FrameExperienceConfig } from "@/lib/experiences/types";
import {
  canAutoPreload,
  getFrameSrc,
  getScrollPreloadIndices,
  isDev,
  isUrlLoaded,
  preloadFrame,
  preloadUrl,
} from "@/lib/frame-preload";
import type { SceneContent } from "@/lib/scenes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type PanelState = "hero" | number;

export { getFrameSrc };

function resolvePanel(
  progress: number,
  config: FrameExperienceConfig,
): PanelState {
  if (progress < config.heroEnd) return "hero";
  return Math.min(
    config.scenes.length - 1,
    Math.floor(progress * config.scenes.length),
  );
}

function getFrameBounds(
  config: FrameExperienceConfig,
  totalFrames = config.totalFrames,
) {
  const firstFrame = config.startFrame ?? 1;
  const lastFrame = config.endFrame ?? totalFrames;
  return { firstFrame, lastFrame };
}

function buildActiveFrameConfig(
  config: FrameExperienceConfig,
  useMobileFrames: boolean,
): FrameExperienceConfig {
  if (!useMobileFrames || !config.mobileFramePath) {
    return config;
  }
  return {
    ...config,
    framePath: config.mobileFramePath,
    totalFrames: config.mobileTotalFrames ?? config.totalFrames,
  };
}

function frameIndexFromProgress(
  progress: number,
  config: FrameExperienceConfig,
): number {
  const { firstFrame, lastFrame } = getFrameBounds(config);
  return Math.min(
    lastFrame,
    Math.max(
      firstFrame,
      Math.floor(firstFrame + progress * (lastFrame - firstFrame)),
    ),
  );
}

function SceneBlock({ scene }: { scene: SceneContent }) {
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
    </div>
  );
}

type FrameExperienceProps = {
  config: FrameExperienceConfig;
};

export default function FrameExperience({ config }: FrameExperienceProps) {
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
    mobileFramePath,
    scrollHeightVh,
    extractHint,
    fallbackMessage,
    strictAntiFlicker = false,
  } = config;

  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef(0);
  const frameRef = useRef(1);
  const lastGoodFrameRef = useRef(1);
  const pendingFrameRef = useRef(0);
  const displayedSrcRef = useRef("");

  const [framesAvailable, setFramesAvailable] = useState(false);
  const [loadState, setLoadState] = useState<"pending" | "ready" | "error">(
    "pending",
  );
  const [activePanel, setActivePanel] = useState<PanelState>("hero");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [useMobileFrames, setUseMobileFrames] = useState(false);

  const activeFrameConfig = buildActiveFrameConfig(config, useMobileFrames);
  const { firstFrame, lastFrame } = getFrameBounds(
    activeFrameConfig,
    activeFrameConfig.totalFrames,
  );
  const activeFramePath = activeFrameConfig.framePath;
  const initialSrc = getFrameSrc(activeFramePath, firstFrame);

  const swapWhenDecoded = useCallback((index: number, src: string) => {
    if (pendingFrameRef.current !== index) return;

    const el = imgRef.current;
    if (!el) return;

    const commit = () => {
      if (pendingFrameRef.current !== index) return;
      if (el.src !== src) {
        el.src = src;
      }
      displayedSrcRef.current = src;
      lastGoodFrameRef.current = index;
      frameRef.current = index;
    };

    const img = new Image();
    img.decoding = "async";
    img.addEventListener(
      "load",
      () => {
        void img.decode?.().then(commit).catch(commit);
      },
      { once: true },
    );
    img.addEventListener("error", () => undefined, { once: true });
    img.src = src;
  }, []);

  const applyFrame = useCallback(
    (index: number) => {
      const clamped = Math.min(lastFrame, Math.max(firstFrame, index));
      pendingFrameRef.current = clamped;
      const src = getFrameSrc(activeFramePath, clamped);

      if (isUrlLoaded(src)) {
        swapWhenDecoded(clamped, src);
        return;
      }

      void preloadUrl(src, true).then((ok) => {
        if (!ok || pendingFrameRef.current !== clamped) return;
        swapWhenDecoded(clamped, src);
      });
    },
    [activeFramePath, firstFrame, lastFrame, swapWhenDecoded],
  );

  const preloadScrollWindow = useCallback(
    (current: number) => {
      if (isDev || !canAutoPreload()) return;

      const indices = getScrollPreloadIndices(current, firstFrame, lastFrame);
      for (const index of indices) {
        if (index === current) continue;
        void preloadFrame(activeFramePath, index, false);
      }
    },
    [activeFramePath, firstFrame, lastFrame],
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const updateViewport = () => setIsMobileViewport(mq.matches);
    updateViewport();
    mq.addEventListener("change", updateViewport);
    return () => mq.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobileViewport || !mobileFramePath) {
      setUseMobileFrames(false);
      return;
    }

    if (isDev) {
      setUseMobileFrames(true);
      return;
    }

    let cancelled = false;
    const probeSrc = getFrameSrc(mobileFramePath, config.startFrame ?? 1);
    void preloadUrl(probeSrc, true).then((ok) => {
      if (!cancelled) setUseMobileFrames(ok);
    });

    return () => {
      cancelled = true;
    };
  }, [isMobileViewport, mobileFramePath, config.startFrame]);

  useEffect(() => {
    let cancelled = false;

    const activateAt = (index: number) => {
      if (cancelled) return;
      setLoadState("ready");
      setFramesAvailable(true);

      if (strictAntiFlicker && displayedSrcRef.current) {
        const remapped = frameIndexFromProgress(
          progressRef.current,
          activeFrameConfig,
        );
        applyFrame(remapped);
      } else {
        applyFrame(index);
      }

      ScrollTrigger.refresh();
    };

    const firstSrc = getFrameSrc(activeFramePath, firstFrame);

    if (isUrlLoaded(firstSrc)) {
      activateAt(firstFrame);
      return () => {
        cancelled = true;
      };
    }

    if (!strictAntiFlicker) {
      setFramesAvailable(false);
      setLoadState("pending");
    }

    void preloadUrl(firstSrc, true).then((ok) => {
      if (cancelled) return;
      if (ok) {
        activateAt(firstFrame);
        return;
      }
      setLoadState("error");
      setFramesAvailable(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    activeFramePath,
    activeFrameConfig,
    applyFrame,
    firstFrame,
    useMobileFrames,
    strictAntiFlicker,
  ]);

  useEffect(() => {
    if (!strictAntiFlicker || !framesAvailable) return;
    const remapped = frameIndexFromProgress(
      progressRef.current,
      activeFrameConfig,
    );
    applyFrame(remapped);
  }, [
    strictAntiFlicker,
    framesAvailable,
    activeFramePath,
    activeFrameConfig,
    applyFrame,
  ]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: reducedMotion ? 0.4 : true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    }, section);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    let rafId = 0;
    let lastTickFrame = 0;

    const tick = () => {
      const progress = progressRef.current;
      const nextPanel = resolvePanel(progress, activeFrameConfig);
      const nextFrame = frameIndexFromProgress(progress, activeFrameConfig);

      setActivePanel((prev) => (prev === nextPanel ? prev : nextPanel));

      if (framesAvailable && nextFrame !== lastTickFrame) {
        lastTickFrame = nextFrame;
        preloadScrollWindow(nextFrame);
        if (nextFrame !== frameRef.current) {
          applyFrame(nextFrame);
        }
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      ctx.revert();
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [framesAvailable, config, activeFrameConfig, preloadScrollWindow, applyFrame]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="frame-section"
      style={{ height: `${scrollHeightVh}vh` }}
      aria-label={ariaLabel}
    >
      <div className="frame-sticky">
        <img
          ref={imgRef}
          {...(strictAntiFlicker ? {} : { src: initialSrc })}
          alt=""
          className={
            strictAntiFlicker
              ? "frame-image frame-image-strict"
              : "frame-image"
          }
          decoding="async"
          draggable={false}
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
            <SceneBlock scene={scenes[activePanel]} />
          )}
        </div>

        {loadState === "error" && (
          <div className="frame-fallback">
            <p className="text-center text-[0.65rem] leading-relaxed tracking-[0.2em] text-cream/35 uppercase">
              {fallbackMessage ?? `Frames not found. Run ${extractHint}.`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
