/**
 * Mobile-only global queue: one full frame-sequence idle preload at a time.
 * Desktop callers run the runner immediately (no queue).
 */

const MOBILE_PROJECT_ORDER = [
  "experience",
  "bekish-experience",
  "adma527-experience",
  "adma514-experience",
  "dusk-experience",
] as const;

export const MOBILE_PRELOAD_PRIORITY_ACTIVE = 1000;
export const MOBILE_PRELOAD_PRIORITY_ALLOWED = 100;

type PreloadRunner = (signal: AbortSignal) => Promise<void>;

type PreloadTask = {
  projectId: string;
  priority: number;
  run: PreloadRunner;
};

function orderBoost(projectId: string): number {
  const index = MOBILE_PROJECT_ORDER.indexOf(
    projectId as (typeof MOBILE_PROJECT_ORDER)[number],
  );
  if (index < 0) return 0;
  return MOBILE_PROJECT_ORDER.length - index;
}

export function getMobilePreloadPriority(
  projectId: string,
  progress: number,
): number {
  const boost = orderBoost(projectId);
  if (progress > 0) {
    return MOBILE_PRELOAD_PRIORITY_ACTIVE + boost;
  }
  return MOBILE_PRELOAD_PRIORITY_ALLOWED + boost;
}

function idleDelay(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    const finish = () => {
      signal.removeEventListener("abort", onAbort);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      resolve();
    };

    const onAbort = () => finish();
    signal.addEventListener("abort", onAbort);

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => finish());
    } else {
      timeoutId = setTimeout(finish, 40);
    }
  });
}

class MobileFramePreloadScheduler {
  private queue: PreloadTask[] = [];
  private active: PreloadTask | null = null;
  private abortCtrl: AbortController | null = null;
  private pumping = false;

  request(projectId: string, priority: number, run: PreloadRunner): () => void {
    this.queue = this.queue.filter((task) => task.projectId !== projectId);

    if (this.active?.projectId === projectId) {
      if (priority <= this.active.priority) {
        return () => this.cancel(projectId);
      }
      this.cancelActive();
    } else if (this.active && priority > this.active.priority) {
      this.cancelActive();
    }

    this.queue.push({ projectId, priority, run });
    this.queue.sort((a, b) => b.priority - a.priority);
    void this.pump();

    return () => this.cancel(projectId);
  }

  boost(projectId: string, priority: number): void {
    const queued = this.queue.find((task) => task.projectId === projectId);
    if (queued) {
      queued.priority = Math.max(queued.priority, priority);
      this.queue.sort((a, b) => b.priority - a.priority);
      if (this.active && priority > this.active.priority) {
        this.cancelActive();
        void this.pump();
      }
      return;
    }

    if (this.active?.projectId === projectId) {
      return;
    }
  }

  private cancel(projectId: string): void {
    this.queue = this.queue.filter((task) => task.projectId !== projectId);
    if (this.active?.projectId === projectId) {
      this.cancelActive();
      void this.pump();
    }
  }

  private cancelActive(): void {
    this.abortCtrl?.abort();
    this.abortCtrl = null;
    this.active = null;
  }

  private async pump(): Promise<void> {
    if (this.pumping) return;
    this.pumping = true;

    while (this.queue.length > 0 && !this.active) {
      const task = this.queue.shift();
      if (!task) break;

      this.active = task;
      this.abortCtrl = new AbortController();
      const signal = this.abortCtrl.signal;

      try {
        await task.run(signal);
      } catch {
        /* aborted or runner error — continue queue */
      } finally {
        if (this.active?.projectId === task.projectId) {
          this.active = null;
          this.abortCtrl = null;
        }
      }
    }

    this.pumping = false;
  }
}

const mobileScheduler = new MobileFramePreloadScheduler();

export function requestMobileFullPreload(
  projectId: string,
  priority: number,
  run: PreloadRunner,
): () => void {
  return mobileScheduler.request(projectId, priority, run);
}

export function boostMobileFullPreloadPriority(
  projectId: string,
  priority: number,
): void {
  mobileScheduler.boost(projectId, priority);
}

/** Desktop: run immediately. Mobile: global queue (one active runner). */
export function requestFullPreload(
  isMobile: boolean,
  projectId: string,
  priority: number,
  run: PreloadRunner,
): () => void {
  if (!isMobile) {
    const abortCtrl = new AbortController();
    void run(abortCtrl.signal);
    return () => abortCtrl.abort();
  }
  return requestMobileFullPreload(projectId, priority, run);
}

export { idleDelay };
