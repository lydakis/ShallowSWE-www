import HeroDepth from "./HeroDepth";
import { PANEL_SIZE, PILOT_TRIALS, ROLLOUTS, SUITE_TASKS, PRICE_SHEET_DATE } from "@/app/data/model";

const stats = [
  { v: String(SUITE_TASKS), l: "pilot tasks" },
  { v: String(PANEL_SIZE), l: "model-effort rows" },
  { v: String(ROLLOUTS), l: "rollouts per task" },
  { v: String(PILOT_TRIALS), l: "measured trials" },
  { v: "CPSC", l: "the score is cost" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-6xl px-4 pb-0 pt-12 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Thesis */}
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[0.68rem] tracking-wide text-ink-2">
                <span className="h-1.5 w-1.5 rounded-full bg-waterline" />
                MEASURED PILOT
              </span>
              <span className="font-mono text-[0.68rem] tracking-wide text-muted">
                snapshot {PRICE_SHEET_DATE}
              </span>
            </div>

            <h1 className="font-display text-[2.65rem] leading-[0.98] tracking-tight text-ink sm:text-6xl">
              The score isn&rsquo;t accuracy.
              <br />
              <span className="relative inline-block">
                The score is cost.
                <span className="waterline absolute -bottom-2 left-0 right-0" aria-hidden />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-2">
              Most real LLM work is routine — small fixes, data reshaping, and
              a few agentic steps. This pilot measures those tasks directly:
              dollars, tokens, turns, and pass rate for every attempt.
            </p>
            <p className="mt-3 max-w-xl text-[1.05rem] leading-relaxed text-muted">
              Same rigor as DeepSWE. The opposite end of the pool.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#chart"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5"
                style={{ color: "var(--plane)" }}
              >
                See the crossover
                <span className="transition-transform group-hover:translate-y-0.5">↓</span>
              </a>
              <a
                href="#method"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Signature depth gauge */}
          <div className="panel p-4 sm:p-5" style={{ boxShadow: "var(--shadow)" }}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="eyebrow">Depth gauge</span>
              <span className="font-mono text-[0.68rem] text-muted">measured</span>
            </div>
            <HeroDepth />
          </div>
        </div>

        {/* waterline + stats */}
        <div className="mt-12 sm:mt-16">
          <div className="waterline" aria-hidden />
          <dl className="grid grid-cols-2 divide-line border-line sm:grid-cols-3 md:grid-cols-5">
            {stats.map((s, i) => (
              <div
                key={s.l}
                className={`border-b border-line px-1 py-5 ${i % 2 === 0 ? "border-r sm:border-r" : ""} ${
                  i === 2 ? "sm:border-r" : ""
                } md:border-r md:last:border-r-0`}
              >
                <dt className="font-display text-2xl text-ink tnum sm:text-[1.7rem]">{s.v}</dt>
                <dd className="mt-1 text-xs text-muted">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
