import type { FrameExperienceConfig } from "@/lib/experiences/types";
import type { SceneContent } from "@/lib/scenes";

export const BEKISH_SCENES: SceneContent[] = [
  {
    id: "reveal",
    index: "01",
    title: "Project Reveal",
    description:
      "A contemporary residential volume emerging from the landscape.",
    metrics: [
      { label: "Bekish" },
      { label: "6 Duplex Chalets" },
      { label: "Private Residence" },
    ],
  },
  {
    id: "approach",
    index: "02",
    title: "Balconies and terraces for all units",
    description: "Each unit has its own private exterior space",
    metrics: [
      { label: "Layered Facade" },
      { label: "Private Terraces" },
      { label: "Open Sea View" },
    ],
  },
  {
    id: "interior",
    index: "03",
    title: "Interior Sequence",
    description:
      "The experience flows inside, revealing warm living spaces and refined materials.",
    metrics: [
      { label: "Warm Interiors" },
      { label: "Natural Light" },
      { label: "Premium Finishes" },
    ],
  },
  {
    id: "final",
    index: "04",
    title: "Back Façade",
    description:
      "A complete cinematic overview of the project and its residential scale.",
    metrics: [
      { label: "1,200sqm Built Up Area" },
      { label: "6 Duplex Chalets" },
      { label: "Bekish Location" },
    ],
  },
];

export const BEKISH_EXPERIENCE: FrameExperienceConfig = {
  id: "bekish-experience",
  ariaLabel: "Bekish 6358 frame sequence",
  projectName: "Bekish 6358",
  subtitle: "Six duplex chalets shaped by light, stone and privacy.",
  hint: "Scroll to explore",
  location: "Bekish",
  heroStats: [
    { label: "Bekish" },
    { label: "6 Duplex Chalets" },
    { label: "1,200sqm Built Up Area" },
  ],
  scenes: BEKISH_SCENES,
  framePath: "/frames/bekish-final/frame_",
  mobileFramePath: "/frames-mobile/bekish-6358-9-16/frame_",
  totalFrames: 769,
  mobileTotalFrames: 380,
  startFrame: 1,
  scrollHeightVh: 400,
  extractHint: "npm run extract:frames:bekish:final",
  heroEnd: 0.08,
  sceneBreakpoints: [
    { start: 0, end: 0.25 },
    { start: 0.25, end: 0.5 },
    { start: 0.5, end: 0.75 },
    { start: 0.75, end: 1 },
  ],
};
