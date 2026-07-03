"use client";

import { panelModels, suiteAggregates, deepsweCostPerSolved, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";
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
  const easyById = Object.fromEntries(suiteAggregates().map((a) => [a.modelId, a.cpsc]));
  const points = panelModels
    .map((m) => ({ m, hard: deepsweCostPerSolved(m.id), shallow: easyById[m.id] }))
    .filter((p): p is { m: (typeof panelModels)[number]; hard: number; shallow: number } => p.hard != null);
  const x = logScale(4, 25, PLOT.l, PLOT.r);
  const y = logScale(0.02, 0.7, PLOT.t, PLOT.b);
  const gx = x(Math.sqrt(Math.min(...points.map((p) => p.hard)) * Math.max(...points.map((p) => p.hard))));
  const gy = y(Math.sqrt(Math.min(...points.map((p) => p.shallow)) * Math.max(...points.map((p) => p.shallow))));

  return (
    <figure>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full select-none"
        role="img"
        aria-label="Scatter with one dot per model-effort row. The horizontal axis is DeepSWE cost per solved hard task. The vertical axis is measured ShallowSWE pilot cost per successful completion."
      >
        <text x={(PLOT.l + PLOT.r) / 2} y={VB_H - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-2)">
          $ PER SOLVED HARD TASK · DEEPSWE · MATCHED EFFORT
        </text>
        <text x={14} y={(PLOT.t + PLOT.b) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-2)" transform={`rotate(-90 14 ${(PLOT.t + PLOT.b) / 2})`}>
          $ PER PILOT SUCCESS · SHALLOWSWE · MEASURED
        </text>
        <text x={PLOT.l} y={PLOT.t - 8} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
          LOWER SHALLOWSWE CPSC
        </text>
        <text x={PLOT.r} y={VB_H - 24} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
          LOWER DEEPSWE $/SOLVED
        </text>

        <rect x={PLOT.l} y={PLOT.t} width={gx - PLOT.l} height={gy - PLOT.t} fill="var(--waterline)" opacity="0.05" />

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

        {points.map(({ m, hard, shallow }) => {
          const c = hue(m.id);
          const lb = LABEL[m.id] ?? { dx: hard > 12 ? -12 : 12, dy: 4, anchor: hard > 12 ? "end" : "start" };
          return (
            <g key={m.id}>
              <circle cx={x(hard)} cy={y(shallow)} r="7" fill="var(--chart-surface)" />
              <circle cx={x(hard)} cy={y(shallow)} r="5" fill={c} />
              <text x={x(hard) + lb.dx} y={y(shallow) + lb.dy} textAnchor={lb.anchor} fontFamily="var(--font-display)" fontSize="11.5" fontWeight="600" fill="var(--ink)">
                {m.short}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 px-1 font-mono text-[0.68rem] leading-relaxed text-muted">
        one dot per model-effort row · x: DeepSWE cost per solved task · y: measured ShallowSWE pilot CPSC
      </figcaption>
    </figure>
  );
}
