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

export default function Home() {
  return (
    <>
      <Nav />
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
    </>
  );
}
