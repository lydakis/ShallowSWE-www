"use client";

import { rankTranslation, modelById, fmtUsd } from "@/app/data/model";
import { useHue } from "@/lib/hues";

const VB_W = 560;
const COL_L = 176;
const COL_R = 384;
const TOP = 70;
const STEP = 46;
const BOTTOM_PAD = 58;

const y = (rank: number) => TOP + (rank - 1) * STEP;

export default function RankTranslation() {
  const hue = useHue();
  const rows = rankTranslation();
  const vbH = TOP + Math.max(rows.length - 1, 0) * STEP + BOTTOM_PAD;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${VB_W} ${vbH}`}
        className="w-full select-none"
        role="img"
        aria-label="Slopegraph: each model-effort row's dollar rank on DeepSWE hard tasks (left) connected to its rank on the ShallowSWE pilot (right). Lines that cross are models whose cost ranking inverts between deep and shallow work."
      >
        {/* column headers */}
        <text x={COL_L} y={30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.06em" fill="var(--ink)">
          DEEP END
        </text>
        <text x={COL_L} y={45} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted)">
          $ / solved hard task · DeepSWE
        </text>
        <text x={COL_R} y={30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.06em" fill="var(--ink)">
          SHALLOW END
        </text>
        <text x={COL_R} y={45} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--waterline)">
          $ / pilot success · ShallowSWE
        </text>

        {/* rank guide numbers down the middle */}
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
          >
            #{i + 1}
          </text>
        ))}

        {/* connective slopes */}
        {rows.map((r) => {
          const c = hue(r.modelId);
          const moved = r.deepRank !== r.shallowRank;
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
              strokeLinecap="round"
            />
          );
        })}

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
                {fmtUsd(r.deepValue)}
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
        rank 1 = cheapest per success · left: DeepSWE effort-matched $/solved · right: measured ShallowSWE pilot CPSC ·
        crossing lines invert
      </figcaption>
    </figure>
  );
}
