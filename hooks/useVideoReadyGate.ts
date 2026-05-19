import {
  acquireMobileVideoPrepare,
  isMobileVideoAllowContinue,
  type VideoReadinessSnapshot,
} from "@/lib/mobile-video-readiness";
import { useEffect, useState } from "react";

export function useVideoReadyGate(
  videoSrc: string,
  enabled: boolean,
): VideoReadinessSnapshot & { allowContinue: boolean } {
  const [snapshot, setSnapshot] = useState<VideoReadinessSnapshot>({
    ready: false,
    progress: 0,
    error: false,
    bufferedSeconds: 0,
    readyState: 0,
    timedOut: false,
  });

  useEffect(() => {
    if (!enabled) return;
    const { subscribe } = acquireMobileVideoPrepare(videoSrc);
    return subscribe(setSnapshot);
  }, [videoSrc, enabled]);

  return {
    ...snapshot,
    allowContinue: isMobileVideoAllowContinue(snapshot),
  };
}
