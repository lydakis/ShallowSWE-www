"use client";

import { useState } from "react";
import { weightedAggregates, modelById, models, fmtPercent, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useWeights } from "@/lib/weights";
import { stackLabels } from "@/lib/chartLabels";
import { linScale, logScale, logTicks, niceLogBounds, paddedLinearBounds } from "@/lib/scale";

const VB_W = 560;
const VB_H = 410;
const PLOT = { l: 60, r: 470, t: 34, b: 336 };
const priceKeyOf = Object.fromEntries(models.map((m) => [m.id, m.priceKey]));

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = span <= 0.2 ? 0.05 : span <= 0.45 ? 0.1 : 0.25;
  const ticks: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + 0.00001; value += step) {
    ticks.push(Math.round(value * 100) / 100);
  }
  return ticks.length ? ticks : [min, max];
}

export default function SuccessCostChart({ embedded = false }: { embedded?: boolean } = {}) {
  const hue = useHue();
  const { weights } = useWeights();
  const [hover, setHover] = useState<string | null>(null);

  const pts = weightedAggregates(weights)
    .filter((a) => a.cpsc != null)
    .map((a) => ({
      id: a.modelId,
      m: modelById[a.modelId],
      solveRate: a.solveRate,
      firstCheckPassRate: a.firstCheckPassRate,
      cpsc: a.cpsc!,
      repairLoops: a.repairLoops,
      successes: a.successes,
      costPerRepairLoop: a.costPerRepairLoop,
    }));

  if (pts.length === 0) {
    return (
      <figure className={embedded ? "p-4" : "panel p-4"}>
        <figcaption className="font-mono text-xs text-muted">No CPSC rows in the selected basket.</figcaption>
      </figure>
    );
  }

  const firstCheckRates = pts.map((p) => p.firstCheckPassRate);
  const costs = pts.map((p) => p.cpsc).filter((v) => Number.isFinite(v) && v > 0);
  const [rawXMin, rawXMax] = paddedLinearBounds(firstCheckRates, [0, 1], {
    padding: 0.12,
    minSpan: 0.18,
  });
  let xMin = Math.max(0, Math.floor(rawXMin * 20) / 20);
  let xMax = Math.min(1, Math.ceil(rawXMax * 20) / 20);
  if (xMax <= xMin) {
    xMin = Math.max(0, xMin - 0.05);
    xMax = Math.min(1, xMax + 0.05);
  }
  const [yMin, yMax] = niceLogBounds(costs, [0.01, 1]);
  const x = linScale(xMin, xMax, PLOT.l, PLOT.r);
  const y = logScale(yMin, yMax, PLOT.t, PLOT.b);
  const xTicks = percentTicks(xMin, xMax);
  const yTicks = logTicks(yMin, yMax).filter((t) => t > yMin && t < yMax);
  const firstCheckCutX = x(median(firstCheckRates));
  const costCutY = y(median(costs));

  const families = new Map<string, typeof pts>();
  for (const p of pts) {
    const k = priceKeyOf[p.id];
    families.set(k, [...(families.get(k) ?? []), p]);
  }
  const connectors = [...families.values()]
    .filter((g) => g.length > 1)
    .map((g) => [...g].sort((a, b) => a.firstCheckPassRate - b.firstCheckPassRate));

  const placedLabels = pts.map((p) => {
    const px = x(p.firstCheckPassRate);
    const py = y(p.cpsc);
    const right = px < PLOT.l + 118;
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
  const tipX = hp ? (x(hp.firstCheckPassRate) / VB_W) * 100 : 0;
  const tipY = hp ? (y(hp.cpsc) / VB_H) * 100 : 0;
  const tipTransform = `translate(${tipX > 78 ? "-92%" : tipX < 18 ? "-8%" : "-50%"}, ${
    tipY < 30 ? "14px" : "calc(-100% - 14px)"
  })`;

  const content = (
    <>
      {!embedded && (
        <figcaption className="flex items-baseline justify-between border-b border-line px-4 py-2.5">
          <span className="font-display text-[0.95rem] text-ink">First-check pass against cost</span>
          <span className="font-mono text-[0.66rem] text-muted">Log CPSC by first hidden-check pass rate</span>
        </figcaption>
      )}
      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full select-none"
          role="img"
          aria-label="Scatter of cost per successful completion against first hidden-check pass rate, one dot per model-effort row."
        >
          <text x={(PLOT.l + PLOT.r) / 2} y={VB_H - 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-2)">
            FIRST-CHECK PASS RATE
          </text>
          <text x={16} y={(PLOT.t + PLOT.b) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-2)" transform={`rotate(-90 16 ${(PLOT.t + PLOT.b) / 2})`}>
            COST PER SUCCESS · LOG
          </text>
          <text x={PLOT.l} y={PLOT.t - 9} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
            ▲ cheaper · more first-check passes →
          </text>

          <rect
            x={firstCheckCutX}
            y={PLOT.t}
            width={PLOT.r - firstCheckCutX}
            height={costCutY - PLOT.t}
            fill="var(--waterline)"
            fillOpacity="0.06"
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
                {fmtPercent(t)}
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

          <line
            x1={firstCheckCutX}
            y1={PLOT.t}
            x2={firstCheckCutX}
            y2={PLOT.b}
            stroke="var(--waterline)"
            strokeWidth="1"
            strokeOpacity="0.28"
            strokeDasharray="4 5"
          />

          {connectors.map((g) => (
            <polyline
              key={priceKeyOf[g[0].id]}
              points={g.map((p) => `${x(p.firstCheckPassRate)},${y(p.cpsc)}`).join(" ")}
              fill="none"
              stroke={hue(g[0].id)}
              strokeWidth="1.5"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
          ))}

          {pts.map((p) => (
            <g key={p.id} opacity={hover && hover !== p.id ? 0.35 : 1} style={{ transition: "opacity 0.15s" }}>
              <circle cx={x(p.firstCheckPassRate)} cy={y(p.cpsc)} r={hover === p.id ? 8 : 6.5} fill="var(--chart-surface)" />
              <circle cx={x(p.firstCheckPassRate)} cy={y(p.cpsc)} r={hover === p.id ? 5.5 : 4.5} fill={hue(p.id)} />
            </g>
          ))}
          {labels.map((p) => (
            <line
              key={`ldr${p.id}`}
              x1={p.px + (p.right ? 6 : -6)}
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
              cx={x(p.firstCheckPassRate)}
              cy={y(p.cpsc)}
              r="13"
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
              {fmtPercent(hp.firstCheckPassRate)} first-check · {fmtUsd(hp.cpsc)} / success
            </div>
            <div className="mt-0.5 font-mono text-[0.66rem] tnum text-muted">
              {hp.successes} / {hp.repairLoops} solved · {fmtPercent(hp.solveRate)} final success
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-line px-4 py-2 font-mono text-[0.68rem] leading-relaxed text-muted">
        one dot per model-effort row · x: first hidden-check passes / scored repair loops · y: cost per success · final
        repair-loop success remains in the table · x-axis zooms to the observed first-check range
      </div>
    </>
  );

  return embedded ? <div>{content}</div> : <figure className="panel overflow-hidden">{content}</figure>;
}
