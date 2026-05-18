import { ADMA_EXPERIENCE } from "@/lib/experiences/adma";
import { ADMA514_EXPERIENCE } from "@/lib/experiences/adma514";
import { ADMA527_EXPERIENCE } from "@/lib/experiences/adma527";
import { BEKISH_EXPERIENCE } from "@/lib/experiences/bekish";
import { DUSK_EXPERIENCE } from "@/lib/experiences/dusk";
import type { FrameExperienceConfig } from "@/lib/experiences/types";

/** First frame sequence after intro — receives priority ~30-frame preload */
export const PRIMARY_EXPERIENCE: FrameExperienceConfig = ADMA_EXPERIENCE;

export const EXPERIENCE_CATALOG: FrameExperienceConfig[] = [
  ADMA_EXPERIENCE,
  BEKISH_EXPERIENCE,
  ADMA527_EXPERIENCE,
  ADMA514_EXPERIENCE,
  DUSK_EXPERIENCE,
];
