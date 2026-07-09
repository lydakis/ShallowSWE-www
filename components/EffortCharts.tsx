"use client";

import { useState } from "react";
import EffortCurveChart from "./EffortCurveChart";
import SuccessCostChart from "./SuccessCostChart";
import TokenPriceCostChart from "./TokenPriceCostChart";

type View = "turns" | "success" | "price";

const VIEWS: { id: View; label: string }[] = [
  { id: "price", label: "Token price" },
  { id: "success", label: "First-check pass" },
  { id: "turns", label: "Turns" },
];

const VIEW_COPY: Record<View, { title: string; subtitle: string }> = {
  turns: {
    title: "Turns against cost",
    subtitle: "Cost per success against turns taken",
  },
  success: {
    title: "First-check pass against cost",
    subtitle: "Cost per success against first-try pass rate",
  },
  price: {
    title: "Token price against cost",
    subtitle: "Cost per success against output-token list price",
  },
};

export default function EffortCharts() {
  const [view, setView] = useState<View>("price");
  const copy = VIEW_COPY[view];

  return (
    <figure className="panel overflow-hidden">
      <figcaption className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-[0.95rem] text-ink">{copy.title}</div>
          <div className="mt-0.5 font-mono text-[0.66rem] text-muted">{copy.subtitle}</div>
        </div>
        <div role="tablist" aria-label="Cost diagnostic" className="inline-flex self-start rounded-full border border-line bg-surface p-1 sm:self-auto">
          {VIEWS.map((item) => {
            const selected = view === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setView(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  selected ? "bg-ink text-plane" : "text-ink-2 hover:text-ink"
                }`}
                style={selected ? { color: "var(--plane)" } : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </figcaption>

      {view === "turns" ? (
        <EffortCurveChart embedded />
      ) : view === "price" ? (
        <TokenPriceCostChart embedded />
      ) : (
        <SuccessCostChart embedded />
      )}
    </figure>
  );
}
