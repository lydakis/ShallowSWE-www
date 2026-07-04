import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ChartSection from "@/components/ChartSection";
import FoilSection from "@/components/FoilSection";
import EffortSection from "@/components/EffortSection";
import MeasuredSection from "@/components/MeasuredSection";
import Suite from "@/components/Suite";
import Method from "@/components/Method";
import Panel from "@/components/Panel";
import Footer from "@/components/Footer";
import StickyMixer from "@/components/StickyMixer";
import { WeightsProvider } from "@/lib/weights";

export default function Home() {
  return (
    <WeightsProvider>
      <Nav />
      <StickyMixer />
      <main>
        <Hero />
        <ChartSection />
        <FoilSection />
        <EffortSection />
        <MeasuredSection />
        <Suite />
        <Method />
        <Panel />
      </main>
      <Footer />
    </WeightsProvider>
  );
}
