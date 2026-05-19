export const MIN_BUFFER_SECONDS = 3;
/** After this, show “Continue anyway” — does NOT auto-unlock scroll. */
export const MAX_GATE_WAIT_MS = 28000;
/**
 * Grace period before freeing a hidden prepare element after the last
 * listener unsubscribes. Tolerates BootLoader → MobileProjectIntro handoff
 * and React StrictMode double-effects without losing the warm buffer.
 */
const RELEASE_GRACE_MS = 1500;

export type VideoReadinessSnapshot = {
  ready: boolean;
  progress: number;
  error: boolean;
  bufferedSeconds: number;
  readyState: number;
  /** True after MAX_GATE_WAIT_MS — enables manual continue only. */
  timedOut: boolean;
};

type VideoEntry = {
  video: HTMLVideoElement;
  href: string;
  listeners: Set<(snapshot: VideoReadinessSnapshot) => void>;
  snapshot: VideoReadinessSnapshot;
  gateTimer: ReturnType<typeof setTimeout> | null;
  releaseTimer: ReturnType<typeof setTimeout> | null;
  detach: (() => void) | null;
  linkElement: HTMLLinkElement | null;
};

const entries = new Map<string, VideoEntry>();

function resolveHref(src: string): string {
  return new URL(src, window.location.href).href;
}

function bufferedSecondsFromStart(video: HTMLVideoElement): number {
  try {
    const ranges = video.buffered;
    if (!ranges.length) return 0;
    for (let i = 0; i < ranges.length; i++) {
      if (ranges.start(i) <= 0.05) {
        return Math.max(0, ranges.end(i) - ranges.start(i));
      }
    }
  } catch {
    /* iOS may throw while buffering */
  }
  return 0;
}

function computeSnapshot(
  video: HTMLVideoElement,
  error: boolean,
  timedOut: boolean,
): VideoReadinessSnapshot {
  const bufferedSeconds = bufferedSecondsFromStart(video);
  const readyState = video.readyState;

  const ready =
    !error &&
    readyState >= HTMLMediaElement.HAVE_FUTURE_DATA &&
    (bufferedSeconds >= MIN_BUFFER_SECONDS ||
      (readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA &&
        bufferedSeconds >= MIN_BUFFER_SECONDS * 0.5));

  let progress = 0;
  if (error) {
    progress = 0;
  } else if (ready) {
    progress = 1;
  } else {
    const meta = readyState >= HTMLMediaElement.HAVE_METADATA ? 0.2 : 0;
    const current =
      readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? 0.15 : 0;
    const future =
      readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ? 0.15 : 0;
    const buffer = Math.min(
      0.5,
      (bufferedSeconds / MIN_BUFFER_SECONDS) * 0.5,
    );
    progress = Math.min(0.92, meta + current + future + buffer);
  }

  return {
    ready,
    progress,
    error,
    bufferedSeconds,
    readyState,
    timedOut,
  };
}

function notifyEntry(entry: VideoEntry): void {
  for (const listener of entry.listeners) {
    listener(entry.snapshot);
  }
}

function ensureLinkPreload(href: string): HTMLLinkElement {
  const existing = document.head.querySelector<HTMLLinkElement>(
    `link[rel="preload"][as="video"][href="${href}"]`,
  );
  if (existing) return existing;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = href;
  document.head.appendChild(link);
  return link;
}

function startGateTimer(entry: VideoEntry): void {
  if (entry.gateTimer) return;
  entry.gateTimer = setTimeout(() => {
    entry.snapshot = computeSnapshot(
      entry.video,
      entry.snapshot.error,
      true,
    );
    notifyEntry(entry);
  }, MAX_GATE_WAIT_MS);
}

/** Free the hidden <video>, remove the <link>, drop the entry. */
function releaseEntry(entry: VideoEntry): void {
  if (entry.releaseTimer) {
    clearTimeout(entry.releaseTimer);
    entry.releaseTimer = null;
  }
  if (entry.gateTimer) {
    clearTimeout(entry.gateTimer);
    entry.gateTimer = null;
  }
  entry.detach?.();
  entry.detach = null;
  try {
    entry.video.pause();
    entry.video.removeAttribute("src");
    entry.video.load();
  } catch {
    /* iOS may throw if already torn down */
  }
  if (entry.linkElement?.parentNode) {
    entry.linkElement.parentNode.removeChild(entry.linkElement);
  }
  entry.linkElement = null;
  entries.delete(entry.href);
}

function scheduleRelease(entry: VideoEntry): void {
  if (entry.releaseTimer) return;
  entry.releaseTimer = setTimeout(() => {
    entry.releaseTimer = null;
    if (entry.listeners.size === 0) releaseEntry(entry);
  }, RELEASE_GRACE_MS);
}

function cancelRelease(entry: VideoEntry): void {
  if (!entry.releaseTimer) return;
  clearTimeout(entry.releaseTimer);
  entry.releaseTimer = null;
}

/** Shared hidden video + readiness tracking — one entry per src. */
export function acquireMobileVideoPrepare(src: string): {
  video: HTMLVideoElement;
  subscribe: (listener: (snapshot: VideoReadinessSnapshot) => void) => () => void;
  getSnapshot: () => VideoReadinessSnapshot;
} {
  const href = resolveHref(src);
  let entry = entries.get(href);

  if (!entry) {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    video.src = href;

    const linkElement = ensureLinkPreload(href);

    entry = {
      video,
      href,
      listeners: new Set(),
      snapshot: computeSnapshot(video, false, false),
      gateTimer: null,
      releaseTimer: null,
      detach: null,
      linkElement,
    };
    entries.set(href, entry);
    startGateTimer(entry);

    const update = () => {
      entry!.snapshot = computeSnapshot(
        entry!.video,
        entry!.snapshot.error,
        entry!.snapshot.timedOut,
      );
      notifyEntry(entry!);
    };

    const onError = () => {
      entry!.snapshot = computeSnapshot(
        entry!.video,
        true,
        entry!.snapshot.timedOut,
      );
      notifyEntry(entry!);
    };

    video.addEventListener("loadedmetadata", update);
    video.addEventListener("canplay", update);
    video.addEventListener("progress", update);
    video.addEventListener("error", onError);

    entry.detach = () => {
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("canplay", update);
      video.removeEventListener("progress", update);
      video.removeEventListener("error", onError);
    };

    video.load();
  }

  cancelRelease(entry);

  return {
    video: entry.video,
    subscribe: (listener) => {
      entry!.listeners.add(listener);
      cancelRelease(entry!);
      listener(entry!.snapshot);
      return () => {
        entry!.listeners.delete(listener);
        if (entry!.listeners.size === 0) {
          scheduleRelease(entry!);
        }
      };
    },
    getSnapshot: () => entry!.snapshot,
  };
}

export function preloadMobileVideo(src: string): void {
  acquireMobileVideoPrepare(src);
}

/** Auto-unlock only when video is actually ready or failed — NOT on timeout. */
export function isMobileVideoAutoContinue(
  snapshot: VideoReadinessSnapshot,
): boolean {
  return snapshot.ready || snapshot.error;
}

/** BootLoader — warm first mobile video instead of frames. */
export function warmMobileVideoForBoot(
  src: string,
  signal: AbortSignal,
  maxMs = 8000,
): Promise<void> {
  if (signal.aborted) return Promise.resolve();

  const { subscribe } = acquireMobileVideoPrepare(src);

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      unsub();
      window.clearTimeout(timer);
      resolve();
    };

    const unsub = subscribe((snap) => {
      if (snap.ready || snap.error) finish();
    });

    const timer = window.setTimeout(finish, maxMs);
    signal.addEventListener("abort", finish, { once: true });
  });
}
