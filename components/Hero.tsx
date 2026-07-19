import HeroDepth from "./HeroDepth";
import { SEED_COVERAGE, SUITE_TASKS } from "@/app/data/model";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Thesis */}
          <div>
            <p className="eyebrow mb-4">
              Preview · {SUITE_TASKS} tasks · N={SEED_COVERAGE} seeds
            </p>
            <h1 className="font-display text-[2.65rem] leading-[1.03] text-ink sm:text-6xl">
              Not every task needs a frontier model.
            </h1>

            <p className="mt-6 max-w-xl text-[1.15rem] leading-relaxed text-ink-2">
              ShallowSWE selects tasks frontier agents should handle easily: everyday fixes, artifacts, workflow updates,
              and repo operations. That is deliberate. If frontier models struggle, the suite is measuring maximum SWE
              capability again; if they do not, the ranking can focus on cost per verified success.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#chart"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5"
                style={{ color: "var(--plane)" }}
              >
                See the leaderboard
                <span className="transition-transform group-hover:translate-y-0.5">↓</span>
              </a>
              <a
                href="/methodology"
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
      </div>
    </section>
  );
}
