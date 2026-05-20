import type { FrameExperienceConfig } from "@/lib/experiences/types";
import type { SceneContent } from "@/lib/scenes";

export const DUSK_SCENES: SceneContent[] = [
  {
    id: "arrival",
    index: "01",
    title: "Mountain Arrival",
    description:
      "A calm approach reveals the chalets within the Kfardebian landscape.",
    metrics: [
      { label: "Kfardebian" },
      { label: "8 Duplex Chalets" },
      { label: "Mountain Setting" },
    ],
  },
  {
    id: "reveal",
    index: "02",
    title: "Architectural Reveal",
    description:
      "Concrete, glass and warm light define a private alpine residence.",
    metrics: [
      { label: "Duplex Chalets" },
      { label: "Premium Architecture" },
      { label: "Evening Light" },
    ],
  },
  {
    id: "interior",
    index: "03",
    title: "Interior Passage",
    description:
      "The camera moves through warm interiors and quiet residential volumes.",
    metrics: [
      { label: "Private Living" },
      { label: "Warm Materials" },
      { label: "Immersive Sequence" },
    ],
  },
  {
    id: "final",
    index: "04",
    title: "Final Perspective",
    description:
      "A complete cinematic overview of the project and its mountain scale.",
    metrics: [
      { label: "1,800sqm Built Up Area" },
      { label: "8 Duplex Chalets" },
      { label: "Dusk Collection" },
    ],
  },
];

export const DUSK_EXPERIENCE: FrameExperienceConfig = {
  id: "dusk-experience",
  ariaLabel: "Dusk frame sequence",
  projectName: "Dusk",
  subtitle: "A mountain retreat shaped by glass, stone and evening light.",
  hint: "Scroll to explore",
  location: "Kfardebian",
  projectType: "8 Duplex Chalets",
  surfaceLine: "1,800sqm Built Up Area",
  heroStats: [
    { label: "Kfardebian" },
    { label: "8 Duplex Chalets" },
    { label: "1,800sqm Built Up Area" },
  ],
  scenes: DUSK_SCENES,
  framePath: "/frames/dusk/frame_",
  mobileFramePath: "/frames-mobile/dusk-9-16-webp/frame_",
  mobileFrameExtension: "webp",
  totalFrames: 435,
  mobileTotalFrames: 326,
  startFrame: 1,
  scrollHeightVh: 400,
  extractHint: "npm run extract:frames:dusk",
  fallbackMessage: "Frames not found for Dusk. Run npm run extract:frames:dusk.",
  heroEnd: 0.08,
  sceneBreakpoints: [
    { start: 0, end: 0.25 },
    { start: 0.25, end: 0.5 },
    { start: 0.5, end: 0.75 },
    { start: 0.75, end: 1 },
  ],
  strictAntiFlicker: true,
  /** Stop scrub before the final zoom-out reveals distorted left building. */
  endTrimSeconds: 1,
};
