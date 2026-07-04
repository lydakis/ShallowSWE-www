"use client";

import { weightedAggregates, modelById, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useWeights } from "@/lib/weights";
import { logScale } from "@/lib/scale";

const VB_W = 480;
const VB_H = 456;
const TOP = 50; // waterline y
const BOTTOM = 420;
const LINE_X = 128; // the sounding line
const DOM_LO = 0.02;
const DOM_HI = 0.35;

const gauge = [0.03, 0.05, 0.1, 0.2, 0.3];

export default function HeroDepth() {
  const hue = useHue();
  const { weights } = useWeights();
  const y = logScale(DOM_LO, DOM_HI, TOP, BOTTOM);

  const rows = weightedAggregates(weights)
    .map((a) => ({ ...a, yv: y(a.cpsc), m: modelById[a.modelId] }))
    .sort((p, q) => p.yv - q.yv);

  const LABEL_TOP = 116;
  const LABEL_BOTTOM = 360;
  const labelY = rows.map((_, i) =>
    rows.length === 1 ? LABEL_TOP : LABEL_TOP + (i * (LABEL_BOTTOM - LABEL_TOP)) / (rows.length - 1),
  );

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full" role="img" aria-label="Depth gauge: each model at its measured cost per successful completion. Lower values are plotted closer to the surface.">
        <defs>
          <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--waterline)" stopOpacity="0.10" />
            <stop offset="1" stopColor="var(--waterline)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* water body */}
        <rect x="0" y={TOP} width={VB_W} height={BOTTOM - TOP + 20} fill="url(#deep)" />

        {/* depth gauge gridlines + $ labels (the pool wall) */}
        {gauge.map((g) => {
          const gy = y(g);
          return (
            <g key={g}>
              <line x1="58" y1={gy} x2={VB_W - 8} y2={gy} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 5" />
              <text x="52" y={gy + 3.5} textAnchor="end" className="tnum" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--muted)">
                {fmtUsd(g)}
              </text>
            </g>
          );
        })}

        {/* waterline */}
        <line x1="58" y1={TOP} x2={VB_W - 8} y2={TOP} stroke="var(--waterline)" strokeWidth="2" strokeLinecap="round" />
        <text x="58" y={TOP - 9} fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.14em" fill="var(--waterline)">
          SURFACE · LOWEST CPSC
        </text>

        {/* sounding line */}
        <line x1={LINE_X} y1={TOP} x2={LINE_X} y2={BOTTOM + 8} stroke="var(--line-strong)" strokeWidth="1" />

        {rows.map((r, i) => {
          const c = hue(r.m.id);
          return (
            <g key={r.m.id} className="settle" style={{ ["--fromY" as string]: `${TOP - r.yv}px`, animationDelay: `${i * 90}ms` }}>
              {/* leader from dot to label */}
              <line x1={LINE_X + 6} y1={r.yv} x2={LINE_X + 26} y2={labelY[i]} stroke={c} strokeWidth="1" strokeOpacity="0.5" />
              {/* dot with surface ring */}
              <circle cx={LINE_X} cy={r.yv} r="6.5" fill="var(--chart-surface)" />
              <circle cx={LINE_X} cy={r.yv} r="5" fill={c} />
              {/* label block */}
              <text x={LINE_X + 30} y={labelY[i] + 4} fontFamily="var(--font-display)" fontSize="12" fontWeight="600" fill="var(--ink)">
                {r.m.short}
                <tspan dx="6" fontFamily="var(--font-mono)" fontSize="9.5" fontWeight="400" className="tnum" fill="var(--muted)">
                  {fmtUsd(r.cpsc)}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 px-1 font-mono text-[0.7rem] leading-relaxed text-muted">
        Cost per successful completion · log scale
      </figcaption>
      <style>{`
        .settle { animation: settle 0.9s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes settle {
          from { transform: translateY(var(--fromY)); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) { .settle { animation: none; } }
      `}</style>
    </figure>
  );
}
