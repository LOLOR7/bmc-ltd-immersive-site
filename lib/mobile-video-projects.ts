import { ADMA_EXPERIENCE } from "@/lib/experiences/adma";
import { ADMA514_EXPERIENCE } from "@/lib/experiences/adma514";
import { ADMA527_EXPERIENCE } from "@/lib/experiences/adma527";
import { BEKISH_EXPERIENCE } from "@/lib/experiences/bekish";
import { DUSK_EXPERIENCE } from "@/lib/experiences/dusk";
import type { FrameExperienceConfig } from "@/lib/experiences/types";
import { HOME_VIDEO_SCROLL } from "@/lib/home-video-scroll";

export type MobileVideoProject = {
  /** 0-based index for progress bar (0 = first project) */
  index: number;
  slug: string;
  title: string;
  /** Intro copy — distinct from in-experience overlay texts */
  introDescription: string;
  videoSrc: string;
  config: FrameExperienceConfig;
};

export const MOBILE_VIDEO_PROJECTS: MobileVideoProject[] = [
  {
    index: 0,
    slug: "adma-cliff",
    title: "Adma Cliff House",
    introDescription:
      "Perched on the cliffs of Adma, Adma Cliff House is a suspended concrete villa designed to blend bold architecture with its natural surroundings. Spanning 800 sqm, the residence features 3 bedrooms, expansive living spaces, a private cinema, gym, pool, and panoramic terraces overlooking the sea and mountains.",
    videoSrc: HOME_VIDEO_SCROLL.admaCliff,
    config: ADMA_EXPERIENCE,
  },
  {
    index: 1,
    slug: "bekish",
    title: "Bekish 6358",
    introDescription:
      "Located in Bekish, Bekish 6358 is a collection of 6 high-end duplex residences, each offering 3 bedrooms, spacious terraces, and uninterrupted sea and mountain views. Designed with refined modern architecture, the project spans a total built-up area of 1,200 sqm.",
    videoSrc: HOME_VIDEO_SCROLL.bekish,
    config: BEKISH_EXPERIENCE,
  },
  {
    index: 2,
    slug: "adma-527",
    title: "Adma 527",
    introDescription:
      "Situated in Adma, Adma 527 is a luxury residential building composed of 7 exclusive apartments with open mountain views. The project combines modern architecture with a striking façade of exposed concrete and corten steel, creating a timeless and distinctive identity.",
    videoSrc: HOME_VIDEO_SCROLL.adma527,
    config: ADMA527_EXPERIENCE,
  },
  {
    index: 3,
    slug: "adma-514",
    title: "Adma 514",
    introDescription:
      "Adma 514 is a boutique luxury development featuring 5 exceptional residences ranging from 380 sqm to 1,000 sqm. Overlooking both the sea and mountains of Adma, the project is defined by its unique architectural language, premium materials, and expansive living spaces designed for elevated contemporary living.",
    videoSrc: HOME_VIDEO_SCROLL.adma514,
    config: ADMA514_EXPERIENCE,
  },
  {
    index: 4,
    slug: "dusk",
    title: "Dusk Kfardebian",
    introDescription:
      "Located in Kfardebian just minutes away from the ski slopes, Dusk Kfardebian consists of 2 residential buildings with 4 high-end duplexes each. Every residence features 4 bedrooms, private gardens, and open mountain views, complemented by shared amenities including a private gym and landscaped outdoor spaces.",
    videoSrc: HOME_VIDEO_SCROLL.dusk,
    config: DUSK_EXPERIENCE,
  },
];

export const MOBILE_VIDEO_PROJECT_COUNT = MOBILE_VIDEO_PROJECTS.length;
