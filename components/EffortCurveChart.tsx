"use client";

import { useState } from "react";
import { weightedAggregates, modelById, models, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useWeights } from "@/lib/weights";
import { linScale, logScale } from "@/lib/scale";

const VB_W = 560;
const VB_H = 410;
const PLOT = { l: 60, r: 470, t: 34, b: 336 };
const CANDIDATE_Y_TICKS = [0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 1];

const priceKeyOf = Object.fromEntries(models.map((m) => [m.id, m.priceKey]));

export default function EffortCurveChart() {
  const hue = useHue();
  const { weights } = useWeights();
  const [hover, setHover] = useState<string | null>(null);

  const pts = weightedAggregates(weights).map((a) => ({
    id: a.modelId,
    m: modelById[a.modelId],
    turns: a.turns,
    cpsc: a.cpsc,
  }));

  const turns = pts.map((p) => p.turns);
  const costs = pts.map((p) => p.cpsc).filter((v) => Number.isFinite(v) && v > 0);
  const xMin = Math.max(0, Math.floor(Math.min(...turns)) - 1);
  const xMax = Math.ceil(Math.max(...turns)) + 2;
  const yMin = Math.max(0.005, Math.min(...costs) * 0.75);
  const yMax = Math.max(0.05, Math.max(...costs) * 1.3);
  const x = linScale(xMin, xMax, PLOT.l, PLOT.r);
  const y = logScale(yMin, yMax, PLOT.t, PLOT.b);

  const xTicks = [5, 10, 15, 20, 25, 30].filter((t) => t >= xMin && t <= xMax);
  const yTicks = CANDIDATE_Y_TICKS.filter((t) => t >= yMin && t <= yMax);

  // connect a model family's effort variants so families read as one unit
  const families = new Map<string, typeof pts>();
  for (const p of pts) {
    const k = priceKeyOf[p.id];
    families.set(k, [...(families.get(k) ?? []), p]);
  }
  const connectors = [...families.values()]
    .filter((g) => g.length > 1)
    .map((g) => [...g].sort((a, b) => a.turns - b.turns));

  // label placement: right of dot, or left near the right edge; greedy vertical
  // declutter per side so labels don't stack.
  const placed = pts.map((p) => {
    const px = x(p.turns);
    const right = px < PLOT.l + 0.62 * (PLOT.r - PLOT.l);
    return { ...p, px, py: y(p.cpsc), right };
  });
  for (const side of [true, false]) {
    const group = placed.filter((p) => p.right === side).sort((a, b) => a.py - b.py);
    let prev = -Infinity;
    for (const p of group) {
      p.py = Math.max(p.py, prev + 13);
      prev = p.py;
    }
  }

  const hp = pts.find((p) => p.id === hover) ?? null;
  const tipX = hp ? (x(hp.turns) / VB_W) * 100 : 0;
  const tipY = hp ? (y(hp.cpsc) / VB_H) * 100 : 0;
  const tipTransform = `translate(${tipX > 78 ? "-92%" : tipX < 18 ? "-8%" : "-50%"}, ${
    tipY < 30 ? "14px" : "calc(-100% - 14px)"
  })`;

  return (
    <figure className="panel overflow-hidden">
      <figcaption className="flex items-baseline justify-between border-b border-line px-4 py-2.5">
        <span className="font-display text-[0.95rem] text-ink">Turns against cost</span>
        <span className="font-mono text-[0.66rem] text-muted">Log CPSC by model effort</span>
      </figcaption>
      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full select-none"
          role="img"
          aria-label="Scatter of cost per successful completion against agent turns, one dot per model-effort row. A model's effort variants are connected."
        >
          <text x={(PLOT.l + PLOT.r) / 2} y={VB_H - 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-2)">
            AGENT TURNS TO FINISH
          </text>
          <text x={16} y={(PLOT.t + PLOT.b) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-2)" transform={`rotate(-90 16 ${(PLOT.t + PLOT.b) / 2})`}>
            COST PER SUCCESS · LOG
          </text>
          <text x={PLOT.l} y={PLOT.t - 9} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
            ▲ cheaper · ◀ fewer turns
          </text>

          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={x(t)} y1={PLOT.t} x2={x(t)} y2={PLOT.b} stroke="var(--line)" strokeWidth="1" />
              <text x={x(t)} y={PLOT.b + 17} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" className="tnum" fill="var(--muted)">
                {t}
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

          {/* family connectors (low → medium effort) */}
          {connectors.map((g) => (
            <polyline
              key={priceKeyOf[g[0].id]}
              points={g.map((p) => `${x(p.turns)},${y(p.cpsc)}`).join(" ")}
              fill="none"
              stroke={hue(g[0].id)}
              strokeWidth="1.5"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
          ))}

          {/* leaders from dot to decluttered label */}
          {placed.map((p) => (
            <line
              key={`ldr${p.id}`}
              x1={x(p.turns) + (p.right ? 6 : -6)}
              y1={y(p.cpsc)}
              x2={p.px + (p.right ? 10 : -10)}
              y2={p.py}
              stroke={hue(p.id)}
              strokeWidth="1"
              strokeOpacity="0.35"
            />
          ))}
          {pts.map((p) => (
            <g key={p.id} opacity={hover && hover !== p.id ? 0.35 : 1} style={{ transition: "opacity 0.15s" }}>
              <circle cx={x(p.turns)} cy={y(p.cpsc)} r={hover === p.id ? 8 : 6.5} fill="var(--chart-surface)" />
              <circle cx={x(p.turns)} cy={y(p.cpsc)} r={hover === p.id ? 5.5 : 4.5} fill={hue(p.id)} />
            </g>
          ))}
          {placed.map((p) => (
            <text
              key={`lbl${p.id}`}
              x={p.px + (p.right ? 13 : -13)}
              y={p.py + 3.5}
              textAnchor={p.right ? "start" : "end"}
              fontFamily="var(--font-display)"
              fontSize="11"
              fontWeight="600"
              fill="var(--ink)"
              opacity={hover && hover !== p.id ? 0.35 : 1}
            >
              {p.m.short}
            </text>
          ))}

          {/* hover hit targets (bigger than the dots) */}
          {pts.map((p) => (
            <circle
              key={`hit${p.id}`}
              cx={x(p.turns)}
              cy={y(p.cpsc)}
              r="13"
              fill="transparent"
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((h) => (h === p.id ? null : p.id))}
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
              <span className="h-2 w-2 rounded-full" style={{ background: hue(hp.id) }} />
              {hp.m.short}
            </div>
            <div className="mt-0.5 font-mono text-[0.68rem] tnum text-ink-2">
              {hp.turns.toFixed(1)} turns · {fmtUsd(hp.cpsc)} / success
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-line px-4 py-2 font-mono text-[0.68rem] leading-relaxed text-muted">
        one dot per model-effort row · x: mean agent turns · y: cost per success · lines connect a model&rsquo;s effort
        variants
      </div>
    </figure>
  );
}
