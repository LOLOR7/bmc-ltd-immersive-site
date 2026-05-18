"use client";

/**
 * BootLoader — informational overlay + critical-only preload for the FIRST
 * project (Adma Cliff House). Bounded, non-blocking.
 *
 *  Preload scope (very narrow on purpose):
 *    - Only `/frames/frame_0001.jpg` … `/frames/frame_<N>.jpg`
 *    - Dev:  N = 5     (keep `npm run dev` fast on the Mac)
 *    - Prod: N = 30
 *    - Max 3 concurrent requests
 *    - No Map / no Set / no global cache — Image objects are nullified
 *      after load/error. The browser's HTTP cache is what we rely on.
 *    - No other project is preloaded. No idle batch. Nothing else.
 *
 *  Close conditions (FIRST one wins):
 *    - (min 2s elapsed) AND (critical preload done)
 *    - Hard max timeout: dev 5s / prod 45s
 *
 *  Double safety so the overlay can never stay visible:
 *   (A) React: setVisible(false) → component returns null. ONLY React
 *       removes its own node — we never call removeChild / el.remove().
 *   (B) CSS:   animation-delay = MAX_DURATION_MS auto-hides the overlay
 *              (opacity / visibility / pointer-events) even if React stalls.
 *              `--boot-loader-display-ms` is passed inline.
 *
 *  `body.boot-loading` class is added on mount and removed in `close()`
 *  + cleanup (idempotent), so the page is never left non-scrollable.
 *
 *  No edit to FrameExperience, frames, configs, animations, or scroll logic.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const STORAGE_KEY = "bmc-loader-seen";
const OVERLAY_ID = "bmc-boot-loader";
const LOGO_SRC = "/assets/bmc-logo-client-cream.png?v=1";

const FADE_OUT_MS = 500;
const MIN_VISIBLE_MS = 2000;

const isDev = process.env.NODE_ENV === "development";
const MAX_DURATION_MS = isDev ? 5000 : 45000;
const CRITICAL_FRAME_COUNT = isDev ? 5 : 30;
const PRELOAD_CONCURRENCY = 3;

const CRITICAL_FRAME_PATH = "/frames/frame_";

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

async function preloadCriticalFrames(signal: AbortSignal): Promise<void> {
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
   * Always start as visible to keep SSR and hydration in sync.
   * The `useEffect` below immediately closes for returning visitors.
   */
  const [visible, setVisible] = useState<boolean>(true);
  const closedRef = useRef(false);

  useEffect(() => {
    // Returning visitor in the same session: close immediately, no preload.
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
    let minReached = false;
    let preloadDone = false;

    const close = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      if (isDev) console.log("[BootLoader] hidden");
      markLoaderSeen();
      abortCtrl.abort();
      releaseBodyLock();
      // React is the sole owner of the overlay node — only flip state.
      setVisible(false);
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

    void preloadCriticalFrames(abortCtrl.signal).then(() => {
      preloadDone = true;
      if (isDev) console.log("[BootLoader] critical preload done");
      tryClose();
    });

    return () => {
      abortCtrl.abort();
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
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
      className="boot-loader"
      role="status"
      aria-live="polite"
      aria-label="Preparing immersive experience"
      style={overlayStyle}
    >
      <div className="boot-loader__inner">
        <img
          src={LOGO_SRC}
          alt="BMC"
          className="boot-loader__logo"
          decoding="async"
          draggable={false}
        />
        <p className="boot-loader__brand">BMC</p>
        <p className="boot-loader__title">Preparing immersive experience</p>
        <p className="boot-loader__hint">
          This first load may take up to one minute.
        </p>
        <p className="boot-loader__sub">
          Please keep this page open while the visuals are being prepared.
        </p>

        <div className="boot-loader__track" aria-hidden="true">
          <span
            className="boot-loader__bar"
            style={{ animationDuration: `${MAX_DURATION_MS}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
