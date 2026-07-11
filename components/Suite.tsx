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

      <p className="mt-8 flex max-w-3xl items-start gap-2 text-sm leading-relaxed text-ink-2">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-waterline" aria-hidden />
        <span>
          <b className="font-semibold text-ink">How a task earns its spot</b>: admitted by a frozen frontier ceiling,
          sized by a measured floor panel, and written from scratch — never adapted from public repos or benchmarks.
          The full admission and quality gates are in the{" "}
          <a href="/methodology#gates" className="text-brand transition-colors hover:text-brand-bright">
            methodology
          </a>
          .
        </span>
      </p>
    </Section>
  );
}
