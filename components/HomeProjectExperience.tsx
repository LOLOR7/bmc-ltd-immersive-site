"use client";

import FrameExperience from "@/components/FrameExperience";
import VideoScrollExperience from "@/components/VideoScrollExperience";
import type { FrameExperienceConfig } from "@/lib/experiences/types";
import { useIsMobileViewport } from "@/lib/use-mobile-viewport";

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
    return (
      <VideoScrollExperience
        config={config}
        videoSrc={videoSrc}
        shouldLoadVideo
      />
    );
  }

  return <FrameExperience config={config} />;
}
