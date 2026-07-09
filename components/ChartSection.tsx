import { Section, SectionHeader } from "./Section";
import CostAnatomyChart from "./CostAnatomyChart";
import CrossoverChart from "./crossover/CrossoverChart";
import EffortCharts from "./EffortCharts";
import Leaderboard from "./Leaderboard";
import StickerPremiumChart from "./StickerPremiumChart";
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

      <div className="mt-12">
        <h3 className="px-1 font-display text-[1.35rem] leading-snug text-ink">The same work at two prices</h3>
        <p className="mb-4 mt-2 max-w-3xl px-1 text-sm leading-relaxed text-ink-2">
          Cost per success blends two things: how much work a model needs, and what its tokens cost. The chart below
          separates them. Each model&rsquo;s measured token usage is priced twice — at its own list price, the number
          above, and at one shared reference rate that strips pricing out and leaves token efficiency. The gap between
          the two is the <b className="font-semibold text-ink">sticker premium</b>: what the list price adds on top of
          the work itself.
        </p>
        <StickerPremiumChart />
      </div>

      {/* Diagnostics explain where the basket price comes from, but they dominate
          when left open. Collapsed by default. */}
      <details className="group mt-6 rounded-xl border border-line bg-surface">
        <summary className="flex cursor-pointer list-none flex-col items-start gap-2 px-4 py-3 text-sm text-ink-2 transition-colors hover:text-ink sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-center">
            <span className="mr-2 font-mono text-[0.7rem] text-muted transition-transform group-open:rotate-90 inline-block">
              ▶
            </span>
            <span className="min-w-0">Behind the numbers</span>
          </span>
          <span className="eyebrow max-w-full break-words text-[0.62rem] sm:shrink-0 sm:text-[0.72rem]">
            Where the dollar goes · token price and turns vs cost · task-level breakdown
          </span>
        </summary>
        <div className="space-y-8 border-t border-line px-4 py-5 sm:px-5">
          <CostAnatomyChart />
          <EffortCharts />
          <CrossoverChart />
        </div>
      </details>

      <p className="mt-6 font-mono text-[0.7rem] leading-relaxed text-muted">
        basket-weighted · {SUITE_TASKS} tasks · N={SEED_COVERAGE} seeds per task/model · 95% CIs from task-resampling
        bootstrap, overlapping CIs are ties ·
        mini-swe-agent · openrouter {PRICE_SHEET_DATE} ·
        Solved = verified successes / scored repair loops · scored failures and cap hits included in CPSC · infra
        exclusions tracked in raw rows and retried for coverage
      </p>
    </Section>
  );
}
