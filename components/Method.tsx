import { Section, SectionHeader } from "./Section";
import { PRICE_SHEET_DATE, ROLLOUTS } from "@/app/data/model";

const principles = [
  ["Programmatic verifiers only", "no LLM judges anywhere in the scoring path"],
  ["One scaffold, held constant", "mini-swe-agent, zero per-model tuning"],
  [`${ROLLOUTS} rollouts per task`, "full Pier trajectories stored locally and rollup JSON published"],
  ["Tokens are canonical", "dollars derived from a dated, versioned price sheet"],
  ["No wall-clock time", "not reproducible across providers and hosts"],
  ["Infra failures excluded", "retried until scored; exclusion counts published"],
];

export default function Method() {
  return (
    <Section id="method" className="border-t border-line">
      <SectionHeader eyebrow="Method" title="How the score is measured">
        <p>
          Cost is averaged over <em className="not-italic text-ink">every</em> attempt — passes and failures — then
          divided by pass rate. A flaky model pays its own retry tax.
        </p>
      </SectionHeader>

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        {/* formula */}
        <div className="panel flex flex-col justify-center p-6 sm:p-8">
          <div className="eyebrow mb-5">the metric</div>
          <div className="flex items-center gap-4 font-display">
            <span className="text-2xl text-ink sm:text-3xl">CPSC</span>
            <span className="text-2xl text-muted sm:text-3xl">=</span>
            <span className="flex flex-col text-center">
              <span className="px-2 pb-2 text-base text-ink sm:text-lg">mean cost per attempt</span>
              <span className="border-t border-line-strong px-2 pt-2 text-base text-ink sm:text-lg">pass rate</span>
            </span>
          </div>
          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-ink-2">
            <b className="font-semibold text-ink">Tokens per success</b>{" "}is the same formula in tokens — the
            pricing-independent number.
          </p>
        </div>

        {/* principles */}
        <ul className="grid content-center gap-x-6 gap-y-3 sm:grid-cols-2">
          {principles.map(([t, d]) => (
            <li key={t} className="flex items-start gap-2 text-sm leading-snug">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-waterline" />
              <span className="text-ink-2">
                <b className="font-semibold text-ink">{t}</b>{" "}— {d}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* measured artifacts */}
      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-line bg-surface-2 p-5 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-relaxed text-ink-2">
          <b className="font-semibold text-ink">Measured.</b>{" "}Every ShallowSWE number on this page comes from the
          measured rollouts, with dollar values derived from the dated{" "}
          <span className="font-mono text-ink">openrouter {PRICE_SHEET_DATE}</span> price sheet. DeepSWE values are its
          published v1.1 leaderboard, shown for context and never blended in.
        </p>
        <a
          href="/data/rollouts.json"
          download
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand sm:self-auto"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          rollouts.json
        </a>
      </div>
    </Section>
  );
}
