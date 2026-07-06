import { Section, SectionHeader } from "./Section";
import FoilCharts from "./FoilCharts";
import { DEEPSWE_SOURCE } from "@/app/data/model";

export default function FoilSection() {
  return (
    <Section id="foil" className="border-t border-line">
      <SectionHeader eyebrow="DeepSWE comparison" title="The deep end against the shallow end">
        <p>
          The same models, matched effort for effort: ranked by DeepSWE pass@1 on hard tasks, and by measured cost per
          success here. Watch the order flip.
        </p>
      </SectionHeader>

      <div className="panel mt-8 overflow-hidden" style={{ boxShadow: "var(--shadow)" }}>
        <FoilCharts />
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted">
        effort-matched rows · deep: measured from {DEEPSWE_SOURCE.name}, {DEEPSWE_SOURCE.generatedAt}; intelligence axis =
        pass@1 · shallow: measured from the selected ShallowSWE CPSC basket
      </p>
    </Section>
  );
}
