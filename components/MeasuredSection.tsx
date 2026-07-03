import { Section, SectionHeader } from "./Section";
import ModelDot from "./ModelDot";
import {
  PILOT_TRIALS,
  PRICE_SHEET_DATE,
  ROLLOUTS,
  SUITE_TASKS,
  fmtTokens,
  fmtUsd,
  modelById,
  pilotModelRows,
} from "@/app/data/model";

export default function MeasuredSection() {
  return (
    <Section id="measured" className="border-t border-line">
      <SectionHeader eyebrow="Measured pilot" title="Receipts from the run">
        <p>
          This table is the full pilot run: {SUITE_TASKS} tasks, {ROLLOUTS} rollouts per model-task pair, {PILOT_TRIALS}{" "}
          Pier trials, mini-swe-agent held constant.
        </p>
      </SectionHeader>

      <div className="scroll-x mt-8 rounded-xl border border-line">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Measured pilot results by model-effort row</caption>
          <thead>
            <tr className="border-b border-line text-left">
              {["Model", "Pass", "Turns", "Tokens / success", "Input", "Output", "Cache read", "Reasoning", "CPSC"].map((h, i) => (
                <th key={h} className={`px-3 py-2.5 font-medium text-ink-2 ${i === 0 ? "" : "text-right"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...pilotModelRows]
              .sort((a, b) => a.cpsc - b.cpsc)
              .map((row) => {
                const model = modelById[row.modelId];
                return (
                  <tr key={row.modelId} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-2.5 text-left font-normal text-ink">
                      <ModelDot id={row.modelId} />
                      {model.label}
                      <span className="ml-1.5 font-mono text-[0.7rem] text-muted">{model.effort ?? "default"}</span>
                    </th>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-good">
                      {row.passes}/{row.attempts}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-ink-2">{row.turns.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-ink">{fmtTokens(row.tokensPerSuccess)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-muted">{fmtTokens(row.inputTokens)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-muted">{fmtTokens(row.outputTokens)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-muted">{fmtTokens(row.cacheRead)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-muted">{fmtTokens(row.reasoningTokens)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-ink">{fmtUsd(row.cpsc)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 font-mono text-[0.7rem] leading-relaxed text-muted">
        pass count over scored attempts · priced on openrouter {PRICE_SHEET_DATE} ·{" "}
        <a href="/data/rollouts.json" download className="text-brand underline-offset-2 hover:underline">
          rollouts.json
        </a>{" "}
        ·{" "}
        <a href="/data/aggregate-by-model.json" download className="text-brand underline-offset-2 hover:underline">
          aggregate-by-model.json
        </a>
      </p>
    </Section>
  );
}
