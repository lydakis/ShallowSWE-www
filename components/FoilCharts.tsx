"use client";

import { useState } from "react";
import CostQuadrantChart from "./CostQuadrantChart";
import RankTranslation from "./RankTranslation";

const views = [
  ["scatter", "Cost scatter"],
  ["rank", "Rank translation"],
] as const;

type View = (typeof views)[number][0];

export default function FoilCharts() {
  const [view, setView] = useState<View>("scatter");
  return (
    <div>
      <div role="tablist" aria-label="Comparison view" className="inline-flex rounded-full border border-line bg-surface p-1">
        {views.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              view === id ? "bg-ink text-plane" : "text-ink-2 hover:text-ink"
            }`}
            style={view === id ? { color: "var(--plane)" } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">{view === "scatter" ? <CostQuadrantChart /> : <RankTranslation />}</div>
    </div>
  );
}
