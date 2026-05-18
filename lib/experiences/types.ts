import type { SceneContent } from "@/lib/scenes";

export type SceneBreakpoint = {
  start: number;
  end: number;
};

export type FrameExperienceConfig = {
  id: string;
  ariaLabel: string;
  projectName: string;
  subtitle: string;
  hint?: string;
  heroStats?: { label: string }[];
  brandLabel?: string;
  projectType?: string;
  featureLine?: string;
  surfaceLine?: string;
  location?: string;
  scenes: SceneContent[];
  framePath: string;
  /** Optional mobile frame sequence (e.g. /frames-mobile/dusk/frame_) */
  mobileFramePath?: string;
  totalFrames: number;
  /** Frame count for mobile sequence when it differs from desktop */
  mobileTotalFrames?: number;
  /** First frame index (default 1) */
  startFrame?: number;
  /** Last frame index used for scroll (defaults to totalFrames) */
  endFrame?: number;
  scrollHeightVh: number;
  extractHint: string;
  /** Override default “Frames not found” copy */
  fallbackMessage?: string;
  heroEnd: number;
  sceneBreakpoints: SceneBreakpoint[];
  /** Stricter swap: only update <img> after decode; ignore stale loads (Dusk only) */
  strictAntiFlicker?: boolean;
};
