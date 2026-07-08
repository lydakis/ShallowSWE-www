"use client";

import { useState } from "react";
import {
  stickerPremiumRows,
  modelById,
  fmtUsd,
  PRICE_SHEET_DATE,
  REFERENCE_PRICE_KEY,
  referencePriceOptions,
} from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useModelSelection } from "@/lib/model-selection";
import { useWeights } from "@/lib/weights";
import { logScale, logTicks, niceLogBounds } from "@/lib/scale";

const VB_W = 560;
const ROW_H = 34;
const PLOT_L = 148;
const PLOT_R = 468;
const TOP = 18;
const BOTTOM_PAD = 34;
const DOT_R = 4.5;

function fmtPremium(value: number): string {
  return `${value.toFixed(value >= 10 ? 0 : 1)}×`;
}

export default function StickerPremiumChart() {
  const hue = useHue();
  const { weights } = useWeights();
  const { selectedModelIdSet } = useModelSelection();
  const [hover, setHover] = useState<string | null>(null);
  const [refKey, setRefKey] = useState(REFERENCE_PRICE_KEY);

  const refLabel = referencePriceOptions.find((o) => o.key === refKey)?.label ?? refKey;
  const rows = stickerPremiumRows(weights, refKey).filter((row) => selectedModelIdSet.has(row.modelId));
  if (rows.length === 0) {
    return (
      <figure className="panel p-4">
        <figcaption className="font-mono text-xs text-muted">No scored repair loops in the selected basket.</figcaption>
      </figure>
    );
  }

  const [xMin, xMax] = niceLogBounds(rows.flatMap((r) => [r.ownCpsc, r.repricedCpsc]));
  const x = logScale(xMin, xMax, PLOT_L, PLOT_R);
  const ticks = logTicks(xMin, xMax);

  const vbH = TOP + rows.length * ROW_H + BOTTOM_PAD;
  const hp = rows.find((r) => r.modelId === hover) ?? null;
  const hpIndex = hp ? rows.indexOf(hp) : 0;
  const tipY = ((TOP + hpIndex * ROW_H + ROW_H / 2) / vbH) * 100;

  return (
    <figure className="panel overflow-hidden">
      <figcaption className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-[0.95rem] text-ink">The sticker premium</div>
          <div className="mt-0.5 font-mono text-[0.66rem] text-muted">
            Cost per success priced twice: at each model&rsquo;s list price, and at one shared reference rate
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
            <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink-2" />
            at reference rates
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-2" />
            at list price
          </span>
          <label className="inline-flex items-center gap-1.5 text-xs text-ink-2">
            reprice at
            <select
              value={refKey}
              onChange={(e) => setRefKey(e.target.value)}
              className="rounded-md border border-line bg-surface px-1.5 py-1 font-mono text-[0.7rem] text-ink"
            >
              {referencePriceOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </figcaption>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${vbH}`}
          className="w-full select-none"
          role="img"
          aria-label={`Dumbbell chart: for each model-effort row, cost per verified success at its own list price versus the same token usage billed at ${refLabel} rates. The gap is the list-price premium; rows are sorted by premium, largest first.`}
        >
          {ticks.map((t) => (
            <g key={`t${t}`}>
              <line
                x1={x(t)}
                y1={TOP - 4}
                x2={x(t)}
                y2={TOP + rows.length * ROW_H + 4}
                stroke="var(--line)"
                strokeWidth="1"
              />
              <text
                x={x(t)}
                y={TOP + rows.length * ROW_H + 18}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="9.5"
                className="tnum"
                fill="var(--muted)"
              >
                {fmtUsd(t)}
              </text>
            </g>
          ))}

          {rows.map((r, i) => {
            const m = modelById[r.modelId];
            const rowY = TOP + i * ROW_H;
            const cy = rowY + ROW_H / 2;
            const dim = hover && hover !== r.modelId;
            const xOwn = x(r.ownCpsc);
            const xRef = x(r.repricedCpsc);
            const labelX = Math.max(xOwn, xRef) + DOT_R + 6;
            return (
              <g key={r.modelId} opacity={dim ? 0.35 : 1} style={{ transition: "opacity 0.15s" }}>
                <circle cx={12} cy={cy} r="3.5" fill={hue(r.modelId)} />
                <text
                  x={22}
                  y={cy + 4}
                  fontFamily="var(--font-display)"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--ink)"
                >
                  {m.short}
                </text>
                <line
                  x1={xRef}
                  y1={cy}
                  x2={xOwn}
                  y2={cy}
                  stroke={hue(r.modelId)}
                  strokeWidth="2"
                  opacity="0.55"
                />
                <circle
                  cx={xRef}
                  cy={cy}
                  r={DOT_R}
                  fill="var(--plane)"
                  stroke={hue(r.modelId)}
                  strokeWidth="1.8"
                />
                <circle cx={xOwn} cy={cy} r={DOT_R} fill={hue(r.modelId)} stroke="var(--plane)" strokeWidth="1.5" />
                <text
                  x={labelX}
                  y={cy + 3.5}
                  fontFamily="var(--font-mono)"
                  fontSize="9.5"
                  className="tnum"
                  fill="var(--ink-2)"
                >
                  {fmtPremium(r.premium)}
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
              <div className="flex items-center gap-2">
                <span>At its list price</span>
                <span className="ml-auto pl-3">{fmtUsd(hp.ownCpsc)} / success</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Same tokens at {refLabel} rates</span>
                <span className="ml-auto pl-3">{fmtUsd(hp.repricedCpsc)} / success</span>
              </div>
              <div className="flex items-center gap-2 border-t border-line pt-0.5 text-ink">
                <span>List-price premium</span>
                <span className="ml-auto pl-3">{fmtPremium(hp.premium)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line px-4 py-2 font-mono text-[0.68rem] leading-relaxed text-muted">
        every model&rsquo;s measured token usage repriced at {refKey} list rates (openrouter {PRICE_SHEET_DATE}) ·
        sorted by premium · log scale · the default anchor is the cheapest open-weight sheet on the panel · a premium
        over the reference token rates, not a serving margin — models may differ in what they cost to run
      </div>
    </figure>
  );
}
