import {
  SCENE_1,
  SCENE_2,
  SCENE_3,
} from "@/lib/scenes";
import type { FrameExperienceConfig } from "@/lib/experiences/types";

/** Adma Cliff House — config inchangée (577 frames, 300vh, 3 scènes) */
export const ADMA_EXPERIENCE: FrameExperienceConfig = {
  id: "experience",
  ariaLabel: "Adma Cliff House frame sequence",
  projectName: "Adma Cliff House",
  subtitle:
    "A private villa shaped for architecture, leisure and discretion.",
  brandLabel: "Adma",
  projectType: "Private Villa",
  featureLine: "Cinema · Swimming Pool · Gym",
  surfaceLine: "800 sqm built-up area",
  hint: "Scroll to explore",
  scenes: [SCENE_1, SCENE_2, SCENE_3],
  framePath: "/frames/frame_",
  mobileFramePath: "/frames-mobile/adma-cliff-house-9-6/frame_",
  totalFrames: 577,
  mobileTotalFrames: 433,
  /** Warm scene 2→3 transition on mobile (~frame 289). */
  mobilePreloadHints: Array.from({ length: 56 }, (_, i) => 260 + i),
  scrollHeightVh: 300,
  extractHint: "npm run extract:frames",
  heroEnd: 0.1,
  sceneBreakpoints: [
    { start: 0.1, end: 0.33 },
    { start: 0.33, end: 0.66 },
    { start: 0.66, end: 1 },
  ],
  strictAntiFlicker: true,
};
