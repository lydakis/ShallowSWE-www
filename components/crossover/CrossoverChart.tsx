"use client";

import { useState } from "react";
import {
  Metric,
  categories,
  measuredValues,
  panelModels,
  taskLabelsFor,
} from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { logTicks, niceLogBounds } from "@/lib/scale";
import Facet from "./Facet";

const FALLBACK_DOMAINS: Record<Metric, [number, number]> = {
  cpsc: [0.01, 2],
  tps: [5000, 2000000],
};

export default function CrossoverChart() {
  const [metric, setMetric] = useState<Metric>("cpsc");
  const [highlight, setHighlight] = useState<string | null>(null);
  const hue = useHue();
  const values = measuredValues(metric);
  const domain = niceLogBounds(values, FALLBACK_DOMAINS[metric]);
  const ticks = logTicks(domain[0], domain[1]).filter((t) => t > domain[0] && t < domain[1]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-display text-base text-ink">Task-level breakdown</div>
          <div className="mt-0.5 font-mono text-[0.66rem] text-muted">Cost and tokens per success, task by task</div>
        </div>
        <div role="tablist" aria-label="Metric" className="inline-flex self-start rounded-full border border-line bg-surface p-1 sm:self-auto">
          {(
            [
              ["cpsc", "Cost / success"],
              ["tps", "Tokens / success"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              role="tab"
              aria-selected={metric === m}
              onClick={() => setMetric(m)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                metric === m ? "bg-ink text-plane" : "text-ink-2 hover:text-ink"
              }`}
              style={metric === m ? { color: "var(--plane)" } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1.5">
        {panelModels.map((m) => {
          const on = highlight === null || highlight === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setHighlight((h) => (h === m.id ? null : m.id))}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all ${
                highlight === m.id ? "border-line-strong bg-surface-2" : "border-line"
              } ${on ? "opacity-100" : "opacity-40"}`}
              aria-pressed={highlight === m.id}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: hue(m.id) }} />
              <span className="text-ink-2">{m.short}</span>
            </button>
          );
        })}
        {highlight && (
          <button onClick={() => setHighlight(null)} className="rounded-full px-2 py-1 font-mono text-xs text-muted underline-offset-2 hover:underline">
            clear
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {categories.map((c) => (
          <Facet
            key={c.id}
            category={c}
            metric={metric}
            domain={domain}
            ticks={ticks}
            hue={hue}
            highlight={highlight}
            xLabels={taskLabelsFor(c.id)}
          />
        ))}
      </div>

    </div>
  );
}
