import Logo from "./Logo";
import { PRICE_SHEET_DATE } from "@/app/data/model";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-line bg-plane">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="waterline mb-10" aria-hidden />
        <div className="grid gap-8 sm:grid-cols-[1.45fr_0.9fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 text-ink">
              <Logo className="h-7 w-7" />
              <span className="font-display text-lg">ShallowSWE</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-2">
              An independent benchmark for routine software work: cost per successful completion, not accuracy. The
              opposite end of the pool from DeepSWE.
            </p>
          </div>

          <nav aria-label="Sections">
            <div className="eyebrow mb-3">Explore</div>
            <ul className="space-y-2 text-sm">
              {[
                ["#chart", "Measured leaderboard"],
                ["#foil", "Deep end vs shallow end"],
                ["#suite", "Task suite"],
                ["#method", "Method"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-ink-2 transition-colors hover:text-brand">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <div className="eyebrow mb-3">Data</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/data/rollouts.json" download className="font-mono text-ink-2 transition-colors hover:text-brand">
                  repair-loop-rows.json
                </a>
              </li>
              <li>
                <a href="/data/prices-openrouter-2026-07-03.json" download className="font-mono text-ink-2 transition-colors hover:text-brand">
                  price-sheet.json
                </a>
              </li>
              <li>
                <a href="/data/aggregate-by-model.json" download className="font-mono text-ink-2 transition-colors hover:text-brand">
                  aggregate-by-model.json
                </a>
              </li>
              <li>
                <a href="/data/aggregate-by-task-model.json" download className="font-mono text-ink-2 transition-colors hover:text-brand">
                  aggregate-by-task-model.json
                </a>
              </li>
              <li>
                <a href="/data/deepswe-comparison.json" download className="font-mono text-ink-2 transition-colors hover:text-brand">
                  deepswe-comparison.json
                </a>
              </li>
              <li className="font-mono text-muted">snapshot {PRICE_SHEET_DATE}</li>
            </ul>
          </div>

          <div>
            <div className="eyebrow mb-3">Source</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/lydakis/ShallowSWE" className="font-mono text-ink-2 transition-colors hover:text-brand">
                  benchmark repo
                </a>
              </li>
              <li>
                <a href="https://github.com/lydakis/ShallowSWE-www" className="font-mono text-ink-2 transition-colors hover:text-brand">
                  website repo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
          <p>
            ShallowSWE is independent and not affiliated with DeepSWE, Datacurve, Harbor, or Pier. Displayed values are
            from the bounded repair-loop preview snapshot shown in the data manifest.
          </p>
          <p className="mt-2 font-mono">
            © {new Date().getFullYear()}{" "}
            <a href="https://github.com/lydakis" className="transition-colors hover:text-brand">
              George Lydakis
            </a>{" "}
            · ShallowSWE · the shallow end of the pool
          </p>
        </div>
      </div>
    </footer>
  );
}
