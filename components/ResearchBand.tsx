import manifest from "@/content/manifest.json";

const items = [
  {
    href: "/methodology",
    label: "methodology",
    title: "How scoring works",
    description: "The five-minute version: the repair loop, the metric family, and the calibration gates.",
    status: manifest.methodology_version,
  },
  {
    href: "/paper",
    label: "working paper",
    title: "The full protocol",
    description: "Web version and PDF of the white paper, with version history and citation.",
    status: "under review",
  },
  {
    href: "/pilot",
    label: "pilot",
    title: "Six-task pilot and shakedown",
    description: "The Kaggle development shakedown is complete; report-grade execution remains pending.",
    status: "shakedown complete",
  },
  {
    href: "/data",
    label: "data",
    title: "Evidence & downloads",
    description: "Row-level exports, price sheets, licenses, and provenance for every number shown.",
    status: "preview",
  },
];

export default function ResearchBand() {
  return (
    <section id="research" className="border-t border-line bg-plane-2">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="h-px w-6 bg-waterline" />
          <span className="eyebrow">Research &amp; evidence</span>
        </div>
        <h2 className="mb-8 max-w-2xl font-display text-2xl leading-tight text-ink sm:text-3xl">
          Everything behind the numbers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group panel flex flex-col p-5 transition-colors hover:border-line-strong"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="eyebrow">{item.label}</span>
                <span className="font-mono text-[0.62rem] uppercase text-muted">{item.status}</span>
              </div>
              <div className="mt-3 font-display text-[1.05rem] leading-snug text-ink">{item.title}</div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{item.description}</p>
              <span className="mt-4 text-sm font-medium text-brand transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
