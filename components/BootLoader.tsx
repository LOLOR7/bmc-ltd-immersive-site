"use client";

/**
 * BootLoader — premium first-visit overlay for BMC Development.
 *
 *  Critical-only preload (FIRST project — Adma Cliff House):
 *    - Dev:  frames 1..5     (keep `npm run dev` fast on the Mac)
 *    - Prod: frames 1..60
 *    - Max 3 concurrent requests
 *    - No Map / no Set / no global cache — Image objects are nullified
 *      after load/error. The browser's HTTP cache is what we rely on.
 *    - No other project is preloaded. No idle batch. Nothing else.
 *
 *  Close conditions (FIRST one wins):
 *    - (min visible elapsed) AND (critical preload finished trying)
 *    - Hard max timeout
 *
 *  Timings:
 *    Dev   — min visible 2 s, max 5 s
 *    Prod  — min visible 8 s, max 75 s
 *
 *  Safety:
 *   (A) React: setVisible(false) → component returns null. React owns its
 *       node — we never call removeChild / el.remove().
 *   (B) CSS:   `animation-delay = MAX_DURATION_MS` auto-hides the overlay
 *              (opacity / visibility / pointer-events) if React stalls.
 *   (C) `body.boot-loading` class added on mount, removed in close()
 *       + cleanup (idempotent).
 *
 *  No edit to FrameExperience, frames, configs, GSAP, scroll, or
 *  project texts. No video. No CDN. No folder scan.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const STORAGE_KEY = "bmc-loader-seen";
const OVERLAY_ID = "bmc-boot-loader";
const LOGO_SRC = "/assets/bmc-logo-client-cream.png?v=1";

const FADE_OUT_MS = 500;
const TEXT_ROTATION_MS = 7000;

const isDev = process.env.NODE_ENV === "development";
const MIN_VISIBLE_MS = isDev ? 2000 : 8000;
const MAX_DURATION_MS = isDev ? 5000 : 75000;
const CRITICAL_FRAME_COUNT = isDev ? 5 : 60;
const PRELOAD_CONCURRENCY = 3;

const CRITICAL_FRAME_PATH = "/frames/frame_";

const CLIENT_TEXTS: string[] = [
  "BMC Development is a contracting, development, and architecture firm with over 40 years of experience delivering exceptional projects across Lebanon and Nigeria.",
  "With a portfolio of more than 300 completed projects, we specialize in high-end residential and commercial developments that combine timeless design, technical excellence, and quality-driven execution.",
  "From concept to completion, our approach focuses on creating refined spaces that are both functional and built to stand out.",
  "Backed by decades of expertise and a commitment to detail, BMC Development continues to shape modern living through carefully designed and expertly delivered projects.",
  "Explore a selection of our latest completed and ongoing developments.",
];

function frameUrl(index: number): string {
  return `${CRITICAL_FRAME_PATH}${String(index).padStart(4, "0")}.jpg`;
}

/**
 * Load one image without keeping any reference after onload/onerror.
 * The HTTP cache holds the bytes; we don't hold the JS object.
 */
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

async function preloadCriticalFrames(
  signal: AbortSignal,
  onProgress: () => void,
): Promise<void> {
  const indices = Array.from(
    { length: CRITICAL_FRAME_COUNT },
    (_, i) => i + 1,
  );
  let cursor = 0;

  const worker = async () => {
    while (!signal.aborted) {
      const next = cursor++;
      if (next >= indices.length) return;
      await loadOneAndRelease(frameUrl(indices[next]), signal);
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
  /**
   * Always start as visible so SSR and hydration match.
   * The useEffect immediately closes for returning visitors.
   */
  const [visible, setVisible] = useState<boolean>(true);
  const [fading, setFading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [textIndex, setTextIndex] = useState<number>(0);
  const closedRef = useRef(false);

  useEffect(() => {
    if (hasSeenLoader()) {
      if (isDev) console.log("[BootLoader] already seen — closing");
      closedRef.current = true;
      releaseBodyLock();
      setVisible(false);
      return;
    }

    if (isDev) console.log("[BootLoader] mounted");
    document.body.classList.add("boot-loading");

    const abortCtrl = new AbortController();
    const t0 = Date.now();
    let minReached = false;
    let preloadDone = false;
    let loadedCount = 0;

    /**
     * Combined progress:
     *   - real    = frames attempted / total
     *   - time    = elapsed / (max * 0.9)   (capped at 0.92)
     * Bar uses the maximum — never stalls visually.
     * Hard ceiling 0.97 until the close() bumps it to 1.0.
     */
    const updateProgress = () => {
      const realProgress = loadedCount / CRITICAL_FRAME_COUNT;
      const elapsed = Date.now() - t0;
      const timeProgress = Math.min(elapsed / (MAX_DURATION_MS * 0.9), 0.92);
      const next = Math.min(0.97, Math.max(realProgress, timeProgress));
      setProgress((prev) => (next > prev ? next : prev));
    };

    const progressInterval = window.setInterval(updateProgress, 200);

    const close = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      if (isDev) console.log("[BootLoader] hidden");
      markLoaderSeen();
      abortCtrl.abort();
      setProgress(1);
      setFading(true);
      releaseBodyLock();
      // Defer unmount so the fade-out is visible; React owns the node.
      window.setTimeout(() => {
        setVisible(false);
      }, FADE_OUT_MS);
    };

    const tryClose = () => {
      if (minReached && preloadDone) {
        if (isDev) console.log("[BootLoader] close conditions met");
        close();
      }
    };

    const minTimer = window.setTimeout(() => {
      minReached = true;
      if (isDev) console.log("[BootLoader] min visible reached");
      tryClose();
    }, MIN_VISIBLE_MS);

    const maxTimer = window.setTimeout(() => {
      if (isDev) console.log("[BootLoader] max timeout reached");
      close();
    }, MAX_DURATION_MS);

    void preloadCriticalFrames(abortCtrl.signal, () => {
      loadedCount += 1;
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
      window.clearInterval(textTimer);
      releaseBodyLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        <div className="boot-loader__rotator" aria-live="polite">
          <p
            key={textIndex}
            className="boot-loader__rotator-text"
          >
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
