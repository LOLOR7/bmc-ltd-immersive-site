import type { FrameExperienceConfig } from "@/lib/experiences/types";

export type PanelState = "hero" | number;

/** Same panel mapping as FrameExperience scroll tick. */
export function resolvePanel(
  progress: number,
  config: FrameExperienceConfig,
): PanelState {
  if (progress < config.heroEnd) return "hero";
  return Math.min(
    config.scenes.length - 1,
    Math.floor(progress * config.scenes.length),
  );
}
