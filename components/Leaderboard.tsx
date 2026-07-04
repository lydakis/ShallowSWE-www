"use client";

import { useState } from "react";
import {
  weightedAggregates,
  EQUAL_WEIGHTS,
  CategoryWeights,
  categories,
  modelById,
  fmtUsd,
  fmtTokens,
} from "@/app/data/model";
import { useHue } from "@/lib/hues";

type Key = "cpsc" | "tokensPerSuccess" | "passRate" | "turns";
const cols: { key: Key; label: string; fmt: (v: number) => string; goodLow: boolean }[] = [
  { key: "cpsc", label: "Cost / success", fmt: fmtUsd, goodLow: true },
  { key: "tokensPerSuccess", label: "Tokens / success", fmt: fmtTokens, goodLow: true },
  { key: "passRate", label: "Mean pass", fmt: (v) => `${(v * 100).toFixed(1)}%`, goodLow: false },
  { key: "turns", label: "Avg turns", fmt: (v) => v.toFixed(1), goodLow: true },
];

const presets: { label: string; w: CategoryWeights }[] = [
  { label: "Equal", w: EQUAL_WEIGHTS },
  { label: "Fix-heavy", w: { fix: 60, operate: 20, transform: 20 } },
  { label: "Operate-heavy", w: { fix: 15, operate: 65, transform: 20 } },
  { label: "Transform-heavy", w: { fix: 15, operate: 20, transform: 65 } },
];

function sameWeights(a: CategoryWeights, b: CategoryWeights): boolean {
  return categories.every((c) => a[c.id] === b[c.id]);
}

export default function Leaderboard() {
  const [sort, setSort] = useState<Key>("cpsc");
  const [weights, setWeights] = useState<CategoryWeights>(EQUAL_WEIGHTS);
  const hue = useHue();

  const total = categories.reduce((s, c) => s + weights[c.id], 0) || 1;
  const rows = [...weightedAggregates(weights)].sort((a, b) => {
    const dir = cols.find((c) => c.key === sort)!.goodLow ? 1 : -1;
    return (a[sort] - b[sort]) * dir;
  });

  return (
    <div>
      {/* the declared basket: category-weighted CPSC over the run */}
      <div className="mb-4 rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-ink-2">Weight the basket to your workload.</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setWeights(p.w)}
                className={`rounded-full border px-2.5 py-1 font-mono text-[0.68rem] transition-colors ${
                  sameWeights(weights, p.w)
                    ? "border-line-strong bg-surface-2 text-ink"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-xs text-ink-2">
              <span className="w-16 shrink-0 sm:w-auto sm:min-w-16">{c.label}</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={weights[c.id]}
                onChange={(e) => setWeights({ ...weights, [c.id]: Number(e.target.value) })}
                className="h-1 w-full accent-[var(--waterline)]"
                aria-label={`${c.label} weight`}
              />
              <span className="w-9 shrink-0 text-right font-mono tnum text-muted">
                {Math.round((weights[c.id] / total) * 100)}%
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="scroll-x rounded-xl border border-line">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Measured leaderboard for the selected basket weights, sortable</caption>
          <thead>
            <tr className="border-b border-line">
              <th className="px-3 py-2.5 text-left font-medium text-ink-2">Model</th>
              {cols.map((c) => (
                <th key={c.key} className="px-3 py-2.5 text-right">
                  <button
                    onClick={() => setSort(c.key)}
                    className={`inline-flex items-center gap-1 font-medium transition-colors ${
                      sort === c.key ? "text-ink" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    <span
                      className={
                        sort === c.key ? "underline decoration-waterline decoration-2 underline-offset-4" : undefined
                      }
                    >
                      {c.label}
                    </span>
                    <span className="text-[0.6rem]">{sort === c.key ? "▼" : "↕"}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const m = modelById[r.modelId];
              return (
                <tr key={r.modelId} className="border-b border-line last:border-0">
                  <th scope="row" className="px-3 py-2.5 text-left font-normal">
                    <span className="mr-2 font-mono text-xs text-muted tnum">{i + 1}</span>
                    <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: hue(r.modelId) }} />
                    <span className="text-ink">{m.label}</span>
                    <span className="ml-1.5 font-mono text-[0.7rem] text-muted">{m.effort ?? "default"}</span>
                    <span className="ml-1.5 font-mono text-[0.7rem] text-muted">{m.vendor}</span>
                  </th>
                  {cols.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-2.5 text-right font-mono tnum ${
                        sort === c.key ? "text-ink" : "text-ink-2"
                      }`}
                    >
                      {c.fmt(r[c.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
