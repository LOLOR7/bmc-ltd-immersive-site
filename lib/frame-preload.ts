export const isDev = process.env.NODE_ENV === "development";

export const PRIORITY_VISIBLE_FRAMES = 10;
export const MAX_LOADED_URLS = 80;
export const MAX_CONCURRENT_LOADS = 2;

export function isPreloadEnabled(): boolean {
  return !isDev;
}

const BOOT_SESSION_KEY = "bmc-boot-v1";

/** URLs successfully decoded at least once (no Image objects retained) */
const loadedUrls = new Set<string>();
const inflight = new Map<string, Promise<boolean>>();
const waitQueue: Array<() => void> = [];
let activeLoads = 0;

export function getFrameSrc(framePath: string, index: number): string {
  return `${framePath}${String(index).padStart(4, "0")}.jpg`;
}

export function isUrlLoaded(url: string): boolean {
  return loadedUrls.has(url);
}

export function getLoadedUrlCount(): number {
  return loadedUrls.size;
}

export function canAutoPreload(): boolean {
  if (isDev) return false;
  return loadedUrls.size < MAX_LOADED_URLS;
}

function drainQueue(): void {
  while (activeLoads < MAX_CONCURRENT_LOADS && waitQueue.length > 0) {
    const next = waitQueue.shift();
    next?.();
  }
}

/** Preload one frame URL. `force` bypasses the 80-url cap (current frame display). */
export function preloadUrl(url: string, force = false): Promise<boolean> {
  if (loadedUrls.has(url)) {
    return Promise.resolve(true);
  }

  if (isDev && !force) {
    return Promise.resolve(false);
  }

  if (!force && !canAutoPreload()) {
    return Promise.resolve(false);
  }

  const existing = inflight.get(url);
  if (existing) {
    return existing;
  }

  const promise = new Promise<boolean>((resolve) => {
    const run = () => {
      activeLoads += 1;
      const img = new Image();
      img.decoding = "async";

      const finish = (ok: boolean) => {
        activeLoads -= 1;
        inflight.delete(url);
        if (ok) {
          loadedUrls.add(url);
        }
        drainQueue();
        resolve(ok);
      };

      img.addEventListener(
        "load",
        () => {
          void img.decode?.().then(() => finish(true)).catch(() => finish(true));
        },
        { once: true },
      );
      img.addEventListener("error", () => finish(false), { once: true });
      img.src = url;
    };

    if (activeLoads < MAX_CONCURRENT_LOADS) {
      run();
    } else {
      waitQueue.push(run);
    }
  });

  inflight.set(url, promise);
  return promise;
}

export function preloadFrame(
  framePath: string,
  index: number,
  force = false,
): Promise<boolean> {
  return preloadUrl(getFrameSrc(framePath, index), force);
}

/** Scroll window: current, +1..+6, -1..-2 */
export function getScrollPreloadIndices(
  current: number,
  firstFrame: number,
  lastFrame: number,
): number[] {
  const indices = new Set<number>();
  indices.add(current);
  for (let i = 1; i <= 6; i++) indices.add(current + i);
  for (let i = 1; i <= 2; i++) indices.add(current - i);
  return [...indices].filter((i) => i >= firstFrame && i <= lastFrame);
}

export function hasBootCompleted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(BOOT_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markBootCompleted(): void {
  try {
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function resolveFramePathForViewport(
  framePath: string,
  mobileFramePath?: string,
): string {
  if (typeof window === "undefined") return framePath;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return isMobile && mobileFramePath ? mobileFramePath : framePath;
}

export async function runPriorityBoot(
  onProgress: (ratio: number) => void,
  onPoster?: (src: string) => void,
): Promise<void> {
  if (isDev) {
    onProgress(1);
    return;
  }

  const { EXPERIENCE_CATALOG, PRIMARY_EXPERIENCE } = await import(
    "@/lib/experiences/catalog"
  );

  const posterPath = PRIMARY_EXPERIENCE.framePath;
  const posterIndex = PRIMARY_EXPERIENCE.startFrame ?? 1;
  const posterSrc = getFrameSrc(posterPath, posterIndex);

  const frameOneTargets = EXPERIENCE_CATALOG.map((exp) => ({
    path: resolveFramePathForViewport(exp.framePath, exp.mobileFramePath),
    index: exp.startFrame ?? 1,
  }));
  const uniqueFrameOnes = [
    ...new Map(
      frameOneTargets.map((t) => [`${t.path}:${t.index}`, t] as const),
    ).values(),
  ];

  const visibleFrom = PRIMARY_EXPERIENCE.startFrame ?? 1;
  const visibleEnd = Math.min(
    visibleFrom + PRIORITY_VISIBLE_FRAMES - 1,
    PRIMARY_EXPERIENCE.endFrame ?? PRIMARY_EXPERIENCE.totalFrames,
  );

  const jobs: string[] = [posterSrc];
  for (const { path, index } of uniqueFrameOnes) {
    const url = getFrameSrc(path, index);
    if (!jobs.includes(url)) jobs.push(url);
  }
  for (let i = visibleFrom + 1; i <= visibleEnd; i++) {
    const url = getFrameSrc(posterPath, i);
    if (!jobs.includes(url)) jobs.push(url);
  }

  const total = jobs.length;
  let done = 0;

  for (const url of jobs) {
    const ok = await preloadUrl(url, true);
    if (url === posterSrc && ok) {
      onPoster?.(posterSrc);
    }
    done += 1;
    onProgress(done / total);
  }

  onProgress(1);
}
