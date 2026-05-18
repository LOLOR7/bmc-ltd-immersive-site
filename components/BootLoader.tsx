"use client";

/**
 * BootLoader — premium first-visit overlay + bounded critical preload.
 *
 *  Preload scope (HTTP cache only — Image refs released after load):
 *    Prod:
 *      - Project 1 (Adma Cliff House):  frames 1..60   /frames/frame_
 *      - Project 2 (Bekish 6358):       frames 1..40   /frames/bekish-final/frame_
 *      - Project 3 (Adma 527):          frame 1        /frames/adma-527-final/frame_
 *      - Project 4 (Adma 514):          frame 1        /frames/adma-514/frame_
 *      - Project 5 (Dusk):              frame 1        /frames/dusk/frame_
 *    Dev (keep Mac fast):
 *      - Project 1: frames 1..5
 *      - Project 2: frames 1..3
 *      - Projects 3–5: skipped
 *
 *  Max 3 concurrent requests. No Map/Set. No idle batch. No requestIdleCallback.
 *
 *  Close: (min visible AND preload done) OR max wall-clock elapsed.
 *    Dev  — min 2 s, max 8 s
 *    Prod — min 8 s, max 75 s
 *
 *  Wall-clock watchdog + visibilitychange guard against Safari background-tab
 *  timer throttling (setTimeout may not fire while the tab is inactive).
 *
 *  React owns the overlay node — never removeChild / el.remove().
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const STORAGE_KEY = "bmc-loader-seen";
const OVERLAY_ID = "bmc-boot-loader";
const LOGO_SRC = "/assets/bmc-logo-client-cream.png?v=1";

const FADE_OUT_MS = 500;
const TEXT_ROTATION_MS = 7000;
const PRELOAD_CONCURRENCY = 3;
const WATCHDOG_MS = 500;

const isDev = process.env.NODE_ENV === "development";
const MIN_VISIBLE_MS = isDev ? 2000 : 8000;
const MAX_DURATION_MS = isDev ? 8000 : 75000;

type CloseReason = "preload" | "timeout" | "visibility" | "watchdog";

/** Paths match lib/experiences/*.ts framePath values — not edited here. */
const FRAME_PATHS = {
  adma: "/frames/frame_",
  bekish: "/frames/bekish-final/frame_",
  adma527: "/frames/adma-527-final/frame_",
  adma514: "/frames/adma-514/frame_",
  dusk: "/frames/dusk/frame_",
} as const;

type PreloadBatch = {
  framePath: string;
  start: number;
  count: number;
};

function buildPreloadPlan(): PreloadBatch[] {
  if (isDev) {
    return [
      { framePath: FRAME_PATHS.adma, start: 1, count: 5 },
      { framePath: FRAME_PATHS.bekish, start: 1, count: 3 },
    ];
  }
  return [
    { framePath: FRAME_PATHS.adma, start: 1, count: 60 },
    { framePath: FRAME_PATHS.bekish, start: 1, count: 40 },
    { framePath: FRAME_PATHS.adma527, start: 1, count: 1 },
    { framePath: FRAME_PATHS.adma514, start: 1, count: 1 },
    { framePath: FRAME_PATHS.dusk, start: 1, count: 1 },
  ];
}

function buildPreloadUrls(plan: PreloadBatch[]): string[] {
  const urls: string[] = [];
  for (const batch of plan) {
    for (let i = 0; i < batch.count; i++) {
      urls.push(`${batch.framePath}${String(batch.start + i).padStart(4, "0")}.jpg`);
    }
  }
  return urls;
}

const PRELOAD_PLAN = buildPreloadPlan();
const TOTAL_PRELOAD_COUNT = PRELOAD_PLAN.reduce((sum, b) => sum + b.count, 0);

const CLIENT_TEXTS: string[] = [
  "BMC Development is a contracting, development, and architecture firm with over 40 years of experience delivering exceptional projects across Lebanon and Nigeria.",
  "With a portfolio of more than 300 completed projects, we specialize in high-end residential and commercial developments that combine timeless design, technical excellence, and quality-driven execution.",
  "From concept to completion, our approach focuses on creating refined spaces that are both functional and built to stand out.",
  "Backed by decades of expertise and a commitment to detail, BMC Development continues to shape modern living through carefully designed and expertly delivered projects.",
  "Explore a selection of our latest completed and ongoing developments.",
];

function loadOneAndRelease(
  url: string,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    let img: HTMLImageElement | null = new Image();
    const finish = () => {
      if (img) {
        img.onload = null;
        img.onerror = null;
        img = null;
      }
      resolve();
    };
    img.onload = finish;
    img.onerror = finish;
    img.decoding = "async";
    img.src = url;
  });
}

async function preloadUrls(
  urls: string[],
  signal: AbortSignal,
  onProgress: () => void,
): Promise<void> {
  let cursor = 0;

  const worker = async () => {
    while (!signal.aborted) {
      const next = cursor++;
      if (next >= urls.length) return;
      await loadOneAndRelease(urls[next], signal);
      if (!signal.aborted) onProgress();
    }
  };

  const workers: Promise<void>[] = [];
  for (let i = 0; i < PRELOAD_CONCURRENCY; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

function hasSeenLoader(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markLoaderSeen(): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* private mode — no-op */
  }
}

function releaseBodyLock(): void {
  if (typeof document === "undefined") return;
  document.body.classList.remove("boot-loading");
}

export default function BootLoader() {
  const [visible, setVisible] = useState<boolean>(true);
  const [fading, setFading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [textIndex, setTextIndex] = useState<number>(0);
  const closedRef = useRef(false);
  const rotatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasSeenLoader()) {
      if (isDev) console.log("[BootLoader] already seen — closing");
      closedRef.current = true;
      releaseBodyLock();
      setVisible(false);
      return;
    }

    if (isDev) {
      console.log("[BootLoader] mounted", {
        totalFrames: TOTAL_PRELOAD_COUNT,
        plan: PRELOAD_PLAN,
      });
    }

    document.body.classList.add("boot-loading");

    const abortCtrl = new AbortController();
    const preloadUrlsList = buildPreloadUrls(PRELOAD_PLAN);
    const t0 = performance.now();
    let minReached = false;
    let preloadDone = false;
    let loadedCount = 0;

    const elapsedMs = () => performance.now() - t0;

    const updateProgress = () => {
      const realProgress =
        TOTAL_PRELOAD_COUNT > 0 ? loadedCount / TOTAL_PRELOAD_COUNT : 1;
      const elapsed = elapsedMs();
      const timeProgress = Math.min(elapsed / (MAX_DURATION_MS * 0.9), 0.92);
      const next = Math.min(0.97, Math.max(realProgress, timeProgress));
      setProgress((prev) => (next > prev ? next : prev));
    };

    const close = (reason: CloseReason) => {
      if (closedRef.current) return;
      closedRef.current = true;
      if (isDev) console.log(`[BootLoader] close called reason=${reason}`);

      markLoaderSeen();
      abortCtrl.abort();
      setProgress(1);
      setFading(true);
      releaseBodyLock();
      if (isDev) console.log("[BootLoader] body lock released");

      const hardClose =
        reason === "timeout" ||
        reason === "visibility" ||
        reason === "watchdog";

      if (hardClose) {
        setVisible(false);
        if (isDev) console.log("[BootLoader] hidden (immediate)");
        return;
      }

      window.setTimeout(() => {
        setVisible(false);
        if (isDev) console.log("[BootLoader] hidden");
      }, FADE_OUT_MS);
    };

    const tryClose = () => {
      if (minReached && preloadDone) {
        close("preload");
      }
    };

    const evaluateWallClock = (source: "watchdog" | "visibility") => {
      const elapsed = elapsedMs();
      if (elapsed >= MIN_VISIBLE_MS) minReached = true;
      if (elapsed >= MAX_DURATION_MS) {
        if (isDev) {
          console.log(
            `[BootLoader] max timeout reached (${source}, ${Math.round(elapsed)}ms)`,
          );
        }
        close(source === "visibility" ? "visibility" : "watchdog");
        return true;
      }
      tryClose();
      return false;
    };

    const progressInterval = window.setInterval(updateProgress, 200);

    const minTimer = window.setTimeout(() => {
      minReached = true;
      if (isDev) console.log("[BootLoader] min visible reached");
      tryClose();
    }, MIN_VISIBLE_MS);

    const maxTimer = window.setTimeout(() => {
      if (isDev) console.log("[BootLoader] max timeout reached (timer)");
      close("timeout");
    }, MAX_DURATION_MS);

    const watchdog = window.setInterval(() => {
      updateProgress();
      evaluateWallClock("watchdog");
    }, WATCHDOG_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (isDev) {
        console.log(
          `[BootLoader] tab visible (elapsed ${Math.round(elapsedMs())}ms)`,
        );
      }
      evaluateWallClock("visibility");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    if (isDev) console.log("[BootLoader] preload started");

    void preloadUrls(preloadUrlsList, abortCtrl.signal, () => {
      loadedCount += 1;
      if (isDev) {
        console.log(
          `[BootLoader] preload progress ${loadedCount}/${TOTAL_PRELOAD_COUNT}`,
        );
      }
      updateProgress();
    }).then(() => {
      preloadDone = true;
      if (isDev) console.log("[BootLoader] critical preload done");
      tryClose();
    });

    const textTimer = window.setInterval(() => {
      setTextIndex((i) => (i + 1) % CLIENT_TEXTS.length);
    }, TEXT_ROTATION_MS);

    return () => {
      abortCtrl.abort();
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.clearInterval(progressInterval);
      window.clearInterval(watchdog);
      window.clearInterval(textTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      releaseBodyLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rotatorRef.current?.scrollTo({ top: 0 });
  }, [textIndex]);

  if (!visible) return null;

  const overlayStyle = {
    "--boot-loader-display-ms": `${MAX_DURATION_MS}ms`,
    "--boot-loader-fade-ms": `${FADE_OUT_MS}ms`,
  } as CSSProperties;

  return (
    <div
      id={OVERLAY_ID}
      className={`boot-loader${fading ? " boot-loader--fading" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Preparing immersive experience"
      style={overlayStyle}
    >
      <div className="boot-loader__inner">
        <img
          src={LOGO_SRC}
          alt="BMC Development"
          className="boot-loader__logo"
          decoding="async"
          draggable={false}
        />
        <p className="boot-loader__brand">BMC Development</p>
        <p className="boot-loader__title">
          Preparing your private architectural experience
        </p>

        <div ref={rotatorRef} className="boot-loader__rotator" aria-live="polite">
          <p key={textIndex} className="boot-loader__rotator-text">
            {CLIENT_TEXTS[textIndex]}
          </p>
        </div>

        <div className="boot-loader__status">
          <p className="boot-loader__status-label">Loading first sequence</p>
          <div className="boot-loader__track" aria-hidden="true">
            <span
              className="boot-loader__bar"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        <p className="boot-loader__hint">
          This first load may take up to one minute.
        </p>
        <p className="boot-loader__sub">
          Please keep this page open while the visuals are being prepared.
        </p>
      </div>
    </div>
  );
}
