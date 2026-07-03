import { Section, SectionHeader } from "./Section";
import CrossoverChart from "./crossover/CrossoverChart";
import Leaderboard from "./Leaderboard";
import { PRICE_SHEET_DATE, PILOT_TRIALS } from "@/app/data/model";

export default function ChartSection() {
  return (
    <Section id="chart">
      <SectionHeader eyebrow="Measured task map" title={<>Where cheap stops being cheap</>}>
        <p>
          Cost — or tokens — per successful completion, by pilot task. Lines sink when a model spends more tokens,
          money, or retries to get the same work done.
        </p>
      </SectionHeader>

      <div className="mt-8">
        <CrossoverChart />
      </div>

      <div className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display text-xl text-ink">Suite leaderboard</h3>
          <span className="font-mono text-[0.7rem] text-muted">declared basket · sortable</span>
        </div>
        <Leaderboard />
      </div>

      <p className="mt-6 font-mono text-[0.7rem] leading-relaxed text-muted">
        {PILOT_TRIALS} measured Pier trials · mini-swe-agent · priced on openrouter {PRICE_SHEET_DATE} · failures are
        included in CPSC
      </p>
    </Section>
  );
}
