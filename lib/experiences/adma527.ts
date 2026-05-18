import type { FrameExperienceConfig } from "@/lib/experiences/types";
import type { SceneContent } from "@/lib/scenes";

export const ADMA527_SCENES: SceneContent[] = [
  {
    id: "arrival",
    index: "01",
    title: "Glass Arrival",
    description:
      "The camera enters directly through the ground-floor glass bay into the private living space.",
    metrics: [
      { label: "Ground-floor Entry" },
      { label: "Glass Bay" },
      { label: "Private Living" },
    ],
  },
  {
    id: "interior",
    index: "02",
    title: "Private Interior",
    description:
      "Warm materials, clean lines and a calm residential atmosphere.",
    metrics: [
      { label: "Premium Finishes" },
      { label: "Natural Light" },
      { label: "Private Living" },
    ],
  },
  {
    id: "pool",
    index: "03",
    title: "Pool Terrace",
    description:
      "Outdoor living unfolds around water, greenery and stone.",
    metrics: [
      { label: "Pool Terrace" },
      { label: "Outdoor Lounge" },
      { label: "Stone Landscape" },
    ],
  },
  {
    id: "facade",
    index: "04",
    title: "Side Facade",
    description:
      "A final lateral perspective reveals the scale and rhythm of the residence.",
    metrics: [
      { label: "2,300sqm Built Up Area" },
      { label: "Glass Balconies" },
      { label: "Elevated Residence" },
    ],
  },
];

export const ADMA527_EXPERIENCE: FrameExperienceConfig = {
  id: "adma527-experience",
  ariaLabel: "Adma 527 frame sequence",
  projectName: "Adma 527",
  subtitle:
    "Seven luxury apartments shaped by stone, glass and elevated living.",
  hint: "Scroll to explore",
  location: "Adma",
  projectType: "7 Luxury Apartments",
  surfaceLine: "2,300sqm Built Up Area",
  heroStats: [
    { label: "Adma" },
    { label: "7 Luxury Apartments" },
    { label: "2,300sqm Built Up Area" },
  ],
  scenes: ADMA527_SCENES,
  framePath: "/frames/adma-527-final/frame_",
  totalFrames: 636,
  startFrame: 1,
  scrollHeightVh: 400,
  extractHint: "npm run extract:frames:adma527:final",
  fallbackMessage:
    "Adma 527 frames not found. Run npm run extract:frames:adma527:final.",
  heroEnd: 0.08,
  sceneBreakpoints: [
    { start: 0, end: 0.25 },
    { start: 0.25, end: 0.5 },
    { start: 0.5, end: 0.75 },
    { start: 0.75, end: 1 },
  ],
};
