import HeroDepth from "./HeroDepth";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Thesis */}
          <div>
            <h1 className="font-display text-[2.65rem] leading-[1.03] tracking-tight text-ink sm:text-6xl">
              Every model here can already do{" "}
              <span className="relative inline-block">
                these tasks.
                <span className="waterline absolute -bottom-2 left-0 right-0" aria-hidden />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-2">
              The score isn&rsquo;t accuracy — it&rsquo;s what each one spends to finish: dollars, tokens, turns per
              success.
            </p>
            <p className="mt-3 max-w-xl text-[1.05rem] leading-relaxed text-muted">
              An independent benchmark. The opposite end of the pool from DeepSWE.
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
      </div>
    </section>
  );
}
