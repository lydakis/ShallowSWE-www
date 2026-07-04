import { Section, SectionHeader } from "./Section";
import CrossoverChart from "./crossover/CrossoverChart";
import EffortCurveChart from "./EffortCurveChart";
import Leaderboard from "./Leaderboard";
import { PRICE_SHEET_DATE, SUITE_TASKS } from "@/app/data/model";

export default function ChartSection() {
  return (
    <Section id="chart">
      <SectionHeader eyebrow="Measured leaderboard" title={<>Cost leaderboard</>}>
        <p>
          Cost, tokens, pass rate, and turns per successful completion across all five tasks. Set the basket weights to
          reprice the leaderboard.
        </p>
      </SectionHeader>

      <div className="mt-8">
        <Leaderboard />
      </div>

      {/* Diagnostics explain where the basket price comes from, but they dominate
          when left open. Collapsed by default. */}
      <details className="group mt-6 rounded-xl border border-line bg-surface">
        <summary className="flex cursor-pointer list-none flex-col items-start gap-2 px-4 py-3 text-sm text-ink-2 transition-colors hover:text-ink sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-center">
            <span className="mr-2 font-mono text-[0.7rem] text-muted transition-transform group-open:rotate-90 inline-block">
              ▶
            </span>
            <span className="min-w-0">Run diagnostics</span>
          </span>
          <span className="eyebrow max-w-full break-words text-[0.62rem] sm:shrink-0 sm:text-[0.72rem]">
            Task breakdown · turns · diagnostic
          </span>
        </summary>
        <div className="space-y-8 border-t border-line px-4 py-5 sm:px-5">
          <div>
            <div className="mb-3 font-display text-base text-ink">Task-level breakdown</div>
            <CrossoverChart />
          </div>
          <div className="pt-1">
            <EffortCurveChart />
          </div>
        </div>
      </details>

      <p className="mt-6 font-mono text-[0.7rem] leading-relaxed text-muted">
        basket-weighted · {SUITE_TASKS} tasks · attempts shown per row · mini-swe-agent · openrouter{" "}
        {PRICE_SHEET_DATE} · failures included in CPSC
      </p>
    </Section>
  );
}
