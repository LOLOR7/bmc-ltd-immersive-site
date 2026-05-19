import {
  acquireMobileVideoPrepare,
  isMobileVideoAutoContinue,
  type VideoReadinessSnapshot,
} from "@/lib/mobile-video-readiness";
import { useEffect, useState } from "react";

export function useVideoReadyGate(
  videoSrc: string,
  enabled: boolean,
  manualContinue: boolean,
): VideoReadinessSnapshot & {
  allowContinue: boolean;
  showContinueAnyway: boolean;
} {
  const initial: VideoReadinessSnapshot = {
    ready: false,
    progress: 0,
    error: false,
    bufferedSeconds: 0,
    readyState: 0,
    timedOut: false,
  };
  const [snapshot, setSnapshot] = useState<VideoReadinessSnapshot>(initial);

  useEffect(() => {
    if (!enabled) {
      /**
       * Preserve timedOut across enabled flips. Without this, a transient
       * activeIndex oscillation would wipe the local timeout state and
       * the "Continue anyway" escape hatch could never surface, leaving
       * the gate locked indefinitely. The readiness layer keeps its own
       * sticky per-URL meta — we mirror it here for the consumer.
       */
      setSnapshot((prev) => ({
        ...initial,
        timedOut: prev.timedOut,
      }));
      return;
    }
    const { subscribe } = acquireMobileVideoPrepare(videoSrc);
    return subscribe(setSnapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc, enabled]);

  const autoContinue = isMobileVideoAutoContinue(snapshot);
  const showContinueAnyway =
    snapshot.timedOut && !snapshot.ready && !snapshot.error;

  return {
    ...snapshot,
    showContinueAnyway,
    allowContinue: autoContinue || manualContinue,
  };
}
