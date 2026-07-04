"use client";

import { useState } from "react";
import {
  CategoryDef,
  Metric,
  panelModels,
  cellsFor,
  metricValue,
  fmtMetric,
  modelById,
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
}

export default function Facet({ category, metric, domain, ticks, hue, highlight, xLabels }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const y = logScale(domain[0], domain[1], PLOT.top, PLOT.bottom);

  const series = panelModels.map((m) => {
    const cells = cellsFor(category.id, m.id);
    const pts = cells.map((c, i) => ({
      cell: c,
      x: pointX(i, cells.length),
      y: y(metricValue(c, metric)),
      v: metricValue(c, metric),
    }));
    return { id: m.id, color: hue(m.id), pts };
  });

  // label the extremes at the category's deepest measured task.
  const byEnd = [...series].sort((a, b) => a.pts.at(-1)!.v - b.pts.at(-1)!.v);
  const labelIds = new Set([byEnd[0].id, byEnd[byEnd.length - 1].id]);

  const active = (id: string) => highlight === null || highlight === id;

  return (
    <figure className="panel overflow-hidden">
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
          <text x={PLOT.left} y={PLOT.top - 5} fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="0.1em" fill="var(--waterline)">
            ▲ cheaper
          </text>

          {/* task x labels + crosshair columns */}
          {xLabels.map((tl, i) => (
            <g key={tl}>
              <text x={pointX(i, xLabels.length)} y={PLOT.bottom + 20} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={hover === i ? "var(--ink)" : "var(--muted)"}>
                {tl}
              </text>
              {hover === i && <line x1={pointX(i, xLabels.length)} y1={PLOT.top} x2={pointX(i, xLabels.length)} y2={PLOT.bottom} stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 3" />}
            </g>
          ))}

          {/* series lines */}
          {series.map((s) => (
            <polyline
              key={s.id}
              points={s.pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={highlight === s.id ? 3 : 2}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={active(s.id) ? 1 : 0.14}
              style={{ transition: "opacity 0.2s" }}
            />
          ))}

          {/* markers */}
          {series.map((s) =>
            s.pts.map((p, i) => (
              <g key={s.id + i} opacity={active(s.id) ? 1 : 0.14} style={{ transition: "opacity 0.2s" }}>
                <circle cx={p.x} cy={p.y} r={hover === i ? 5 : 4} fill="var(--chart-surface)" />
                <circle cx={p.x} cy={p.y} r={hover === i ? 3.4 : 2.6} fill={s.color} />
              </g>
            )),
          )}

          {/* endpoint labels for extremes */}
          {series
            .filter((s) => labelIds.has(s.id) && active(s.id))
            .map((s) => (
              <text
                key={s.id}
                x={PLOT.right + 5}
                y={s.pts.at(-1)!.y + 3}
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
            className="pointer-events-none absolute top-2 z-10 rounded-lg border border-line bg-surface/95 p-2.5 backdrop-blur"
            style={{
              left: `${(pointX(hover, xLabels.length) / FACET.W) * 100}%`,
              transform: `translateX(${hover === xLabels.length - 1 ? "-105%" : hover === 1 ? "-50%" : "5%"})`,
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="mb-1.5 font-mono text-[0.62rem] tracking-wide text-muted">
              {category.label} · {xLabels[hover]}
            </div>
            <div className="space-y-1">
              {[...series]
                .sort((a, b) => a.pts[hover].v - b.pts[hover].v)
                .map((s) => (
                  <div key={s.id} className="flex items-center gap-2 whitespace-nowrap text-[0.72rem]">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className={`${active(s.id) ? "text-ink" : "text-muted"}`}>{modelById[s.id].short}</span>
                    <span className="ml-auto pl-2 font-mono tnum text-ink-2">{fmtMetric(s.pts[hover].v, metric)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}
