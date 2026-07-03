"use client";

import { useState } from "react";
import { deepsweEffortCurves } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { logScale } from "@/lib/scale";

const VB_W = 560;
const VB_H = 400;
const PLOT = { l: 52, r: 452, t: 44, b: 344 };
const X_DOMAIN: [number, number] = [0.24, 0.7];
const X_TICKS = [0.3, 0.4, 0.5, 0.6, 0.7];
const Y_TICKS = [1, 2, 5, 10, 20];

const EFFORT_ABBR: Record<string, string> = { low: "low", medium: "med", high: "high", xhigh: "xhi", max: "max" };
const effortLabel = (e: string | null) => (e == null ? "default" : (EFFORT_ABBR[e] ?? e));

function linX(v: number): number {
  const t = (v - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0]);
  return Math.round((PLOT.l + t * (PLOT.r - PLOT.l)) * 1000) / 1000;
}

export default function EffortCurveChart() {
  const hue = useHue();
  const [highlight, setHighlight] = useState<string | null>(null);
  const y = logScale(1, 30, PLOT.t, PLOT.b);
  const active = (id: string) => highlight === null || highlight === id;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full select-none"
        role="img"
        aria-label="DeepSWE v1.1 cost-versus-accuracy curves: one line per model family connecting its reasoning-effort levels from low to max. Pass rate rises rightward, mean dollars per run rises downward. The effort level measured in the ShallowSWE pilot is ringed."
      >
        <text x={(PLOT.l + PLOT.r) / 2} y={VB_H - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-2)">
          PASS@1 · DEEPSWE v1.1 · 113 HARD TASKS
        </text>
        <text x={14} y={(PLOT.t + PLOT.b) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-2)" transform={`rotate(-90 14 ${(PLOT.t + PLOT.b) / 2})`}>
          MEAN $ / RUN · LOG
        </text>
        <text x={PLOT.l} y={PLOT.t - 8} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
          ▲ cheaper
        </text>

        {X_TICKS.map((t) => (
          <g key={`x${t}`}>
            <line x1={linX(t)} y1={PLOT.t} x2={linX(t)} y2={PLOT.b} stroke="var(--line)" strokeWidth="1" />
            <text x={linX(t)} y={PLOT.b + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
              {Math.round(t * 100)}%
            </text>
          </g>
        ))}
        {Y_TICKS.map((t) => (
          <g key={`y${t}`}>
            <line x1={PLOT.l} y1={y(t)} x2={PLOT.r} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={PLOT.l - 6} y={y(t) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
              ${t}
            </text>
          </g>
        ))}

        {deepsweEffortCurves.map((curve) => {
          const c = hue(curve.modelId);
          const on = active(curve.familyKey);
          const pts = curve.points.map((p) => ({ ...p, cx: linX(p.passRate), cy: y(p.meanCostUsd) }));
          const last = pts[pts.length - 1];
          const showEfforts = highlight === curve.familyKey;
          return (
            <g key={curve.familyKey} opacity={on ? 1 : 0.12} style={{ transition: "opacity 0.2s" }}>
              {pts.length > 1 && (
                <polyline
                  points={pts.map((p) => `${p.cx},${p.cy}`).join(" ")}
                  fill="none"
                  stroke={c}
                  strokeWidth={highlight === curve.familyKey ? 2.6 : 1.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {pts.map((p, i) => (
                <g key={i}>
                  {p.matched && <circle cx={p.cx} cy={p.cy} r="7" fill="none" stroke="var(--ink)" strokeWidth="1.5" />}
                  <circle cx={p.cx} cy={p.cy} r="4" fill="var(--chart-surface)" />
                  <circle cx={p.cx} cy={p.cy} r="2.7" fill={c} />
                  {(showEfforts || p.matched) && (
                    <text x={p.cx} y={p.cy + 15} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.8" fill={p.matched ? "var(--ink-2)" : "var(--muted)"}>
                      {effortLabel(p.effort)}
                    </text>
                  )}
                </g>
              ))}
              <text x={last.cx + 9} y={last.cy + 3.5} textAnchor="start" fontFamily="var(--font-display)" fontSize="10.5" fontWeight="600" fill="var(--ink)">
                {curve.short}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1.5">
        {deepsweEffortCurves.map((curve) => {
          const on = active(curve.familyKey);
          return (
            <button
              key={curve.familyKey}
              onMouseEnter={() => setHighlight(curve.familyKey)}
              onMouseLeave={() => setHighlight(null)}
              onClick={() => setHighlight((h) => (h === curve.familyKey ? null : curve.familyKey))}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all ${
                highlight === curve.familyKey ? "border-line-strong bg-surface-2" : "border-line"
              } ${on ? "opacity-100" : "opacity-40"}`}
              aria-pressed={highlight === curve.familyKey}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: hue(curve.modelId) }} />
              <span className="text-ink-2">{curve.short}</span>
            </button>
          );
        })}
      </div>

      <figcaption className="mt-2 px-1 font-mono text-[0.68rem] leading-relaxed text-muted">
        DeepSWE-only · nodes step low → max up each curve · ring = the effort measured in the ShallowSWE pilot · hover a
        model to read every effort level
      </figcaption>
    </figure>
  );
}
