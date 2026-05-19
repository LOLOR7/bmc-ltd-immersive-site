"use client";

import FrameExperience from "@/components/FrameExperience";
import VideoScrollExperience from "@/components/VideoScrollExperience";
import type { FrameExperienceConfig } from "@/lib/experiences/types";
import { useEffect, useState } from "react";

const MOBILE_MQ = "(max-width: 768px)";

function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

type HomeProjectExperienceProps = {
  config: FrameExperienceConfig;
  videoSrc: string;
};

/**
 * Home only — mobile ≤768px: scroll-controlled video; desktop: frame sequence.
 */
export default function HomeProjectExperience({
  config,
  videoSrc,
}: HomeProjectExperienceProps) {
  const isMobile = useIsMobileViewport();

  if (isMobile) {
    return <VideoScrollExperience config={config} videoSrc={videoSrc} />;
  }

  return <FrameExperience config={config} />;
}
