import { Section, SectionHeader } from "./Section";
import CrossoverChart from "./crossover/CrossoverChart";
import Leaderboard from "./Leaderboard";
import { PRICE_SHEET_DATE, PILOT_TRIALS } from "@/app/data/model";

export default function ChartSection() {
  return (
    <Section id="chart">
      <SectionHeader eyebrow="Measured leaderboard" title={<>Cheapest per success, by declared basket</>}>
        <p>
          Cost — or tokens — per successful completion across the pilot suite. Set the basket to your workload; the board
          reprices.
        </p>
      </SectionHeader>

      <div className="mt-8">
        <Leaderboard />
      </div>

      {/* Task-level breakdown is a diagnostic: it explains where the basket price
          comes from, but it dominates when left open. Collapsed by default. */}
      <details className="group mt-6 rounded-xl border border-line bg-surface">
        <summary className="flex cursor-pointer list-none flex-col items-start gap-2 px-4 py-3 text-sm text-ink-2 transition-colors hover:text-ink sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-center">
            <span className="mr-2 font-mono text-[0.7rem] text-muted transition-transform group-open:rotate-90 inline-block">
              ▶
            </span>
            <span className="min-w-0">Task-level breakdown: where cheap stops being cheap</span>
          </span>
          <span className="eyebrow max-w-full break-words text-[0.62rem] sm:shrink-0 sm:text-[0.72rem]">
            Fix · Operate · Transform · diagnostic
          </span>
        </summary>
        <div className="border-t border-line px-4 py-5 sm:px-5">
          <CrossoverChart />
        </div>
      </details>

      <p className="mt-6 font-mono text-[0.7rem] leading-relaxed text-muted">
        {PILOT_TRIALS} measured Pier trials · mini-swe-agent · priced on openrouter {PRICE_SHEET_DATE} · failures are
        included in CPSC
      </p>
    </Section>
  );
}
