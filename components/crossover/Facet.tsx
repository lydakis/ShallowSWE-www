"use client";

import { useState } from "react";
import {
  CategoryDef,
  Metric,
  cellsFor,
  metricValue,
  fmtMetric,
  fmtMaybeMetric,
  modelById,
  taskIdsFor,
  type ModelDef,
} from "@/app/data/model";
import { logScale } from "@/lib/scale";
import { FACET, PLOT, pointX } from "./types";

interface Props {
  category: CategoryDef;
  metric: Metric;
  domain: [number, number];
  ticks: number[];
  hue: (id: string) => string;
  highlight: string | null;
  xLabels: string[];
  models: ModelDef[];
}

export default function Facet({ category, metric, domain, ticks, hue, highlight, xLabels, models }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const y = logScale(domain[0], domain[1], PLOT.top, PLOT.bottom);
  const taskIds = taskIdsFor(category.id);

  const series = models.map((m) => {
    const cells = cellsFor(category.id, m.id);
    const pts = taskIds.map((taskId, i) => {
      const c = cells.find((cell) => cell.taskId === taskId);
      const v = c ? metricValue(c, metric) : null;
      const failed = c != null && c.repairLoops > 0 && c.successes === 0;
      return {
        cell: c,
        taskIndex: i,
        x: pointX(i, taskIds.length),
        v,
        failed,
        y: v == null ? null : y(v),
      };
    });
    return { id: m.id, color: hue(m.id), pts };
  });

  // label the extremes at the category's deepest measured task.
  const byEnd = [...series]
    .filter((s) => s.pts.at(-1)?.v != null)
    .sort((a, b) => a.pts.at(-1)!.v! - b.pts.at(-1)!.v!);
  const labelIds = new Set(byEnd.length ? [byEnd[0].id, byEnd[byEnd.length - 1].id] : []);

  const active = (id: string) => highlight === null || highlight === id;
  const axisLabels = compactAxisLabels(xLabels);
  const tooltipValue = (p: (typeof series)[number]["pts"][number]): string => {
    if (!p.cell) return "not measured";
    if (p.failed) return `failed · ${stopReasonLabel(p.cell.stopReasons)}`;
    return fmtMaybeMetric(p.v, metric);
  };
  const tooltipDetail = (p: (typeof series)[number]["pts"][number]): string | null => {
    if (!p.cell) return null;
    const scored =
      p.cell.totalTrials === p.cell.repairLoops
        ? `n=${p.cell.repairLoops}`
        : `n=${p.cell.repairLoops}/${p.cell.totalTrials}`;
    return `${p.cell.successes}/${p.cell.repairLoops} solved · ${scored} scored`;
  };
  const tooltipRank = (p: (typeof series)[number]["pts"][number]): number => {
    if (p.v != null) return p.v;
    if (p.failed) return Number.POSITIVE_INFINITY - 1;
    return Number.POSITIVE_INFINITY;
  };
  const tipXPercent = hover === null ? 0 : (pointX(hover, xLabels.length) / FACET.W) * 100;
  const tipTransform =
    hover === null
      ? "translateX(-50%)"
      : hover <= 1
        ? "translateX(0)"
        : hover >= xLabels.length - 2
          ? "translateX(-100%)"
          : "translateX(-50%)";

  return (
    <figure className="panel overflow-visible">
      <figcaption className="flex items-baseline justify-between border-b border-line px-4 py-2.5">
        <span className="font-display text-[0.95rem] text-ink">{category.label}</span>
        <span className="font-mono text-[0.66rem] text-muted">{category.gloss}</span>
      </figcaption>
      <div className="relative">
        <svg viewBox={`0 0 ${FACET.W} ${FACET.H}`} className="w-full select-none" role="img" aria-label={`${category.label}: measured ${metric === "cpsc" ? "cost" : "tokens"} per success by task`}>
          {/* gauge gridlines */}
          {ticks.map((t) => {
            const gy = y(t);
            return (
              <g key={t}>
                <line x1={PLOT.left} y1={gy} x2={PLOT.right} y2={gy} stroke="var(--line)" strokeWidth="1" />
                <text x={PLOT.left - 6} y={gy + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
                  {fmtMetric(t, metric)}
                </text>
              </g>
            );
          })}
          {/* surface tick at top */}
          <text x={PLOT.left} y={PLOT.top - 5} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
            ▲ cheaper
          </text>

          {/* task x labels + crosshair columns */}
          {xLabels.map((tl, i) => (
            <g key={tl}>
              <text x={pointX(i, xLabels.length)} y={PLOT.bottom + 20} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill={hover === i ? "var(--ink)" : "var(--muted)"}>
                {axisLabels[i]}
              </text>
              {hover === i && <line x1={pointX(i, xLabels.length)} y1={PLOT.top} x2={pointX(i, xLabels.length)} y2={PLOT.bottom} stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 3" />}
            </g>
          ))}

          {/* series lines */}
          {series.map((s) => {
            const plotted = s.pts.filter((p): p is typeof p & { y: number } => p.y != null);
            if (plotted.length === 0) return null;
            return (
              <polyline
                key={s.id}
                points={plotted.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={highlight === s.id ? 3 : 2}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={active(s.id) ? 1 : 0.14}
                style={{ transition: "opacity 0.2s" }}
              />
            );
          })}

          {/* markers */}
          {series.map((s) =>
            s.pts.filter((p): p is typeof p & { y: number } => p.y != null).map((p, i) => (
              <g key={s.id + i} opacity={active(s.id) ? 1 : 0.14} style={{ transition: "opacity 0.2s" }}>
                <circle cx={p.x} cy={p.y} r={hover === p.taskIndex ? 5 : 4} fill="var(--chart-surface)" />
                <circle cx={p.x} cy={p.y} r={hover === p.taskIndex ? 3.4 : 2.6} fill={s.color} />
              </g>
            )),
          )}

          {/* endpoint labels for extremes */}
          {series
            .filter((s) => labelIds.has(s.id) && active(s.id) && s.pts.at(-1)?.y != null)
            .map((s) => (
              <text
                key={s.id}
                x={PLOT.right + 5}
                y={s.pts.at(-1)!.y! + 3}
                fontFamily="var(--font-mono)"
                fontSize="9"
                className="tnum"
                fill="var(--ink-2)"
              >
                {modelById[s.id].short.split(" ")[0]}
              </text>
            ))}

          {/* hover hit zones */}
          {xLabels.map((_, i) => {
            const w = (PLOT.right - PLOT.left) / xLabels.length;
            return (
              <rect
                key={i}
                x={PLOT.left + i * w}
                y={PLOT.top}
                width={w}
                height={PLOT.bottom - PLOT.top}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setHover((h) => (h === i ? null : i))}
              />
            );
          })}
        </svg>

        {/* tooltip */}
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 z-30 max-w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface/95 p-2.5 backdrop-blur"
            style={{
              left: `${tipXPercent}%`,
              transform: tipTransform,
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="mb-1.5 font-mono text-[0.62rem] text-muted">
              {category.label} · {xLabels[hover]}
            </div>
            <div className="space-y-1">
              {[...series]
                .sort((a, b) => tooltipRank(a.pts[hover]) - tooltipRank(b.pts[hover]))
                .map((s) => (
                  <div key={s.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-2 text-[0.72rem]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className={`${active(s.id) ? "text-ink" : "text-muted"}`}>{modelById[s.id].short}</span>
                    <span className="pl-2 font-mono tnum text-ink-2">{tooltipValue(s.pts[hover])}</span>
                    {tooltipDetail(s.pts[hover]) && (
                      <span className="col-span-2 col-start-2 -mt-0.5 font-mono text-[0.62rem] text-muted">
                        {tooltipDetail(s.pts[hover])}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}

function stopReasonLabel(stopReasons: Record<string, number>): string {
  const top = Object.entries(stopReasons).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!top) return "no success";
  return top.replaceAll("_", " ");
}

function compactAxisLabels(labels: string[]): string[] {
  const seen = new Map<string, number>();
  return labels.map((label) => {
    const code = label.split(" · ")[0] || "T";
    const next = (seen.get(code) ?? 0) + 1;
    seen.set(code, next);
    return `${code}${next}`;
  });
}
