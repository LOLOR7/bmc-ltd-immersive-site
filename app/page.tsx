import FinalSection from "@/components/FinalSection";
import Header from "@/components/Header";
import HomeProjectExperience from "@/components/HomeProjectExperience";
import IntroBrandHero from "@/components/IntroBrandHero";
import TransitionSection from "@/components/TransitionSection";
import { ADMA_EXPERIENCE } from "@/lib/experiences/adma";
import { ADMA514_EXPERIENCE } from "@/lib/experiences/adma514";
import { ADMA527_EXPERIENCE } from "@/lib/experiences/adma527";
import { BEKISH_EXPERIENCE } from "@/lib/experiences/bekish";
import { DUSK_EXPERIENCE } from "@/lib/experiences/dusk";
import { HOME_VIDEO_SCROLL } from "@/lib/home-video-scroll";

export default function Home() {
  return (
    <main id="architecture" className="relative bg-[#050505]">
      <Header />
      <IntroBrandHero />
      <HomeProjectExperience
        config={ADMA_EXPERIENCE}
        videoSrc={HOME_VIDEO_SCROLL.admaCliff}
      />
      <TransitionSection />
      <HomeProjectExperience
        config={BEKISH_EXPERIENCE}
        videoSrc={HOME_VIDEO_SCROLL.bekish}
      />
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
      <HomeProjectExperience
        config={ADMA527_EXPERIENCE}
        videoSrc={HOME_VIDEO_SCROLL.adma527}
      />
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
      <HomeProjectExperience
        config={ADMA514_EXPERIENCE}
        videoSrc={HOME_VIDEO_SCROLL.adma514}
      />
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
      <HomeProjectExperience
        config={DUSK_EXPERIENCE}
        videoSrc={HOME_VIDEO_SCROLL.dusk}
      />
      <FinalSection />
    </main>
  );
}
