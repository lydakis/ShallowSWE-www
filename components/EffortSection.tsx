import { Section, SectionHeader } from "./Section";
import EffortCurveChart from "./EffortCurveChart";

export default function EffortSection() {
  return (
    <Section id="effort" className="border-t border-line">
      <SectionHeader eyebrow="Effort variants" title="Reasoning effort vs cost">
        <p>Low and medium reasoning rows for the models that publish both, same tasks.</p>
      </SectionHeader>

      <div className="panel mt-8 p-4 sm:p-6" style={{ boxShadow: "var(--shadow)" }}>
        <EffortCurveChart />
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted">
        measured ShallowSWE rows only · effort variants are separate model-effort rows
      </p>
    </Section>
  );
}
