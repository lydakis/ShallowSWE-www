"use client";

import { useState } from "react";
import {
  weightedCostAnatomy,
  modelById,
  fmtTokens,
  fmtUsd,
  PRICE_SHEET_DATE,
} from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useModelSelection } from "@/lib/model-selection";
import { useResolvedTheme } from "@/lib/theme";
import { useWeights } from "@/lib/weights";
import { linScale } from "@/lib/scale";

const VB_W = 560;
const ROW_H = 30;
const BAR_H = 12;
const PLOT_L = 148;
const PLOT_R = 492;
const TOP = 18;
const BOTTOM_PAD = 34;
const SEGMENT_GAP = 2;

// One hue, lightness ordered by unit price (cache reads cheapest → output
// dearest); a sequential ramp, not a categorical trio, in both themes.
const SEGMENT_COLORS = {
  light: { cache: "#a7c7e0", fresh: "#3b82c4", output: "#12466e" },
  dark: { cache: "#24506e", fresh: "#4a9fd8", output: "#a5d8f3" },
} as const;

const SEGMENTS = [
  { id: "cache", label: "Cache reads" },
  { id: "fresh", label: "Fresh input" },
  { id: "output", label: "Output" },
] as const;

type SegmentId = (typeof SEGMENTS)[number]["id"];

function tickStep(max: number): number {
  for (const step of [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1]) {
    if (max / step <= 5) return step;
  }
  return 1;
}

export default function CostAnatomyChart() {
  const hue = useHue();
  const theme = useResolvedTheme();
  const { weights } = useWeights();
  const { selectedModelIdSet } = useModelSelection();
  const [hover, setHover] = useState<string | null>(null);

  const rows = weightedCostAnatomy(weights).filter((row) => selectedModelIdSet.has(row.modelId));
  if (rows.length === 0) {
    return (
      <figure className="panel p-4">
        <figcaption className="font-mono text-xs text-muted">No scored repair loops in the selected basket.</figcaption>
      </figure>
    );
  }

  const colors = SEGMENT_COLORS[theme];
  const maxTotal = Math.max(...rows.map((r) => r.totalUsd));
  const step = tickStep(maxTotal);
  const xMax = Math.ceil(maxTotal / step) * step;
  const x = linScale(0, xMax, PLOT_L, PLOT_R);
  const ticks: number[] = [];
  for (let t = 0; t <= xMax + step / 2; t += step) ticks.push(Math.round(t * 1000) / 1000);

  const vbH = TOP + rows.length * ROW_H + BOTTOM_PAD;
  const hp = rows.find((r) => r.modelId === hover) ?? null;
  const hpIndex = hp ? rows.indexOf(hp) : 0;
  const tipY = ((TOP + hpIndex * ROW_H + ROW_H / 2) / vbH) * 100;

  const segmentsOf = (r: (typeof rows)[number]): { id: SegmentId; usd: number; tokens: number }[] => [
    { id: "cache", usd: r.cacheReadUsd, tokens: r.cacheReadTokens },
    { id: "fresh", usd: r.freshInputUsd, tokens: r.freshInputTokens },
    { id: "output", usd: r.outputUsd, tokens: r.outputTokens },
  ];

  return (
    <figure className="panel overflow-hidden">
      <figcaption className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-[0.95rem] text-ink">Where the dollar goes</div>
          <div className="mt-0.5 font-mono text-[0.66rem] text-muted">Mean cost of one repair loop, split by token type</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {SEGMENTS.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5 text-xs text-ink-2">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: colors[s.id] }} />
              {s.label}
            </span>
          ))}
        </div>
      </figcaption>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${vbH}`}
          className="w-full select-none"
          role="img"
          aria-label="Stacked bars decomposing each model-effort row's mean repair-loop cost into cache reads, fresh input, and output token spend. Cheapest rows first."
        >
          {ticks.map((t) => (
            <g key={`t${t}`}>
              <line x1={x(t)} y1={TOP - 4} x2={x(t)} y2={TOP + rows.length * ROW_H + 4} stroke="var(--line)" strokeWidth="1" />
              <text
                x={x(t)}
                y={TOP + rows.length * ROW_H + 18}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="9.5"
                className="tnum"
                fill="var(--muted)"
              >
                {t === 0 ? "$0" : fmtUsd(t)}
              </text>
            </g>
          ))}

          {rows.map((r, i) => {
            const m = modelById[r.modelId];
            const rowY = TOP + i * ROW_H;
            const barY = rowY + (ROW_H - BAR_H) / 2;
            const dim = hover && hover !== r.modelId;
            let cursor = PLOT_L;
            const segments = segmentsOf(r).map((s) => {
              const w = Math.max(0, x(s.usd) - PLOT_L);
              const seg = { ...s, x: cursor, w: Math.max(0, w - (w > 0 ? SEGMENT_GAP : 0)) };
              cursor += w;
              return seg;
            });
            const barEnd = cursor;
            return (
              <g key={r.modelId} opacity={dim ? 0.35 : 1} style={{ transition: "opacity 0.15s" }}>
                <circle cx={12} cy={rowY + ROW_H / 2} r="3.5" fill={hue(r.modelId)} />
                <text
                  x={22}
                  y={rowY + ROW_H / 2 + 4}
                  fontFamily="var(--font-display)"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--ink)"
                >
                  {m.short}
                </text>
                {segments.map(
                  (s) =>
                    s.w > 0.5 && (
                      <rect key={s.id} x={s.x} y={barY} width={s.w} height={BAR_H} rx="2" fill={colors[s.id]} />
                    ),
                )}
                <text
                  x={barEnd + 7}
                  y={rowY + ROW_H / 2 + 3.5}
                  fontFamily="var(--font-mono)"
                  fontSize="9.5"
                  className="tnum"
                  fill="var(--ink-2)"
                >
                  {fmtUsd(r.totalUsd)}
                </text>
                <rect
                  x={0}
                  y={rowY}
                  width={VB_W}
                  height={ROW_H}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHover(r.modelId)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setHover((h) => (h === r.modelId ? null : r.modelId))}
                />
              </g>
            );
          })}
        </svg>

        {hp && (
          <div
            className="pointer-events-none absolute left-1/2 z-30 max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-surface/95 px-3 py-2 backdrop-blur"
            style={{
              top: `${tipY}%`,
              transform: `translate(-50%, ${tipY > 62 ? "calc(-100% - 12px)" : "12px"})`,
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="flex items-center gap-1.5 text-[0.78rem] font-medium text-ink">
              <span className="h-2 w-2 rounded-full" style={{ background: hue(hp.modelId) }} />
              {modelById[hp.modelId].short}
            </div>
            <div className="mt-1 space-y-0.5 font-mono text-[0.68rem] tnum text-ink-2">
              {segmentsOf(hp).map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-[2px]" style={{ background: colors[s.id] }} />
                  <span>{SEGMENTS.find((seg) => seg.id === s.id)!.label}</span>
                  <span className="ml-auto pl-3">
                    {fmtUsd(s.usd)} · {fmtTokens(s.tokens)} tok
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 border-t border-line pt-0.5 text-ink">
                <span>Mean loop cost</span>
                <span className="ml-auto pl-3">{fmtUsd(hp.totalUsd)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line px-4 py-2 font-mono text-[0.68rem] leading-relaxed text-muted">
        one bar per model-effort row, cheapest first · basket-weighted mean $ per scored repair loop · fresh input =
        prompt tokens billed uncached · reconstructed from token means × openrouter {PRICE_SHEET_DATE} price sheet
      </div>
    </figure>
  );
}
