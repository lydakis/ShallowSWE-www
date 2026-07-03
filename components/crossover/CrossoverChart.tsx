"use client";

import { useState } from "react";
import {
  Metric,
  categories,
  measuredCells,
  measuredValues,
  metricValue,
  fmtMetric,
  panelModels,
  taskById,
  taskLabelsFor,
} from "@/app/data/model";
import { useHue } from "@/lib/hues";
import Facet from "./Facet";

const DOMAINS: Record<Metric, { domain: [number, number]; ticks: number[] }> = {
  cpsc: { domain: [0.02, 0.7], ticks: [0.03, 0.1, 0.3] },
  tps: { domain: [15000, 500000], ticks: [20000, 50000, 100000, 300000] },
};

export default function CrossoverChart() {
  const [metric, setMetric] = useState<Metric>("cpsc");
  const [highlight, setHighlight] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
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
        <button
          onClick={() => setShowTable((v) => !v)}
          className="ml-auto rounded-full border border-line px-3.5 py-1.5 font-mono text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          aria-pressed={showTable}
        >
          {showTable ? "hide table" : "view as table"}
        </button>
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

      {showTable && <MetricTable metric={metric} hue={hue} />}
    </div>
  );
}

function MetricTable({ metric, hue }: { metric: Metric; hue: (id: string) => string }) {
  const taskOrder = ["invoice-cli-regression-test-fix", "report-json-format", "config-flag-ignored", "payout-reconcile"];
  return (
    <div className="scroll-x mt-4 rounded-xl border border-line">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Measured {metric === "cpsc" ? "cost per successful completion" : "tokens per successful completion"} by model
          and task
        </caption>
        <thead>
          <tr className="border-b border-line">
            <th className="sticky left-0 bg-surface px-3 py-2 text-left font-medium text-ink-2">Model</th>
            {taskOrder.map((taskId) => (
              <th key={taskId} className="border-l border-line px-2 py-2 text-center font-medium text-ink-2">
                {taskById[taskId].label}
              </th>
            ))}
          </tr>
          <tr className="border-b border-line text-muted">
            <th className="sticky left-0 bg-surface px-3 py-1.5" />
            {taskOrder.map((taskId) => (
              <th key={taskId} className="px-2 py-1.5 text-center font-mono text-[0.66rem] font-normal">
                {taskById[taskId].tier.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {panelModels.map((m) => (
            <tr key={m.id} className="border-b border-line last:border-0">
              <th scope="row" className="sticky left-0 bg-surface px-3 py-2 text-left font-normal text-ink">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: hue(m.id) }} />
                {m.short}
              </th>
              {taskOrder.map((taskId) => {
                const cell = measuredCells.find((candidate) => candidate.modelId === m.id && candidate.taskId === taskId)!;
                return (
                  <td key={taskId} className="px-2 py-2 text-center font-mono tnum text-ink-2">
                    {fmtMetric(metricValue(cell, metric), metric)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
