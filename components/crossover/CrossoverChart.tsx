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
import Facet from "./Facet";

const DOMAINS: Record<Metric, { domain: [number, number]; ticks: number[] }> = {
  cpsc: { domain: [0.02, 1.8], ticks: [0.03, 0.1, 0.3, 1] },
  tps: { domain: [15000, 1500000], ticks: [20000, 50000, 100000, 300000, 1000000] },
};

export default function CrossoverChart() {
  const [metric, setMetric] = useState<Metric>("cpsc");
  const [highlight, setHighlight] = useState<string | null>(null);
  const hue = useHue();
  const values = measuredValues(metric);
  const base = DOMAINS[metric];
  const domain: [number, number] = [
    Math.min(base.domain[0], Math.min(...values) * 0.85),
    Math.max(base.domain[1], Math.max(...values) * 1.15),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Metric" className="inline-flex rounded-full border border-line bg-surface p-1">
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
            ticks={base.ticks}
            hue={hue}
            highlight={highlight}
            xLabels={taskLabelsFor(c.id)}
          />
        ))}
      </div>

    </div>
  );
}
