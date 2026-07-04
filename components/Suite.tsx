import { Section, SectionHeader } from "./Section";
import { categories, tasks, SUITE_TASKS } from "@/app/data/model";

export default function Suite() {
  return (
    <Section id="suite" className="border-t border-line">
      <SectionHeader eyebrow="The tasks" title="Task set">
        <p>{SUITE_TASKS} original Pier-compatible tasks, all in the same weighted basket.</p>
      </SectionHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="panel p-5">
            <h3 className="font-display text-lg text-ink">{c.label}</h3>
            <div className="eyebrow mt-1">{c.gloss}</div>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">{c.detail}</p>
            <ul className="mt-4 space-y-1.5 text-xs text-muted">
              {tasks
                .filter((task) => task.category === c.id)
                .map((task) => (
                  <li key={task.id} className="font-mono">
                    {task.tier.toUpperCase()} · {task.label}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[0.7rem] text-muted">
        T2 routine · T3 mildly gnarly · T4 shelf edge · scored by programmatic verifiers inside Pier
      </p>
    </Section>
  );
}
