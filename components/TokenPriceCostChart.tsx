"use client";

import { useState } from "react";
import { weightedAggregates, modelById, models, prices, fmtModelPricing, fmtTokens, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useModelSelection } from "@/lib/model-selection";
import { useWeights } from "@/lib/weights";
import { stackLabels } from "@/lib/chartLabels";
import { linScale, logScale, logTicks, niceLogBounds } from "@/lib/scale";

const VB_W = 560;
const VB_H = 410;
const PLOT = { l: 60, r: 470, t: 34, b: 336 };

const priceKeyOf = Object.fromEntries(models.map((m) => [m.id, m.priceKey]));

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function bubbleScale(values: number[]) {
  const finite = values.filter((value) => Number.isFinite(value) && value > 0);
  if (finite.length === 0) return () => 6.5;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (min === max) return () => 7;
  const scale = linScale(Math.log10(min), Math.log10(max), 4.5, 10.5);
  return (value: number) => scale(Math.log10(Math.max(value, min)));
}

export default function TokenPriceCostChart({ embedded = false }: { embedded?: boolean } = {}) {
  const hue = useHue();
  const { weights } = useWeights();
  const { selectedModelIdSet } = useModelSelection();
  const [hover, setHover] = useState<string | null>(null);

  const pts = weightedAggregates(weights)
    .filter((a) => selectedModelIdSet.has(a.modelId))
    .filter((a) => a.cpsc != null)
    .map((a) => {
      const m = modelById[a.modelId];
      const price = prices[m.priceKey];
      return {
        id: a.modelId,
        m,
        outputPrice: price.outputPer1M,
        cpsc: a.cpsc!,
        tokensPerSuccess: a.tokensPerSuccess ?? a.tokensPerRepairLoop,
      };
    })
    .filter((p) => p.outputPrice > 0 && p.tokensPerSuccess > 0);

  if (pts.length === 0) {
    return (
      <figure className={embedded ? "p-4" : "panel p-4"}>
        <figcaption className="font-mono text-xs text-muted">No CPSC rows in the selected basket.</figcaption>
      </figure>
    );
  }

  const pricesPerOutput = pts.map((p) => p.outputPrice);
  const costs = pts.map((p) => p.cpsc).filter((v) => Number.isFinite(v) && v > 0);
  const tokenCounts = pts.map((p) => p.tokensPerSuccess);
  const [xMin, xMax] = niceLogBounds(pricesPerOutput, [1, 100]);
  const [yMin, yMax] = niceLogBounds(costs, [0.01, 1]);
  const x = logScale(xMin, xMax, PLOT.l, PLOT.r);
  const y = logScale(yMin, yMax, PLOT.t, PLOT.b);
  const r = bubbleScale(tokenCounts);
  const xTicks = logTicks(xMin, xMax).filter((t) => t > xMin && t < xMax);
  const yTicks = logTicks(yMin, yMax).filter((t) => t > yMin && t < yMax);
  const priceCutX = x(median(pricesPerOutput));
  const costCutY = y(median(costs));

  const families = new Map<string, typeof pts>();
  for (const p of pts) {
    const k = priceKeyOf[p.id];
    families.set(k, [...(families.get(k) ?? []), p]);
  }
  const connectors = [...families.values()]
    .filter((g) => g.length > 1)
    .map((g) => [...g].sort((a, b) => a.cpsc - b.cpsc));

  const placedLabels = pts.map((p) => {
    const px = x(p.outputPrice);
    const py = y(p.cpsc);
    const right = px < PLOT.l + 118 || px >= (PLOT.l + PLOT.r) / 2;
    return { ...p, px, py, right };
  });
  const stackedYs = stackLabels(placedLabels, PLOT.t + 14, PLOT.b - 6, 18);
  const labels = placedLabels.map((p, i) => ({
    ...p,
    labelY: stackedYs[i],
    labelX: p.px + (p.right ? 13 : -13),
    anchor: p.right ? ("start" as const) : ("end" as const),
  }));

  const hp = pts.find((p) => p.id === hover) ?? null;
  const tipX = hp ? (x(hp.outputPrice) / VB_W) * 100 : 0;
  const tipY = hp ? (y(hp.cpsc) / VB_H) * 100 : 0;
  const tipTransform = `translate(${tipX > 78 ? "-92%" : tipX < 18 ? "-8%" : "-50%"}, ${
    tipY < 30 ? "14px" : "calc(-100% - 14px)"
  })`;

  const content = (
    <>
      {!embedded && (
        <figcaption className="flex items-baseline justify-between border-b border-line px-4 py-2.5">
          <span className="font-display text-[0.95rem] text-ink">Token price against cost</span>
          <span className="font-mono text-[0.66rem] text-muted">Log CPSC by output-token list price</span>
        </figcaption>
      )}
      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full select-none"
          role="img"
          aria-label="Scatter of cost per successful completion against list output-token price, with bubble size tracking tokens per successful completion."
        >
          <text x={(PLOT.l + PLOT.r) / 2} y={VB_H - 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-2)">
            OUTPUT PRICE / 1M TOKENS - LOG
          </text>
          <text x={16} y={(PLOT.t + PLOT.b) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-2)" transform={`rotate(-90 16 ${(PLOT.t + PLOT.b) / 2})`}>
            COST PER SUCCESS - LOG
          </text>
          <text x={PLOT.l} y={PLOT.t - 9} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
            ▲ cheaper per task · ◀ cheaper output tokens
          </text>

          <rect
            x={PLOT.l}
            y={PLOT.t}
            width={priceCutX - PLOT.l}
            height={costCutY - PLOT.t}
            fill="var(--waterline)"
            fillOpacity="0.06"
          />
          <line
            x1={priceCutX}
            y1={PLOT.t}
            x2={priceCutX}
            y2={PLOT.b}
            stroke="var(--waterline)"
            strokeWidth="1"
            strokeOpacity="0.24"
            strokeDasharray="4 5"
          />
          <line
            x1={PLOT.l}
            y1={costCutY}
            x2={PLOT.r}
            y2={costCutY}
            stroke="var(--waterline)"
            strokeWidth="1"
            strokeOpacity="0.24"
            strokeDasharray="4 5"
          />
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={x(t)} y1={PLOT.t} x2={x(t)} y2={PLOT.b} stroke="var(--line)" strokeWidth="1" />
              <text x={x(t)} y={PLOT.b + 17} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
                {fmtUsd(t)}
              </text>
            </g>
          ))}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={PLOT.l} y1={y(t)} x2={PLOT.r} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
              <text x={PLOT.l - 7} y={y(t) + 3.5} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
                {fmtUsd(t)}
              </text>
            </g>
          ))}

          {connectors.map((g) => (
            <polyline
              key={priceKeyOf[g[0].id]}
              points={g.map((p) => `${x(p.outputPrice)},${y(p.cpsc)}`).join(" ")}
              fill="none"
              stroke={hue(g[0].id)}
              strokeWidth="1.5"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
          ))}

          {pts.map((p) => (
            <g key={p.id} opacity={hover && hover !== p.id ? 0.35 : 1} style={{ transition: "opacity 0.15s" }}>
              <circle cx={x(p.outputPrice)} cy={y(p.cpsc)} r={r(p.tokensPerSuccess) + 2.2} fill="var(--chart-surface)" />
              <circle
                cx={x(p.outputPrice)}
                cy={y(p.cpsc)}
                r={hover === p.id ? r(p.tokensPerSuccess) + 1.2 : r(p.tokensPerSuccess)}
                fill={hue(p.id)}
                fillOpacity="0.82"
              />
            </g>
          ))}
          {labels.map((p) => (
            <line
              key={`ldr${p.id}`}
              x1={p.px + (p.right ? 7 : -7)}
              y1={p.py}
              x2={p.labelX + (p.anchor === "start" ? -4 : 4)}
              y2={p.labelY - 3.5}
              stroke={hue(p.id)}
              strokeWidth="1"
              strokeOpacity={hover && hover !== p.id ? 0.15 : 0.35}
            />
          ))}
          {labels.map((p) => (
            <text
              key={`lbl${p.id}`}
              x={p.labelX}
              y={p.labelY}
              textAnchor={p.anchor}
              fontFamily="var(--font-display)"
              fontSize="11"
              fontWeight="600"
              fill="var(--ink)"
              opacity={hover && hover !== p.id ? 0.35 : 1}
            >
              {p.m.short}
            </text>
          ))}

          {pts.map((p) => (
            <circle
              key={`hit${p.id}`}
              cx={x(p.outputPrice)}
              cy={y(p.cpsc)}
              r={Math.max(13, r(p.tokensPerSuccess) + 4)}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((h) => (h === p.id ? null : p.id))}
            />
          ))}
        </svg>

        {hp && (
          <div
            className="pointer-events-none absolute z-30 max-w-[calc(100vw-2rem)] whitespace-nowrap rounded-lg border border-line bg-surface/95 px-2.5 py-1.5 backdrop-blur"
            style={{
              left: `${tipX}%`,
              top: `${tipY}%`,
              transform: tipTransform,
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="flex items-center gap-1.5 text-[0.78rem] font-medium text-ink">
              <span className="h-2 w-2 rounded-full" style={{ background: hue(hp.id) }} />
              {hp.m.short}
            </div>
            <div className="mt-0.5 font-mono text-[0.68rem] tnum text-ink-2">
              {fmtUsd(hp.outputPrice)} / 1M out · {fmtUsd(hp.cpsc)} / success
            </div>
            <div className="mt-0.5 font-mono text-[0.66rem] tnum text-muted">
              {fmtTokens(hp.tokensPerSuccess)} tokens / success · {fmtModelPricing(hp.id)}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-line px-4 py-2 font-mono text-[0.68rem] leading-relaxed text-muted">
        one dot per model-effort row · x: list output-token price · y: cost per success · bubble size: tokens per
        verified success · dashed cuts are panel medians; the shaded quadrant beats both
      </div>
    </>
  );

  return embedded ? <div>{content}</div> : <figure className="panel overflow-hidden">{content}</figure>;
}
