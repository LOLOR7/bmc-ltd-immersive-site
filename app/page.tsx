import FinalSection from "@/components/FinalSection";
import Header from "@/components/Header";
import HomeProjectsFlow from "@/components/HomeProjectsFlow";
import IntroBrandHero from "@/components/IntroBrandHero";

export default function Home() {
  return (
    <main id="architecture" className="relative bg-[#050505]">
      <Header />
      <IntroBrandHero />
      <HomeProjectsFlow />
      <FinalSection />
    </main>
  );
}
