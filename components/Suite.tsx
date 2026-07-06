import { Section, SectionHeader } from "./Section";
import { categories, sizes, tasks, SUITE_TASKS } from "@/app/data/model";

export default function Suite() {
  return (
    <Section id="suite" className="border-t border-line">
      <SectionHeader eyebrow="The tasks" title="Task set">
        <p>
          {SUITE_TASKS} original tasks: three kinds of everyday work, each in small, medium, and large. Built for the
          Pier harness.
        </p>
      </SectionHeader>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="panel p-5">
            <h3 className="font-display text-lg text-ink">{c.label}</h3>
            <div className="eyebrow mt-1">{c.gloss}</div>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">{c.detail}</p>
            <ul className="mt-4 space-y-1.5 text-xs text-muted">
              {sizes.map((size) => {
                const inCell = tasks.filter((task) => task.category === c.id && task.size === size.id);
                return (
                  <li key={size.id}>
                    <span className="font-mono text-ink-2">{size.label}</span>
                    <span className="font-mono"> · {inCell.map((task) => task.label).join(" · ")}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="eyebrow mb-4">How a task earns its spot</div>
        <ul className="grid gap-x-6 gap-y-4 lg:grid-cols-3">
          {[
            [
              "Admitted by the ceiling",
              "a task enters the suite only if a frozen frontier panel clears it one-shot at a pre-registered rate — if frontier models can't do it reliably, it isn't shallow, it's out",
            ],
            [
              "Sized by the floor",
              "small, medium, and large are measured bands, not author guesses: a cheaper probe panel's first-try pass rate decides where each task lands",
            ],
            [
              "Written from scratch",
              "nothing is adapted from public repos or benchmarks — a memorized solution takes fewer tokens than a derived one, and tokens are the entire product",
            ],
          ].map(([t, d]) => (
            <li key={t} className="flex items-start gap-2 text-sm leading-snug">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-waterline" />
              <span className="text-ink-2">
                <b className="font-semibold text-ink">{t}</b>: {d}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
