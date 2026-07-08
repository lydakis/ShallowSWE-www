"use client";

import { rankTranslation, modelById, fmtPercent, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useModelSelection } from "@/lib/model-selection";
import { useWeights } from "@/lib/weights";

const VB_W = 560;
const COL_L = 176;
const COL_R = 384;
const TOP = 70;
const STEP = 46;
const BOTTOM_PAD = 58;

const y = (rank: number) => TOP + (rank - 1) * STEP;

export default function RankTranslation() {
  const hue = useHue();
  const { weights } = useWeights();
  const { selectedModelIdSet } = useModelSelection();
  const rows = rankTranslation(weights, selectedModelIdSet);
  const vbH = TOP + Math.max(rows.length - 1, 0) * STEP + BOTTOM_PAD;

  if (rows.length === 0) {
    return (
      <figure className="flex min-h-[16rem] items-center justify-center">
        <figcaption className="font-mono text-xs text-muted">
          No DeepSWE-matched rows for the selected model set.
        </figcaption>
      </figure>
    );
  }

  return (
    <figure>
      <svg
        viewBox={`0 0 ${VB_W} ${vbH}`}
        className="w-full select-none"
        role="img"
        aria-label="Slopegraph connecting each model-effort row's DeepSWE pass at one rank to its ShallowSWE cost per successful completion rank."
      >
        {/* column headers */}
        <text x={COL_L} y={30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--ink)">
          DEEP END
        </text>
        <text x={COL_L} y={45} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted)">
          pass@1 · DeepSWE
        </text>
        <text x={COL_R} y={30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--ink)">
          SHALLOW END
        </text>
        <text x={COL_R} y={45} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
          $ / success · ShallowSWE
        </text>

        {/* connective slopes; effort variants share a family hue, so the low
            variant is dashed to keep the two lines apart mid-chart */}
        {rows.map((r) => {
          const c = hue(r.modelId);
          const m = modelById[r.modelId];
          const moved = r.deepRank !== r.shallowRank;
          const hasSibling = rows.some(
            (other) => other.modelId !== r.modelId && modelById[other.modelId].priceKey === m.priceKey,
          );
          return (
            <line
              key={`l${r.modelId}`}
              x1={COL_L + 8}
              y1={y(r.deepRank)}
              x2={COL_R - 8}
              y2={y(r.shallowRank)}
              stroke={c}
              strokeWidth={moved ? 2.4 : 1.4}
              strokeOpacity={moved ? 0.9 : 0.4}
              strokeDasharray={hasSibling && m.effort === "low" ? "6 5" : undefined}
              strokeLinecap="round"
            />
          );
        })}

        {/* rank guide numbers, over the slopes with a surface halo */}
        {rows.map((_, i) => (
          <text
            key={`g${i}`}
            x={(COL_L + COL_R) / 2}
            y={y(i + 1) + 3.5}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            className="tnum"
            fill="var(--muted)"
            stroke="var(--chart-surface)"
            strokeWidth="3.5"
            paintOrder="stroke"
          >
            #{i + 1}
          </text>
        ))}

        {/* endpoints + labels */}
        {rows.map((r) => {
          const c = hue(r.modelId);
          const m = modelById[r.modelId];
          return (
            <g key={r.modelId}>
              {/* deep end */}
              <circle cx={COL_L + 8} cy={y(r.deepRank)} r="4" fill={c} />
              <text x={COL_L - 4} y={y(r.deepRank) - 4} textAnchor="end" fontFamily="var(--font-display)" fontSize="11.5" fontWeight="600" fill="var(--ink)">
                {m.short}
              </text>
              <text x={COL_L - 4} y={y(r.deepRank) + 9} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" className="tnum" fill="var(--muted)">
                {fmtPercent(r.deepValue)}
              </text>

              {/* shallow end */}
              <circle cx={COL_R - 8} cy={y(r.shallowRank)} r="4" fill={c} />
              <text x={COL_R + 4} y={y(r.shallowRank) - 4} textAnchor="start" fontFamily="var(--font-display)" fontSize="11.5" fontWeight="600" fill="var(--ink)">
                {m.short}
              </text>
              <text x={COL_R + 4} y={y(r.shallowRank) + 9} textAnchor="start" fontFamily="var(--font-mono)" fontSize="9" className="tnum" fill="var(--muted)">
                {fmtUsd(r.shallowValue)}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 px-1 font-mono text-[0.68rem] leading-relaxed text-muted">
        rank 1 = highest DeepSWE pass@1 on the left, lowest ShallowSWE CPSC on the right · dashed line = a
        family&rsquo;s low-effort variant
      </figcaption>
    </figure>
  );
}
