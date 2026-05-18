"use client";

import MetricPill from "@/components/MetricPill";
import ViewProjectLink from "@/components/ViewProjectLink";
import type { FrameExperienceConfig } from "@/lib/experiences/types";
import type { SceneContent } from "@/lib/scenes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const INITIAL_PRELOAD = 5;
const NEARBY_RADIUS = 4;

type PanelState = "hero" | number;

export function getFrameSrc(framePath: string, index: number): string {
  return `${framePath}${String(index).padStart(4, "0")}.jpg`;
}

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
    framePath,
    mobileFramePath,
    totalFrames,
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
  const cacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const cachesByPathRef = useRef<Map<string, Map<number, HTMLImageElement>>>(
    new Map(),
  );

  const [framesAvailable, setFramesAvailable] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelState>("hero");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [useMobileFrames, setUseMobileFrames] = useState(false);

  const activeFrameConfig = useMemo(
    () => buildActiveFrameConfig(config, useMobileFrames),
    [config, useMobileFrames],
  );
  const { firstFrame, lastFrame } = getFrameBounds(
    activeFrameConfig,
    activeFrameConfig.totalFrames,
  );
  const activeFramePath = activeFrameConfig.framePath;
  const initialSrc = getFrameSrc(activeFramePath, firstFrame);

  const getActiveCache = useCallback((): Map<number, HTMLImageElement> => {
    if (!strictAntiFlicker) {
      return cacheRef.current;
    }
    let cache = cachesByPathRef.current.get(activeFramePath);
    if (!cache) {
      cache = new Map();
      cachesByPathRef.current.set(activeFramePath, cache);
    }
    return cache;
  }, [strictAntiFlicker, activeFramePath]);

  const preloadFrame = useCallback(
    (index: number) => {
      if (index < firstFrame || index > lastFrame) {
        return;
      }
      const cache = getActiveCache();
      if (cache.has(index)) {
        return;
      }
      const img = new Image();
      img.decoding = "async";
      img.src = getFrameSrc(activeFramePath, index);
      cache.set(index, img);
    },
    [activeFramePath, firstFrame, lastFrame, getActiveCache],
  );

  const applyFrameStrict = useCallback(
    (index: number) => {
      const clamped = Math.min(lastFrame, Math.max(firstFrame, index));
      pendingFrameRef.current = clamped;

      const src = getFrameSrc(activeFramePath, clamped);
      const cache = getActiveCache();
      const cached = cache.get(clamped);

      const swapTo = (frame: number, url: string, img: HTMLImageElement) => {
        if (pendingFrameRef.current !== frame) return;
        if (!img.complete || img.naturalWidth <= 0) return;

        const el = imgRef.current;
        if (!el) return;

        const commitSwap = () => {
          if (pendingFrameRef.current !== frame) return;
          if (el.src !== url) {
            el.src = url;
          }
          displayedSrcRef.current = url;
          lastGoodFrameRef.current = frame;
          frameRef.current = frame;
        };

        void img.decode?.().then(commitSwap).catch(commitSwap);
      };

      if (cached?.complete && cached.naturalWidth > 0) {
        swapTo(clamped, src, cached);
        return;
      }

      const img = cached ?? new Image();
      if (!cached) {
        img.decoding = "async";
        cache.set(clamped, img);
        img.src = src;
      }

      img.onload = () => {
        if (pendingFrameRef.current !== clamped) return;
        swapTo(clamped, src, img);
      };
      img.onerror = () => {
        if (pendingFrameRef.current !== clamped) return;
        const fallback = lastGoodFrameRef.current;
        if (fallback < firstFrame || fallback > lastFrame) return;
        const fallbackSrc = getFrameSrc(activeFramePath, fallback);
        const fallbackImg = cache.get(fallback);
        if (fallbackImg?.complete && fallbackImg.naturalWidth > 0) {
          swapTo(fallback, fallbackSrc, fallbackImg);
        }
      };
    },
    [activeFramePath, firstFrame, lastFrame, getActiveCache],
  );

  const preloadNearby = useCallback(
    (index: number) => {
      for (let i = index - NEARBY_RADIUS; i <= index + NEARBY_RADIUS; i++) {
        preloadFrame(i);
      }
    },
    [preloadFrame],
  );

  const applyFrame = useCallback(
    (index: number) => {
      if (strictAntiFlicker) {
        applyFrameStrict(index);
        return;
      }

      const src = getFrameSrc(activeFramePath, index);
      const cached = cacheRef.current.get(index);

      const commit = (frame: number, url: string) => {
        const el = imgRef.current;
        if (!el) return;

        const apply = () => {
          if (el.src !== url) el.src = url;
          lastGoodFrameRef.current = frame;
          frameRef.current = frame;
        };

        const decoded = cacheRef.current.get(index);
        if (decoded?.complete && decoded.naturalWidth > 0) {
          void decoded.decode?.().then(apply).catch(apply);
          return;
        }
        apply();
      };

      if (cached?.complete && cached.naturalWidth > 0) {
        commit(index, src);
        return;
      }

      const img = cached ?? new Image();
      if (!cached) {
        img.decoding = "async";
        img.src = src;
        cacheRef.current.set(index, img);
      }

      img.onload = () => {
        void img.decode?.().then(() => commit(index, src)).catch(() => commit(index, src));
      };
      img.onerror = () => {
        if (lastGoodFrameRef.current > 0) {
          commit(
            lastGoodFrameRef.current,
            getFrameSrc(activeFramePath, lastGoodFrameRef.current),
          );
        }
      };
    },
    [activeFramePath, strictAntiFlicker, applyFrameStrict],
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

    let cancelled = false;
    const probe = new Image();
    probe.src = getFrameSrc(mobileFramePath, config.startFrame ?? 1);
    probe.onload = () => {
      if (!cancelled) setUseMobileFrames(true);
    };
    probe.onerror = () => {
      if (!cancelled) setUseMobileFrames(false);
    };

    return () => {
      cancelled = true;
    };
  }, [isMobileViewport, mobileFramePath, config.startFrame]);

  useEffect(() => {
    let cancelled = false;

    if (!strictAntiFlicker) {
      cacheRef.current.clear();
      setFramesAvailable(false);
    }

    const probe = new Image();
    probe.src = getFrameSrc(activeFramePath, firstFrame);
    probe.onload = () => {
      if (cancelled) return;
      setFramesAvailable(true);

      if (strictAntiFlicker && displayedSrcRef.current) {
        const remapped = frameIndexFromProgress(
          progressRef.current,
          activeFrameConfig,
        );
        pendingFrameRef.current = remapped;
        applyFrame(remapped);
      } else {
        pendingFrameRef.current = firstFrame;
        frameRef.current = firstFrame;
        lastGoodFrameRef.current = firstFrame;
        applyFrame(firstFrame);
      }

      ScrollTrigger.refresh();
    };
    probe.onerror = () => {
      if (!cancelled) setFramesAvailable(false);
    };
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
    const progress = progressRef.current;
    const remapped = frameIndexFromProgress(progress, activeFrameConfig);
    pendingFrameRef.current = remapped;
    applyFrame(remapped);
  }, [
    strictAntiFlicker,
    framesAvailable,
    activeFramePath,
    activeFrameConfig,
    applyFrame,
  ]);

  useEffect(() => {
    if (!framesAvailable) return;

    const preloadEnd = Math.min(firstFrame + INITIAL_PRELOAD - 1, lastFrame);
    for (let i = firstFrame; i <= preloadEnd; i++) preloadFrame(i);

    let i = preloadEnd + 1;
    const batch = () => {
      const end = Math.min(i + 12, lastFrame);
      for (; i <= end; i++) preloadFrame(i);
      if (i <= lastFrame) {
        window.requestIdleCallback?.(batch) ?? window.setTimeout(batch, 40);
      }
    };
    batch();
  }, [framesAvailable, preloadFrame, firstFrame, lastFrame]);

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
        preloadNearby(nextFrame);
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
  }, [framesAvailable, config, activeFrameConfig, preloadNearby, applyFrame]);

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

        {!framesAvailable && (
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
