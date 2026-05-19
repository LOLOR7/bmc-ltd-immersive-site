"use client";

import FrameExperience from "@/components/FrameExperience";
import MobileVideoJourney from "@/components/MobileVideoJourney";
import TransitionSection from "@/components/TransitionSection";
import { ADMA_EXPERIENCE } from "@/lib/experiences/adma";
import { ADMA514_EXPERIENCE } from "@/lib/experiences/adma514";
import { ADMA527_EXPERIENCE } from "@/lib/experiences/adma527";
import { BEKISH_EXPERIENCE } from "@/lib/experiences/bekish";
import { DUSK_EXPERIENCE } from "@/lib/experiences/dusk";
import { useIsMobileViewport } from "@/lib/use-mobile-viewport";

/**
 * Home projects — desktop: frames + transition sections (unchanged).
 * Mobile: intro screens + video scroll journey + progress bar.
 */
export default function HomeProjectsFlow() {
  const isMobile = useIsMobileViewport();

  if (isMobile) {
    return <MobileVideoJourney />;
  }

  return (
    <>
      <FrameExperience config={ADMA_EXPERIENCE} />
      <TransitionSection />
      <FrameExperience config={BEKISH_EXPERIENCE} />
      <TransitionSection
        eyebrow="Next residence"
        title="Adma 527"
        subtitle="A new residential sequence in Adma."
        metrics={[
          "Adma",
          "7 Luxury Apartments",
          "2,300sqm Built Up Area",
        ]}
        ariaLabel="Before Adma 527"
      />
      <FrameExperience config={ADMA527_EXPERIENCE} />
      <TransitionSection
        eyebrow="Next residence"
        title="Adma 514"
        subtitle="A fourth architectural sequence in Adma."
        metrics={[
          "Adma",
          "5 Luxury Apartments",
          "2,600sqm Built Up Area",
        ]}
        ariaLabel="Before Adma 514"
      />
      <FrameExperience config={ADMA514_EXPERIENCE} />
      <TransitionSection
        eyebrow="Next residence"
        title="Dusk"
        subtitle="A mountain retreat in Kfardebian."
        metrics={[
          "Kfardebian",
          "8 Duplex Chalets",
          "1,800sqm Built Up Area",
        ]}
        ariaLabel="Before Dusk"
      />
      <FrameExperience config={DUSK_EXPERIENCE} />
    </>
  );
}
