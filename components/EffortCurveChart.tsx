"use client";

import {
  EFFORT_ORDER,
  fmtTokens,
  fmtUsd,
  modelById,
  shallowEffortCurves,
  type ShallowEffortCurve,
} from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { logScale } from "@/lib/scale";

const VB_W = 560;
const VB_H = 410;
const PLOT = { l: 64, r: 492, t: 44, b: 326 };
const Y_TICKS = [0.03, 0.05, 0.1, 0.2, 0.3];
const EFFORTS = ["default", ...EFFORT_ORDER] as const;
const EFFORT_LABELS: Record<string, string> = { medium: "med", xhigh: "x-hi" };

const LABEL_OFFSETS: Record<string, { dx: number; dy: number; anchor: "start" | "end" }> = {
  "sonnet-5-low": { dx: 12, dy: -7, anchor: "start" },
  "sonnet-5-medium": { dx: 12, dy: -7, anchor: "start" },
  "kimi-k2-7-default": { dx: 12, dy: 3, anchor: "start" },
  "opus-4-8-low": { dx: 12, dy: -8, anchor: "start" },
  "opus-4-8-medium": { dx: 12, dy: 10, anchor: "start" },
  "fable-5-low": { dx: -12, dy: 3, anchor: "end" },
  "gpt-5-5-low": { dx: 12, dy: 8, anchor: "start" },
  "gpt-5-5-medium": { dx: 12, dy: 9, anchor: "start" },
  "gemini-flash-medium": { dx: -12, dy: 4, anchor: "end" },
  "glm-5-2-high": { dx: 12, dy: 4, anchor: "start" },
};

function effortKey(effort: string | null): (typeof EFFORTS)[number] {
  const key = effort ?? "default";
  return EFFORTS.includes(key as (typeof EFFORTS)[number]) ? (key as (typeof EFFORTS)[number]) : "default";
}

function effortX(effort: string | null): number {
  const i = EFFORTS.indexOf(effortKey(effort));
  return PLOT.l + (i / (EFFORTS.length - 1)) * (PLOT.r - PLOT.l);
}

function pairedCurves(): ShallowEffortCurve[] {
  return shallowEffortCurves.filter((curve) => curve.points.length > 1);
}

function pctChange(from: number, to: number): string {
  const pct = ((to - from) / from) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

export default function EffortCurveChart() {
  const hue = useHue();
  const y = logScale(0.02, 0.35, PLOT.t, PLOT.b);
  const pairRows = pairedCurves().map((curve) => {
    const [low, medium] = curve.points;
    return { curve, low, medium };
  });

  return (
    <figure>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full select-none"
        role="img"
        aria-label="ShallowSWE measured effort chart. Lines connect measured effort variants for the same model family. The vertical axis is cost per successful completion."
      >
        <text
          x={(PLOT.l + PLOT.r) / 2}
          y={VB_H - 14}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="9.5"
          letterSpacing="0.08em"
          fill="var(--ink-2)"
        >
          REASONING EFFORT USED IN SHALLOWSWE RUN
        </text>
        <text
          x={16}
          y={(PLOT.t + PLOT.b) / 2}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="9.5"
          letterSpacing="0.08em"
          fill="var(--ink-2)"
          transform={`rotate(-90 16 ${(PLOT.t + PLOT.b) / 2})`}
        >
          MEASURED CPSC · LOG
        </text>
        <text x={PLOT.l} y={PLOT.t - 9} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
          LOWER CPSC
        </text>

        {EFFORTS.map((effort) => {
          const x = effortX(effort === "default" ? null : effort);
          return (
            <g key={effort}>
              <line x1={x} y1={PLOT.t} x2={x} y2={PLOT.b} stroke="var(--line)" strokeWidth="1" />
              <text
                x={x}
                y={PLOT.b + 17}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="9.5"
                fill="var(--muted)"
              >
                {EFFORT_LABELS[effort] ?? effort}
              </text>
            </g>
          );
        })}

        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line x1={PLOT.l} y1={y(tick)} x2={PLOT.r} y2={y(tick)} stroke="var(--line)" strokeWidth="1" />
            <text
              x={PLOT.l - 7}
              y={y(tick) + 3.5}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              className="tnum"
              fill="var(--muted)"
            >
              {fmtUsd(tick)}
            </text>
          </g>
        ))}

        {shallowEffortCurves.map((curve) => {
          const c = hue(curve.modelId);
          const points = curve.points.map((point) => ({
            ...point,
            x: effortX(point.effort),
            y: y(point.cpsc),
          }));
          return (
            <g key={curve.familyKey}>
              {points.length > 1 && (
                <polyline
                  points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                  fill="none"
                  stroke={c}
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.82"
                />
              )}
              {points.map((point) => {
                const m = modelById[point.modelId];
                const offset = LABEL_OFFSETS[point.modelId] ?? { dx: 12, dy: 4, anchor: "start" as const };
                return (
                  <g key={point.modelId}>
                    <circle cx={point.x} cy={point.y} r="7" fill="var(--chart-surface)" />
                    <circle cx={point.x} cy={point.y} r="5" fill={c} />
                    <text
                      x={point.x + offset.dx}
                      y={point.y + offset.dy}
                      textAnchor={offset.anchor}
                      fontFamily="var(--font-display)"
                      fontSize="11.5"
                      fontWeight="600"
                      fill="var(--ink)"
                    >
                      {m.short}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {pairRows.map(({ curve, low, medium }) => (
          <div key={curve.familyKey} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-sm text-ink">{curve.short}</span>
              <span className="font-mono text-[0.68rem] text-danger">{pctChange(low.cpsc, medium.cpsc)} CPSC</span>
            </div>
            <div className="mt-1 font-mono text-[0.68rem] leading-relaxed text-muted">
              {fmtUsd(low.cpsc)} low to {fmtUsd(medium.cpsc)} med · pass {low.passes}/{low.attempts} to{" "}
              {medium.passes}/{medium.attempts} · tokens {fmtTokens(low.tokensPerSuccess)} to{" "}
              {fmtTokens(medium.tokensPerSuccess)}
            </div>
          </div>
        ))}
      </div>

      <figcaption className="mt-3 px-1 font-mono text-[0.68rem] leading-relaxed text-muted">
        ShallowSWE-only · lines connect measured effort variants for the same model family · unconnected dots are single
        measured rows in this run
      </figcaption>
    </figure>
  );
}
