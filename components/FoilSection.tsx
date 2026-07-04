import { Section, SectionHeader } from "./Section";
import FoilCharts from "./FoilCharts";
import { DEEPSWE_SOURCE } from "@/app/data/model";

export default function FoilSection() {
  return (
    <Section id="foil" className="border-t border-line">
      <SectionHeader eyebrow="DeepSWE comparison" title="DeepSWE and ShallowSWE cost rows">
        <p>
          Effort-matched rows with DeepSWE dollars per solved task and ShallowSWE cost per successful completion.
        </p>
      </SectionHeader>

      <div className="panel mt-8 p-4 sm:p-6" style={{ boxShadow: "var(--shadow)" }}>
        <FoilCharts />
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted">
        effort-matched rows · deep: measured — {DEEPSWE_SOURCE.name}, {DEEPSWE_SOURCE.generatedAt}; $ per solved =
        mean_cost_usd ÷ pass@1 · shallow: measured — ShallowSWE equal-category basket
      </p>
    </Section>
  );
}
