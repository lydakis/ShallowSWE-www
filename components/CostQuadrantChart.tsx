"use client";

import { useState } from "react";
import { panelModels, weightedAggregates, deepsweCostPerSolved, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useWeights } from "@/lib/weights";
import { logScale } from "@/lib/scale";

const VB_W = 520;
const VB_H = 400;
const PLOT = { l: 64, r: 500, t: 40, b: 348 };
const X_TICKS = [5, 10, 20];
const Y_TICKS = [0.03, 0.1, 0.3];

const LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "end" }> = {
  "fable-5-low": { dx: 12, dy: -8, anchor: "start" },
  "sonnet-5-low": { dx: 12, dy: 16, anchor: "start" },
  "sonnet-5-medium": { dx: 12, dy: 14, anchor: "start" },
  "kimi-k2-7-default": { dx: 12, dy: 22, anchor: "start" },
  "opus-4-8-low": { dx: 12, dy: -14, anchor: "start" },
  "opus-4-8-medium": { dx: 12, dy: 16, anchor: "start" },
  "gpt-5-5-low": { dx: 12, dy: 4, anchor: "start" },
  "gpt-5-5-medium": { dx: 12, dy: 18, anchor: "start" },
  "gemini-flash-medium": { dx: -12, dy: -6, anchor: "end" },
  "glm-5-2-high": { dx: 12, dy: -14, anchor: "start" },
};

export default function CostQuadrantChart() {
  const hue = useHue();
  const { weights } = useWeights();
  const [hover, setHover] = useState<string | null>(null);

  const easyById = Object.fromEntries(weightedAggregates(weights).map((a) => [a.modelId, a.cpsc]));
  const points = panelModels
    .map((m) => ({ m, hard: deepsweCostPerSolved(m.id), shallow: easyById[m.id] }))
    .filter((p): p is { m: (typeof panelModels)[number]; hard: number; shallow: number } => p.hard != null);

  const x = logScale(4, 25, PLOT.l, PLOT.r);
  const y = logScale(0.02, 0.7, PLOT.t, PLOT.b);

  // connect a model family's effort variants
  const families = new Map<string, typeof points>();
  for (const p of points) {
    families.set(p.m.priceKey, [...(families.get(p.m.priceKey) ?? []), p]);
  }
  const connectors = [...families.values()]
    .filter((g) => g.length > 1)
    .map((g) => [...g].sort((a, b) => a.hard - b.hard));

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
          aria-label="Scatter with one dot per model-effort row. Horizontal: DeepSWE cost per solved hard task. Vertical: measured ShallowSWE cost per success. A model's effort variants are connected."
        >
          <text x={(PLOT.l + PLOT.r) / 2} y={VB_H - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-2)">
            $ PER SOLVED HARD TASK · DEEPSWE · MATCHED EFFORT
          </text>
          <text x={14} y={(PLOT.t + PLOT.b) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-2)" transform={`rotate(-90 14 ${(PLOT.t + PLOT.b) / 2})`}>
            $ PER SUCCESS · SHALLOWSWE · MEASURED
          </text>
          <text x={PLOT.l} y={PLOT.t - 8} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
            LOWER SHALLOWSWE CPSC
          </text>
          <text x={PLOT.r} y={VB_H - 24} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
            LOWER DEEPSWE $/SOLVED
          </text>

          {X_TICKS.map((t) => (
            <g key={`x${t}`}>
              <line x1={x(t)} y1={PLOT.t} x2={x(t)} y2={PLOT.b} stroke="var(--line)" strokeWidth="1" />
              <text x={x(t)} y={PLOT.b + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
                ${t}
              </text>
            </g>
          ))}
          {Y_TICKS.map((t) => (
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
            const lb = LABEL[m.id] ?? { dx: hard > 12 ? -12 : 12, dy: 4, anchor: hard > 12 ? "end" : "start" };
            const dim = hover && hover !== m.id;
            return (
              <g key={m.id} opacity={dim ? 0.35 : 1} style={{ transition: "opacity 0.15s" }}>
                <circle cx={x(hard)} cy={y(shallow)} r={hover === m.id ? 8 : 7} fill="var(--chart-surface)" />
                <circle cx={x(hard)} cy={y(shallow)} r={hover === m.id ? 5.5 : 5} fill={hue(m.id)} />
                <text x={x(hard) + lb.dx} y={y(shallow) + lb.dy} textAnchor={lb.anchor} fontFamily="var(--font-display)" fontSize="11.5" fontWeight="600" fill="var(--ink)">
                  {m.short}
                </text>
              </g>
            );
          })}

          {/* hover hit targets */}
          {points.map(({ m, hard, shallow }) => (
            <circle
              key={`hit${m.id}`}
              cx={x(hard)}
              cy={y(shallow)}
              r="14"
              fill="transparent"
              onMouseEnter={() => setHover(m.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((h) => (h === m.id ? null : m.id))}
            />
          ))}
        </svg>

        {hp && (
          <div
            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-line bg-surface/95 px-2.5 py-1.5 backdrop-blur"
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
              {fmtUsd(hp.hard)} / hard solve · {fmtUsd(hp.shallow)} / success
            </div>
          </div>
        )}
      </div>
      <figcaption className="mt-2 px-1 font-mono text-[0.68rem] leading-relaxed text-muted">
        one dot per model-effort row · x: DeepSWE cost per solved task · y: measured ShallowSWE CPSC · lines connect a
        model&rsquo;s effort variants
      </figcaption>
    </figure>
  );
}
