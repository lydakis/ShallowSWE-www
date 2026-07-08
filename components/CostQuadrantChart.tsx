"use client";

import { useState } from "react";
import {
  weightedAggregates,
  deepswePassAt1,
  deepsweCostPerSolved,
  fmtPercent,
  fmtUsd,
  type ModelDef,
} from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useModelSelection } from "@/lib/model-selection";
import { useWeights } from "@/lib/weights";
import { stackLabels } from "@/lib/chartLabels";
import { linScale, logScale, logTicks, niceLogBounds, paddedLinearBounds } from "@/lib/scale";

const VB_W = 520;
const VB_H = 400;
const PLOT = { l: 64, r: 500, t: 40, b: 348 };
const PASS_TICK_CANDIDATES = [0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65];

export type QuadrantMode = "pass" | "deepcost";

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default function CostQuadrantChart({ mode = "pass" }: { mode?: QuadrantMode } = {}) {
  const hue = useHue();
  const { weights } = useWeights();
  const { visibleModels } = useModelSelection();
  const [hover, setHover] = useState<string | null>(null);
  const deepCost = mode === "deepcost";

  const shallowById = Object.fromEntries(weightedAggregates(weights).map((a) => [a.modelId, a.cpsc]));
  const points = visibleModels
    .map((m) => ({
      m,
      hard: deepCost ? deepsweCostPerSolved(m.id) : deepswePassAt1(m.id),
      shallow: shallowById[m.id],
    }))
    .filter(
      (p): p is { m: ModelDef; hard: number; shallow: number } =>
        p.hard != null && p.shallow != null,
    );

  if (points.length === 0) {
    return (
      <figure className="flex min-h-[20rem] items-center justify-center">
        <figcaption className="font-mono text-xs text-muted">
          No DeepSWE-matched rows for the selected model set.
        </figcaption>
      </figure>
    );
  }

  const hardValues = points.map((p) => p.hard);
  let x: (v: number) => number;
  let xTicks: number[];
  if (deepCost) {
    const [minHard, maxHard] = niceLogBounds(hardValues, [0.5, 50]);
    x = logScale(minHard, maxHard, PLOT.l, PLOT.r);
    xTicks = logTicks(minHard, maxHard).filter((t) => t > minHard && t < maxHard);
  } else {
    const [rawMinHard, rawMaxHard] = paddedLinearBounds(hardValues, [0.3, 0.6], { padding: 0.12, minSpan: 0.12 });
    const minHard = Math.max(0, rawMinHard);
    const maxHard = Math.min(1, rawMaxHard);
    x = linScale(minHard, maxHard, PLOT.l, PLOT.r);
    xTicks = PASS_TICK_CANDIDATES.filter((t) => t > minHard && t < maxHard);
  }
  const shallowValues = points.map((p) => p.shallow);
  const [minShallow, maxShallow] = niceLogBounds(shallowValues, [0.01, 1]);
  const y = logScale(minShallow, maxShallow, PLOT.t, PLOT.b);
  const yTicks = logTicks(minShallow, maxShallow).filter((t) => t > minShallow && t < maxShallow);
  const hardCutX = x(median(hardValues));
  const shallowCutY = y(median(shallowValues));
  const xMedian = median(points.map((p) => x(p.hard)));

  // the winning quadrant is cheap on ShallowSWE and either smarter (pass@1)
  // or also cheaper (deep $/solved) on DeepSWE
  const quadrant = deepCost
    ? { x: PLOT.l, width: hardCutX - PLOT.l }
    : { x: hardCutX, width: PLOT.r - hardCutX };

  // connect a model family's effort variants
  const families = new Map<string, typeof points>();
  for (const p of points) {
    families.set(p.m.priceKey, [...(families.get(p.m.priceKey) ?? []), p]);
  }
  const connectors = [...families.values()]
    .filter((g) => g.length > 1)
    .map((g) => [...g].sort((a, b) => a.hard - b.hard));

  const placedLabels = points.map((p) => {
    const px = x(p.hard);
    const py = y(p.shallow);
    const right = px < xMedian;
    return { ...p, px, py, right };
  });
  const stackedYs = stackLabels(placedLabels, PLOT.t + 14, PLOT.b - 6, 18);
  const labels = placedLabels.map((p, i) => ({
    ...p,
    labelY: stackedYs[i],
    labelX: p.px + (p.right ? 13 : -13),
    anchor: p.right ? ("start" as const) : ("end" as const),
  }));

  const hp = points.find((p) => p.m.id === hover) ?? null;
  const tipX = hp ? (x(hp.hard) / VB_W) * 100 : 0;
  const tipY = hp ? (y(hp.shallow) / VB_H) * 100 : 0;
  const tipTransform = `translate(${tipX > 78 ? "-92%" : tipX < 18 ? "-8%" : "-50%"}, ${
    tipY < 30 ? "14px" : "calc(-100% - 14px)"
  })`;

  return (
    <figure>
      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full select-none"
          role="img"
          aria-label={
            deepCost
              ? "Scatter with one dot per model-effort row. Horizontal: DeepSWE cost per solved task, log scale. Vertical: measured ShallowSWE cost per success. A model's effort variants are connected."
              : "Scatter with one dot per model-effort row. Horizontal: DeepSWE pass at one. Vertical: measured ShallowSWE cost per success. A model's effort variants are connected."
          }
        >
          <text x={(PLOT.l + PLOT.r) / 2} y={VB_H - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-2)">
            {deepCost ? "$ PER SOLVED · DEEPSWE · LOG" : "PASS@1 · DEEPSWE · MATCHED EFFORT"}
          </text>
          <text x={14} y={(PLOT.t + PLOT.b) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-2)" transform={`rotate(-90 14 ${(PLOT.t + PLOT.b) / 2})`}>
            $ PER SUCCESS · SHALLOWSWE · MEASURED
          </text>
          <text x={PLOT.l} y={PLOT.t - 8} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
            LOWER SHALLOWSWE CPSC
          </text>
          <text x={PLOT.l} y={VB_H - 24} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
            {deepCost ? "◀ CHEAPER PER DEEPSWE SOLVE" : "HIGHER DEEPSWE PASS@1 →"}
          </text>

          {/* dynamic median split */}
          <rect
            x={quadrant.x}
            y={PLOT.t}
            width={quadrant.width}
            height={shallowCutY - PLOT.t}
            fill="var(--waterline)"
            fillOpacity="0.07"
          />
          <line
            x1={hardCutX}
            y1={PLOT.t}
            x2={hardCutX}
            y2={PLOT.b}
            stroke="var(--waterline)"
            strokeWidth="1"
            strokeOpacity="0.28"
            strokeDasharray="4 5"
          />
          <line
            x1={PLOT.l}
            y1={shallowCutY}
            x2={PLOT.r}
            y2={shallowCutY}
            stroke="var(--waterline)"
            strokeWidth="1"
            strokeOpacity="0.28"
            strokeDasharray="4 5"
          />
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={x(t)} y1={PLOT.t} x2={x(t)} y2={PLOT.b} stroke="var(--line)" strokeWidth="1" />
              <text x={x(t)} y={PLOT.b + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
                {deepCost ? fmtUsd(t) : fmtPercent(t)}
              </text>
            </g>
          ))}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={PLOT.l} y1={y(t)} x2={PLOT.r} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
              <text x={PLOT.l - 6} y={y(t) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
                {fmtUsd(t)}
              </text>
            </g>
          ))}

          {/* family connectors */}
          {connectors.map((g) => (
            <polyline
              key={g[0].m.priceKey}
              points={g.map((p) => `${x(p.hard)},${y(p.shallow)}`).join(" ")}
              fill="none"
              stroke={hue(g[0].m.id)}
              strokeWidth="1.5"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
          ))}

          {points.map(({ m, hard, shallow }) => {
            const dim = hover && hover !== m.id;
            return (
              <g key={m.id} opacity={dim ? 0.35 : 1} style={{ transition: "opacity 0.15s" }}>
                <circle cx={x(hard)} cy={y(shallow)} r={hover === m.id ? 8 : 7} fill="var(--chart-surface)" />
                <circle cx={x(hard)} cy={y(shallow)} r={hover === m.id ? 5.5 : 5} fill={hue(m.id)} />
              </g>
            );
          })}

          {labels.map((p) => (
            <line
              key={`leader-${p.m.id}`}
              x1={p.px + (p.right ? 6 : -6)}
              y1={p.py}
              x2={p.labelX + (p.anchor === "start" ? -4 : 4)}
              y2={p.labelY - 3.5}
              stroke={hue(p.m.id)}
              strokeWidth="1"
              strokeOpacity={hover && hover !== p.m.id ? 0.15 : 0.35}
            />
          ))}
          {labels.map((p) => (
            <text
              key={`label-${p.m.id}`}
              x={p.labelX}
              y={p.labelY}
              textAnchor={p.anchor}
              fontFamily="var(--font-display)"
              fontSize="11"
              fontWeight="600"
              fill="var(--ink)"
              opacity={hover && hover !== p.m.id ? 0.35 : 1}
            >
              {p.m.short}
            </text>
          ))}

          {/* hover hit targets */}
          {points.map(({ m, hard, shallow }) => (
            <circle
              key={`hit${m.id}`}
              cx={x(hard)}
              cy={y(shallow)}
              r="14"
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(m.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((h) => (h === m.id ? null : m.id))}
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
              <span className="h-2 w-2 rounded-full" style={{ background: hue(hp.m.id) }} />
              {hp.m.short}
            </div>
            <div className="mt-0.5 font-mono text-[0.68rem] tnum text-ink-2">
              {deepCost
                ? `DeepSWE ${fmtUsd(hp.hard)} / solved · ShallowSWE ${fmtUsd(hp.shallow)}`
                : `DeepSWE ${fmtPercent(hp.hard)} · ShallowSWE ${fmtUsd(hp.shallow)}`}
            </div>
          </div>
        )}
      </div>
      <figcaption className="mt-2 px-1 font-mono text-[0.68rem] leading-relaxed text-muted">
        {deepCost
          ? "one dot per model-effort row · x: DeepSWE cost per solved task · y: measured ShallowSWE CPSC · lines connect a model's effort variants · dashed cuts are panel medians; the shaded quadrant is cheaper than the median on both benchmarks"
          : "one dot per model-effort row · x: DeepSWE pass@1 · y: measured ShallowSWE CPSC · lines connect a model's effort variants · dashed cuts are panel medians; the shaded quadrant beats the median on both axes"}
      </figcaption>
    </figure>
  );
}
