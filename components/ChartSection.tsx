import { Section, SectionHeader } from "./Section";
import CostAnatomyChart from "./CostAnatomyChart";
import CrossoverChart from "./crossover/CrossoverChart";
import EffortCharts from "./EffortCharts";
import Leaderboard from "./Leaderboard";
import { PRICE_SHEET_DATE, SEED_COVERAGE, SUITE_TASKS } from "@/app/data/model";

export default function ChartSection() {
  return (
    <Section id="chart">
      <SectionHeader eyebrow="The leaderboard" title={<>Cost per verified success</>}>
        <p>
          Each row gives one model one task. When the model says it is done, hidden checks run; it keeps fixing until
          they pass or a cap stops it. That whole attempt is a <b className="font-semibold text-ink">repair loop</b> —
          and every dollar of it counts, failed tries included.
        </p>
      </SectionHeader>

      <div className="mt-8">
        <Leaderboard />
      </div>

      <div className="mt-6">
        <CostAnatomyChart />
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
            Turns · first-check pass · task breakdown
          </span>
        </summary>
        <div className="space-y-8 border-t border-line px-4 py-5 sm:px-5">
          <EffortCharts />
          <CrossoverChart />
        </div>
      </details>

      <p className="mt-6 font-mono text-[0.7rem] leading-relaxed text-muted">
        basket-weighted · {SUITE_TASKS} tasks · N={SEED_COVERAGE} seeds per task/model · treat close ranks as ties ·
        mini-swe-agent · openrouter {PRICE_SHEET_DATE} ·
        Solved = verified successes / scored repair loops · scored failures and cap hits included in CPSC · infra
        exclusions tracked in raw rows and retried for coverage
      </p>
    </Section>
  );
}
