import { Section, SectionHeader } from "./Section";
import EffortCurveChart from "./EffortCurveChart";

export default function EffortSection() {
  return (
    <Section id="effort" className="border-t border-line">
      <SectionHeader eyebrow="Measured effort variants" title="ShallowSWE effort rows">
        <p>
          Low and medium rows are available for GPT-5.5, Claude Opus 4.8, and Claude Sonnet 5. Single-effort rows are
          shown for GLM 5.2 high, Fable 5 low, Gemini 3.5 Flash medium, and Kimi K2.7 default.
        </p>
      </SectionHeader>

      <div className="panel mt-8 p-4 sm:p-6" style={{ boxShadow: "var(--shadow)" }}>
        <EffortCurveChart />
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted">
        measured ShallowSWE pilot rows only · effort variants are separate model-effort rows
      </p>
    </Section>
  );
}
