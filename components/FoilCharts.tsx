"use client";

import { useState } from "react";
import CostQuadrantChart from "./CostQuadrantChart";
import RankTranslation from "./RankTranslation";

const views = [
  ["rank", "Rank translation"],
  ["scatter", "Pass@1 scatter"],
  ["cost", "Cost vs cost"],
] as const;

type View = (typeof views)[number][0];

const viewCopy: Record<View, { title: string; subtitle: string }> = {
  rank: {
    title: "Rank translation",
    subtitle: "DeepSWE ability rank against ShallowSWE price rank",
  },
  scatter: {
    title: "Pass@1 scatter",
    subtitle: "DeepSWE pass@1 against ShallowSWE $ per success",
  },
  cost: {
    title: "Cost against cost",
    subtitle: "DeepSWE $ per solved against ShallowSWE $ per success",
  },
};

export default function FoilCharts() {
  const [view, setView] = useState<View>("rank");
  const copy = viewCopy[view];

  return (
    <figure>
      <figcaption className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-[0.95rem] text-ink">{copy.title}</div>
          <div className="mt-0.5 font-mono text-[0.66rem] text-muted">{copy.subtitle}</div>
        </div>
        <div role="tablist" aria-label="Comparison view" className="inline-flex self-start rounded-full border border-line bg-surface p-1 sm:self-auto">
          {views.map(([id, label]) => {
            const selected = view === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={selected}
                onClick={() => setView(id)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  selected ? "bg-ink text-plane" : "text-ink-2 hover:text-ink"
                }`}
                style={selected ? { color: "var(--plane)" } : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>
      </figcaption>

      <div className="p-4 sm:p-6">
        {view === "rank" && <RankTranslation />}
        {view === "scatter" && <CostQuadrantChart mode="pass" />}
        {view === "cost" && <CostQuadrantChart mode="deepcost" />}
      </div>
    </figure>
  );
}
