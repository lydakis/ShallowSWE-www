import { Section, SectionHeader } from "./Section";
import EffortCurveChart from "./EffortCurveChart";
import { DEEPSWE_SOURCE, DEEPSWE_COMPARISON_GENERATED_AT } from "@/app/data/model";

export default function EffortSection() {
  return (
    <Section id="effort" className="border-t border-line">
      <SectionHeader eyebrow="Effort curves · DeepSWE v1.1" title="Effort is a dial you pay for">
        <p>
          On hard SWE work, DeepSWE ran each model family across reasoning-effort levels. Pass rate climbs with effort;
          cost climbs faster. The ShallowSWE pilot fixes each model at a single effort (ringed) — it doesn&rsquo;t sweep
          effort on shallow tasks.
        </p>
      </SectionHeader>

      <div className="panel mt-8 p-4 sm:p-6" style={{ boxShadow: "var(--shadow)" }}>
        <EffortCurveChart />
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted">
        source: {DEEPSWE_SOURCE.name}, {DEEPSWE_COMPARISON_GENERATED_AT} · pass@1 and mean cost per run are DeepSWE&rsquo;s
        published values · no ShallowSWE effort sweep is claimed
      </p>
    </Section>
  );
}
