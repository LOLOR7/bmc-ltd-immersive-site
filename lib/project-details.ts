import { ADMA_EXPERIENCE } from "@/lib/experiences/adma";
import { ADMA514_EXPERIENCE } from "@/lib/experiences/adma514";
import { ADMA527_EXPERIENCE } from "@/lib/experiences/adma527";
import { BEKISH_EXPERIENCE } from "@/lib/experiences/bekish";
import { DUSK_EXPERIENCE } from "@/lib/experiences/dusk";
import type { FrameExperienceConfig } from "@/lib/experiences/types";

export type ProjectSlug =
  | "adma-cliff-house"
  | "bekish-6358"
  | "adma-527"
  | "adma-514"
  | "dusk";

export type ProjectGalleryImage = {
  src: string;
  alt: string;
};

export type ProjectSceneHighlight = {
  index?: string;
  title: string;
  description: string;
  tags: string[];
};

export type ProjectPageData = {
  slug: ProjectSlug;
  experienceId: string;
  title: string;
  subtitle: string;
  location?: string;
  overview: string[];
  keyFacts: string[];
  highlights: ProjectSceneHighlight[];
  gallery: ProjectGalleryImage[];
  galleryPlaceholder: string;
};

const GALLERY_PLACEHOLDER = "Project imagery will be added soon.";

const PROJECT_GALLERIES: Partial<Record<ProjectSlug, ProjectGalleryImage[]>> = {
  "adma-cliff-house": [
    {
      src: "/projects/adma-cliff-house/gallery-01.png",
      alt: "Adma Cliff House — cantilevered residence on the cliff",
    },
    {
      src: "/projects/adma-cliff-house/gallery-02.png",
      alt: "Adma Cliff House — exterior view with pool and glass facades",
    },
    {
      src: "/projects/adma-cliff-house/gallery-03.png",
      alt: "Adma Cliff House — minimalist bedroom with skylight",
    },
  ],
  "bekish-6358": [
    {
      src: "/projects/bekish-6358/gallery-01.png",
      alt: "Bekish 6358 — street-level exterior with layered facade",
    },
    {
      src: "/projects/bekish-6358/gallery-02.png",
      alt: "Bekish 6358 — hillside perspective with private terraces",
    },
    {
      src: "/projects/bekish-6358/gallery-03.png",
      alt: "Bekish 6358 — living room interior with open sea view",
    },
    {
      src: "/projects/bekish-6358/gallery-04.png",
      alt: "Bekish 6358 — double-height interior with mezzanine",
    },
  ],
  dusk: [
    {
      src: "/projects/dusk/gallery-01.png",
      alt: "Dusk — Kfardebian duplex chalets on the hillside",
    },
    {
      src: "/projects/dusk/gallery-02.png",
      alt: "Dusk — mountain retreat with glass facades at dusk",
    },
    {
      src: "/projects/dusk/gallery-03.png",
      alt: "Dusk — street-level exterior with vertical lighting",
    },
    {
      src: "/projects/dusk/gallery-04.png",
      alt: "Dusk — living room with mountain view at twilight",
    },
    {
      src: "/projects/dusk/gallery-05.png",
      alt: "Dusk — open-plan living and kitchen interior",
    },
    {
      src: "/projects/dusk/gallery-06.png",
      alt: "Dusk — master bedroom with warm ambient lighting",
    },
  ],
  "adma-527": [
    {
      src: "/projects/adma-527/gallery-01.png",
      alt: "Adma 527 — hillside residence with stone terraces",
    },
    {
      src: "/projects/adma-527/gallery-02.png",
      alt: "Adma 527 — street facade with concrete and corten steel",
    },
    {
      src: "/projects/adma-527/gallery-03.png",
      alt: "Adma 527 — infinity pool and outdoor lounge terraces",
    },
    {
      src: "/projects/adma-527/gallery-04.png",
      alt: "Adma 527 — aerial view of terrace, pool and landscaping",
    },
    {
      src: "/projects/adma-527/gallery-05.png",
      alt: "Adma 527 — lobby with sculptural staircase",
    },
    {
      src: "/projects/adma-527/gallery-06.png",
      alt: "Adma 527 — elevator hall with stone and wood finishes",
    },
    {
      src: "/projects/adma-527/gallery-07.png",
      alt: "Adma 527 — open-plan living and dining interior",
    },
  ],
  "adma-514": [
    {
      src: "/projects/adma-514/gallery-01.png",
      alt: "Adma 514 — exterior view on the hillside",
    },
    {
      src: "/projects/adma-514/gallery-02.png",
      alt: "Adma 514 — street-level facade with marble balconies",
    },
    {
      src: "/projects/adma-514/gallery-03.png",
      alt: "Adma 514 — pool terrace and outdoor living",
    },
    {
      src: "/projects/adma-514/gallery-04.png",
      alt: "Adma 514 — villa exterior with pool and sea view",
    },
    {
      src: "/projects/adma-514/gallery-05.png",
      alt: "Adma 514 — private underground garage",
    },
    {
      src: "/projects/adma-514/gallery-06.png",
      alt: "Adma 514 — marble entrance hall and staircase",
    },
    {
      src: "/projects/adma-514/gallery-07.png",
      alt: "Adma 514 — lobby with glass staircase",
    },
    {
      src: "/projects/adma-514/gallery-08.png",
      alt: "Adma 514 — entrance corridor to private garage",
    },
    {
      src: "/projects/adma-514/gallery-09.png",
      alt: "Adma 514 — double-height living room with skylight",
    },
    {
      src: "/projects/adma-514/gallery-10.png",
      alt: "Adma 514 — living room with mezzanine and city view",
    },
    {
      src: "/projects/adma-514/gallery-11.png",
      alt: "Adma 514 — open-plan living and dining area",
    },
    {
      src: "/projects/adma-514/gallery-12.png",
      alt: "Adma 514 — premium living room with travertine finishes",
    },
  ],
};

const SLUG_BY_EXPERIENCE_ID: Record<string, ProjectSlug> = {
  [ADMA_EXPERIENCE.id]: "adma-cliff-house",
  [BEKISH_EXPERIENCE.id]: "bekish-6358",
  [ADMA527_EXPERIENCE.id]: "adma-527",
  [ADMA514_EXPERIENCE.id]: "adma-514",
  [DUSK_EXPERIENCE.id]: "dusk",
};

function uniqueLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of labels) {
    const key = label.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function buildProjectPageData(
  config: FrameExperienceConfig,
  slug: ProjectSlug,
): ProjectPageData {
  const overview: string[] = [config.subtitle];
  if (config.featureLine) overview.push(config.featureLine);

  const keyFactCandidates: string[] = [];
  if (config.heroStats?.length) {
    config.heroStats.forEach((stat) => keyFactCandidates.push(stat.label));
  } else {
    if (config.brandLabel) keyFactCandidates.push(config.brandLabel);
    if (config.location) keyFactCandidates.push(config.location);
    if (config.projectType) keyFactCandidates.push(config.projectType);
    if (config.surfaceLine) keyFactCandidates.push(config.surfaceLine);
  }

  return {
    slug,
    experienceId: config.id,
    title: config.projectName,
    subtitle: config.subtitle,
    location: config.location ?? config.brandLabel,
    overview,
    keyFacts: uniqueLabels(keyFactCandidates),
    highlights: config.scenes.map((scene) => ({
      index: scene.index,
      title: scene.title,
      description: scene.description,
      tags: scene.metrics?.map((metric) => metric.label) ?? [],
    })),
    gallery: PROJECT_GALLERIES[slug] ?? [],
    galleryPlaceholder: GALLERY_PLACEHOLDER,
  };
}

export const PROJECTS: ProjectPageData[] = [
  buildProjectPageData(ADMA_EXPERIENCE, "adma-cliff-house"),
  buildProjectPageData(BEKISH_EXPERIENCE, "bekish-6358"),
  buildProjectPageData(ADMA527_EXPERIENCE, "adma-527"),
  buildProjectPageData(ADMA514_EXPERIENCE, "adma-514"),
  buildProjectPageData(DUSK_EXPERIENCE, "dusk"),
];

export const ALL_PROJECT_SLUGS: ProjectSlug[] = PROJECTS.map(
  (project) => project.slug,
);

export function getProjectBySlug(slug: string): ProjectPageData | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function getProjectSlugForExperience(
  experienceId: string,
): ProjectSlug | undefined {
  return SLUG_BY_EXPERIENCE_ID[experienceId];
}

export function getProjectHrefForExperience(
  experienceId: string,
): string | undefined {
  const slug = getProjectSlugForExperience(experienceId);
  return slug ? `/projects/${slug}` : undefined;
}

/**
 * BootLoader carousel — chemins vérifiés sur disque (public/projects/).
 * Max 6, aucun placeholder, aucune frame scroll.
 */
export const BOOT_LOADER_CAROUSEL_IMAGES: ProjectGalleryImage[] = [
  {
    src: "/projects/adma-cliff-house/gallery-01.png",
    alt: "Adma Cliff House",
  },
  {
    src: "/projects/bekish-6358/gallery-01.png",
    alt: "Bekish 6358",
  },
  {
    src: "/projects/adma-527/gallery-01.png",
    alt: "Adma 527",
  },
  {
    src: "/projects/adma-514/gallery-01.png",
    alt: "Adma 514",
  },
  {
    src: "/projects/dusk/gallery-01.png",
    alt: "Dusk",
  },
  {
    src: "/projects/bekish-6358/gallery-02.png",
    alt: "Bekish 6358",
  },
];
