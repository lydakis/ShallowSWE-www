import { Section, SectionHeader } from "./Section";
import CostQuadrantChart from "./CostQuadrantChart";
import { DEEPSWE_SOURCE } from "@/app/data/model";

export default function FoilSection() {
  return (
    <Section id="foil" className="border-t border-line">
      <SectionHeader eyebrow="Deep end → shallow end" title="Good at the deep end ≠ cheap in the shallows">
        <p>
          DeepSWE&rsquo;s leaderboard prices hard work; ShallowSWE prices easy work. Same unit, one dot per model.
        </p>
      </SectionHeader>

      <div className="panel mt-8 p-4 sm:p-6" style={{ boxShadow: "var(--shadow)" }}>
        <CostQuadrantChart />
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted">
        effort-matched rows · across: measured — {DEEPSWE_SOURCE.name}, {DEEPSWE_SOURCE.generatedAt}; $ per solved =
        mean_cost_usd ÷ pass@1 · down: measured — ShallowSWE pilot equal-category basket
      </p>
    </Section>
  );
}
