import Logo from "./Logo";
import { PRICE_SHEET_DATE } from "@/app/data/model";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-line bg-plane-2">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="waterline mb-10" aria-hidden />
        <div className="grid gap-8 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 text-ink">
              <Logo className="h-7 w-7" />
              <span className="font-display text-lg">ShallowSWE</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-2">
              A benchmark for the easy parts. Same rigor as DeepSWE, the opposite end of the pool — cost per successful
              completion, not accuracy.
            </p>
          </div>

          <nav aria-label="Sections">
            <div className="eyebrow mb-3">Explore</div>
            <ul className="space-y-2 text-sm">
              {[
                ["#chart", "Crossover map"],
                ["#foil", "Deep end vs shallow end"],
                ["#measured", "Measured pilot"],
                ["#suite", "Task suite"],
                ["#method", "Method"],
                ["#panel", "Model panel"],
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
                  rollouts.json
                </a>
              </li>
              <li>
                <a href="/data/prices-openrouter-2026-07-03.json" download className="font-mono text-ink-2 transition-colors hover:text-brand">
                  price-sheet.json
                </a>
              </li>
              <li>
                <a href="/data/workload-index.json" download className="font-mono text-ink-2 transition-colors hover:text-brand">
                  workload-index.json
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
        </div>

        <div className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
          <p>
            ShallowSWE is an independent benchmark inspired by DeepSWE&rsquo;s rigor. It is not affiliated with DeepSWE,
            Datacurve, Harbor, or Pier. All displayed ShallowSWE values are from the July 3, 2026 measured pilot run.
          </p>
          <p className="mt-2 font-mono">© {new Date().getFullYear()} ShallowSWE · the shallow end of the pool</p>
        </div>
      </div>
    </footer>
  );
}
