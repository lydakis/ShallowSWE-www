import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ChartSection from "@/components/ChartSection";
import FoilSection from "@/components/FoilSection";
import Suite from "@/components/Suite";
import Method from "@/components/Method";
import Footer from "@/components/Footer";
import StickyMixer from "@/components/StickyMixer";
import { WeightsProvider } from "@/lib/weights";
import { ModelSelectionProvider } from "@/lib/model-selection";

export default function Home() {
  return (
    <WeightsProvider>
      <ModelSelectionProvider>
        <Nav />
        <StickyMixer />
        <main>
          <Hero />
          <ChartSection />
          <FoilSection />
          <Suite />
          <Method />
        </main>
        <Footer />
      </ModelSelectionProvider>
    </WeightsProvider>
  );
}
