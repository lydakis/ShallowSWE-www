import { Section, SectionHeader } from "./Section";
import EffortCurveChart from "./EffortCurveChart";

export default function EffortSection() {
  return (
    <Section id="effort" className="border-t border-line">
      <SectionHeader eyebrow="Turns vs cost" title="Cost against agent turns">
        <p>
          A turn is one action the agent runs and the result it gets back. Cost per success against how many turns
          each model-effort row takes to finish.
        </p>
      </SectionHeader>

      <div className="panel mt-8 p-4 sm:p-6" style={{ boxShadow: "var(--shadow)" }}>
        <EffortCurveChart />
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted">
        measured ShallowSWE rows · reprices with the basket weights above
      </p>
    </Section>
  );
}
