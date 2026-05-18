import type { FrameExperienceConfig } from "@/lib/experiences/types";
import type { SceneContent } from "@/lib/scenes";

export const ADMA514_SCENES: SceneContent[] = [
  {
    id: "arrival",
    index: "01",
    title: "Exterior View",
    description:
      "The residence appears from the road with a calm architectural presence.",
    metrics: [
      { label: "Adma Location" },
      { label: "5 Luxury Apartments" },
      { label: "Urban Hillside" },
    ],
  },
  {
    id: "pool",
    index: "02",
    title: "Pool Terrace",
    description:
      "Outdoor living unfolds around water, greenery and private lounge spaces.",
    metrics: [
      { label: "Private Pool" },
      { label: "Outdoor Lounge" },
      { label: "Landscape View" },
    ],
  },
  {
    id: "interior",
    index: "03",
    title: "Spacious Interiors",
    description:
      "A double-height interior reveals volume, light and refined materials.",
    metrics: [
      { label: "Double-height Volume" },
      { label: "Skylight" },
      { label: "Premium Interior" },
    ],
  },
  {
    id: "garage",
    index: "04",
    title: "Private Garage",
    description:
      "A dark glass corridor leads to a private garage made for luxury cars.",
    metrics: [
      { label: "Private Access" },
      { label: "Luxury Garage" },
      { label: "Linear LED Lighting" },
    ],
  },
];

export const ADMA514_EXPERIENCE: FrameExperienceConfig = {
  id: "adma514-experience",
  ariaLabel: "Adma 514 frame sequence",
  projectName: "Adma 514",
  subtitle:
    "Five luxury apartments shaped by light, privacy and cinematic movement.",
  hint: "Scroll to explore",
  location: "Adma",
  projectType: "5 Luxury Apartments",
  surfaceLine: "2,600sqm Built Up Area",
  heroStats: [
    { label: "Adma" },
    { label: "5 Luxury Apartments" },
    { label: "2,600sqm Built Up Area" },
  ],
  scenes: ADMA514_SCENES,
  framePath: "/frames/adma-514/frame_",
  mobileFramePath: "/frames-mobile/adma-514-9-16/frame_",
  totalFrames: 597,
  mobileTotalFrames: 429,
  startFrame: 1,
  scrollHeightVh: 400,
  extractHint: "npm run extract:frames:adma514",
  fallbackMessage:
    "Adma 514 frames not found. Run npm run extract:frames:adma514.",
  heroEnd: 0.08,
  sceneBreakpoints: [
    { start: 0, end: 0.25 },
    { start: 0.25, end: 0.5 },
    { start: 0.5, end: 0.75 },
    { start: 0.75, end: 1 },
  ],
  strictAntiFlicker: true,
};
