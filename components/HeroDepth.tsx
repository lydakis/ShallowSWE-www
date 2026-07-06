"use client";

import { weightedAggregates, modelById, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useWeights } from "@/lib/weights";
import { logScale, logTicks, niceLogBounds } from "@/lib/scale";

const VB_W = 480;
const VB_H = 456;
const TOP = 50; // waterline y
const BOTTOM = 420;
const LINE_X = 128; // the sounding line

export default function HeroDepth() {
  const hue = useHue();
  const { weights } = useWeights();
  const aggregates = weightedAggregates(weights).filter((a) => a.cpsc != null);
  if (aggregates.length === 0) {
    return (
      <figure className="flex min-h-[18rem] items-center justify-center">
        <figcaption className="font-mono text-xs text-muted">No verified successes in the selected basket.</figcaption>
      </figure>
    );
  }
  const cpscValues = aggregates.map((a) => a.cpsc).filter((v): v is number => v != null && Number.isFinite(v));
  const [domainLo, domainHi] = niceLogBounds(cpscValues, [0.01, 1]);
  const y = logScale(domainLo, domainHi, TOP, BOTTOM);
  const gauge = logTicks(domainLo, domainHi).filter((g) => g > domainLo && g < domainHi);

  const rows = aggregates
    .map((a) => ({ ...a, yv: y(a.cpsc!), m: modelById[a.modelId] }))
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
        <text x="58" y={TOP - 9} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--waterline)">
          SURFACE · CHEAPEST $ / SUCCESS
        </text>

        {/* sounding line */}
        <line x1={LINE_X} y1={TOP} x2={LINE_X} y2={BOTTOM + 8} stroke="var(--line-strong)" strokeWidth="1" />

        {/* spread bracket: the story is the gap between surface and floor */}
        {rows.length > 1 && rows[0].cpsc != null && rows[rows.length - 1].cpsc != null && (
          (() => {
            const BRACKET_X = VB_W - 20;
            const topY = rows[0].yv;
            const bottomY = rows[rows.length - 1].yv;
            const spread = rows[rows.length - 1].cpsc! / rows[0].cpsc!;
            return (
              <g>
                <line x1={BRACKET_X} y1={topY} x2={BRACKET_X} y2={bottomY} stroke="var(--waterline)" strokeWidth="1" strokeOpacity="0.55" />
                <line x1={BRACKET_X - 4} y1={topY} x2={BRACKET_X + 4} y2={topY} stroke="var(--waterline)" strokeWidth="1" strokeOpacity="0.55" />
                <line x1={BRACKET_X - 4} y1={bottomY} x2={BRACKET_X + 4} y2={bottomY} stroke="var(--waterline)" strokeWidth="1" strokeOpacity="0.55" />
                <text
                  x={BRACKET_X + 4}
                  y={(topY + bottomY) / 2}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="9.5"
                  fill="var(--waterline)"
                  transform={`rotate(-90 ${BRACKET_X + 4} ${(topY + bottomY) / 2})`}
                >
                  {spread >= 9.5 ? Math.round(spread) : spread.toFixed(1)}× SPREAD
                </text>
              </g>
            );
          })()
        )}

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
                  {fmtUsd(r.cpsc!)}
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
