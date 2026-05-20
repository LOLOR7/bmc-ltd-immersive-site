import Header from "@/components/Header";
import HomeProjectsFlow from "@/components/HomeProjectsFlow";
import IntroBrandHero from "@/components/IntroBrandHero";

export default function Home() {
  return (
    <main id="architecture" className="relative bg-[#050505]">
      <Header />
      <IntroBrandHero />
      {/*
       * `HomeProjectsFlow` decides whether to render `FinalSection`:
       *   - desktop: always appended after the last `FrameExperience`.
       *   - mobile : appended by `MobileVideoJourney` only once the last
       *     batch of progressive-disclosure projects has been revealed.
       */}
      <HomeProjectsFlow />
    </main>
  );
}
