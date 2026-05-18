export const PROJECT_NAME = "Adma Cliff House";

export type SceneMetric = {
  label: string;
};

export type SceneContent = {
  id: string;
  index?: string;
  title: string;
  description: string;
  metrics?: SceneMetric[];
};

export const ADMA_BRAND = "Adma";

export const HERO_COPY = {
  title: PROJECT_NAME,
  subtitle:
    "A private villa shaped for architecture, leisure and discretion.",
  hint: "Scroll to explore",
  brandLabel: ADMA_BRAND,
  projectType: "Private Villa",
  featureLine: "Cinema · Swimming Pool · Gym",
  surfaceLine: "800 sqm built-up area",
};

export const SCENE_1: SceneContent = {
  id: "reveal",
  index: "01",
  title: "Cliffside Reveal",
  description:
    "From the stone base, the full architecture slowly emerges.",
  metrics: [
    { label: "Concrete Structure" },
    { label: "Rock Integration" },
    { label: "Panoramic Position" },
  ],
};

export const SCENE_2: SceneContent = {
  id: "facade",
  index: "02",
  title: "Side View",
  description:
    "The glass volume opens the residence to the open mountain and sea view.",
  metrics: [
    { label: "Glass Facade" },
    { label: "Suspended Volume" },
    { label: "Stormy Landscape" },
  ],
};

export const SCENE_3: SceneContent = {
  id: "suite",
  index: "03",
  title: "Private Suite",
  description: "A silent concrete bedroom framed by light from above.",
  metrics: [
    { label: "Skylight" },
    { label: "Warm Linear Light" },
    { label: "Minimal Bedroom" },
  ],
};

export const FINAL_COPY = {
  title: PROJECT_NAME,
  subtitle: "Architecture as a cinematic experience.",
  primaryCta: "Request Access",
  secondaryCta: "Contact",
};

/** Scroll segment heights (vh) */
export const FRAME_SECTION_HEIGHT_VH = 300;
