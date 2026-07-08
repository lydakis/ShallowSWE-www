"use client";

import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  weightedAggregates,
  weightedCpscIntervals,
  type Aggregate,
  categories,
  sizes,
  fmtEffort,
  effortTitle,
  fmtModelPricing,
  fmtPercent,
  fmtTokens,
  modelById,
  fmtUsd,
} from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useModelSelection } from "@/lib/model-selection";
import { redistributeTernaryWeights, useWeights } from "@/lib/weights";
import { logScale } from "@/lib/scale";
import BasketSlices from "./BasketSlices";
import ModelSelector from "./ModelSelector";

const CI_STRIP_W = 148;
const CI_STRIP_H = 12;

const CI_COLUMN_TITLE =
  "95% confidence interval on cost / success, from resampling the task suite. All rows share one scale: " +
  "when two rows' bands overlap, their ranks are a statistical tie. Not sortable — it qualifies the " +
  "Cost / success ranking rather than adding a metric.";

/**
 * The 95% CI as a band on a log scale shared by every row, so overlapping
 * intervals — ties — read by vertical alignment instead of number-comparing.
 * Exact bounds live in the tooltip.
 */
function CiStrip({
  lo,
  hi,
  value,
  domain,
  color,
}: {
  lo: number;
  hi: number;
  value: number;
  domain: [number, number];
  color: string;
}) {
  const x = logScale(domain[0], domain[1], 3, CI_STRIP_W - 3);
  return (
    <svg
      width={CI_STRIP_W}
      height={CI_STRIP_H}
      viewBox={`0 0 ${CI_STRIP_W} ${CI_STRIP_H}`}
      className="shrink-0"
      aria-hidden
    >
      <line
        x1={x(lo)}
        y1={CI_STRIP_H / 2}
        x2={x(hi)}
        y2={CI_STRIP_H / 2}
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle cx={x(value)} cy={CI_STRIP_H / 2} r="2.5" fill={color} />
    </svg>
  );
}

type SortKey =
  | "cpsc"
  | "tokensPerSuccess"
  | "solveRate"
  | "p95LoopCost"
  | "turns"
  | "firstCheckPassRate"
  | "capHitRate";
type SortDirection = "asc" | "desc";

const cols: {
  key: SortKey;
  label: string;
  title?: string;
  fmt: (row: Aggregate) => string;
  valueTitle?: (row: Aggregate) => string | undefined;
  sortValue: (row: Aggregate) => number | null;
  goodLow: boolean;
}[] = [
  {
    key: "cpsc",
    label: "Cost / success",
    title:
      "Basket-weighted spend across all scored repair loops, divided by verified successes — the headline metric.",
    fmt: (row) => (row.cpsc == null ? "n/a" : fmtUsd(row.cpsc)),
    valueTitle: (row) => `= ${fmtUsd(row.totalSpend)} total spend / ${row.successes} successes`,
    sortValue: (row) => row.cpsc,
    goodLow: true,
  },
  {
    key: "p95LoopCost",
    label: "p95 loop cost",
    title:
      "95th percentile cost of one scored repair loop in the selected basket — the bad-day price, not the average one.",
    fmt: (row) => fmtUsd(row.p95CostPerRepairLoop),
    valueTitle: (row) =>
      `Mean loop cost: ${fmtUsd(row.costPerRepairLoop)} · solved ${row.successes} / ${row.repairLoops} scored loops`,
    sortValue: (row) => row.p95CostPerRepairLoop,
    goodLow: true,
  },
  {
    key: "firstCheckPassRate",
    label: "First-check pass",
    title: "Share of loops that passed the hidden checks on the first try — lower means more repair iterations.",
    fmt: (row) => fmtPercent(row.firstCheckPassRate),
    valueTitle: (row) => `Avg hidden-check submissions: ${fmtMean(row.meanVerifierSubmissions)} per loop`,
    sortValue: (row) => row.firstCheckPassRate,
    goodLow: false,
  },
  {
    key: "tokensPerSuccess",
    label: "Tokens / success",
    title: "The cost ratio in tokens: loop tokens over verified successes — durable across price changes.",
    fmt: (row) => (row.tokensPerSuccess == null ? "n/a" : fmtTokens(row.tokensPerSuccess)),
    valueTitle: (row) => `Mean tokens per loop: ${fmtTokens(row.tokensPerRepairLoop)}`,
    sortValue: (row) => row.tokensPerSuccess,
    goodLow: true,
  },
  {
    key: "turns",
    label: "Avg turns",
    title: "Mean agent turns per repair loop.",
    fmt: (row) => row.turns.toFixed(1),
    valueTitle: (row) => `p95 turns: ${row.p95Turns.toFixed(1)}`,
    sortValue: (row) => row.turns,
    goodLow: true,
  },
];

type TooltipSide = "top" | "bottom";
type TooltipPosition = {
  left: number;
  side: TooltipSide;
  top: number;
};

function defaultSortDirection(col: (typeof cols)[number]): SortDirection {
  return col.goodLow ? "asc" : "desc";
}

function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === "asc" ? "desc" : "asc";
}

function fmtMean(value: number): string {
  return value.toFixed(value < 10 ? 2 : 1);
}

const TOOLTIP_MARGIN = 12;
const TOOLTIP_MAX_WIDTH = 288;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function TableTooltip({
  children,
  className = "inline-flex",
  content,
  side = "top",
}: {
  children: ReactNode;
  className?: string;
  content?: string;
  side?: TooltipSide;
}) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || !content) return;

    const rect = anchor.getBoundingClientRect();
    const centered = rect.left + rect.width / 2;
    const maxLeft = window.innerWidth - TOOLTIP_MARGIN - TOOLTIP_MAX_WIDTH / 2;
    const left = clamp(centered, TOOLTIP_MARGIN + TOOLTIP_MAX_WIDTH / 2, maxLeft);
    const hasRoomAbove = rect.top > 84;
    const hasRoomBelow = window.innerHeight - rect.bottom > 84;
    const renderedSide =
      side === "top" && !hasRoomAbove && hasRoomBelow
        ? "bottom"
        : side === "bottom" && !hasRoomBelow && hasRoomAbove
          ? "top"
          : side;

    setPosition({
      left,
      side: renderedSide,
      top: renderedSide === "top" ? rect.top - 9 : rect.bottom + 9,
    });
  }, [content, side]);

  useEffect(() => {
    if (!position) return;

    // Dismiss rather than reposition: scrolling moves the anchor away without
    // firing pointerleave, which otherwise strands visible tooltips.
    const dismiss = () => setPosition(null);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);

    return () => {
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [position]);

  if (!content) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={anchorRef}
        aria-describedby={position ? id : undefined}
        className={className}
        onBlur={() => setPosition(null)}
        onFocus={updatePosition}
        onKeyDown={(event) => {
          if (event.key === "Escape") setPosition(null);
        }}
        onPointerEnter={updatePosition}
        onPointerLeave={() => setPosition(null)}
      >
        {children}
      </span>
      {position &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ left: position.left, maxWidth: TOOLTIP_MAX_WIDTH, top: position.top }}
            className={`pointer-events-none fixed z-50 rounded-md border border-line-strong bg-surface/95 px-2.5 py-1.5 text-left font-sans text-[0.72rem] leading-snug text-ink shadow-[0_18px_42px_-24px_rgba(7,23,32,0.62)] ring-1 ring-white/30 backdrop-blur-md before:absolute before:left-1/2 before:h-2 before:w-2 before:-translate-x-1/2 before:rotate-45 before:border-line-strong before:bg-surface ${
              position.side === "top"
                ? "-translate-x-1/2 -translate-y-full before:-bottom-1 before:border-b before:border-r"
                : "-translate-x-1/2 before:-top-1 before:border-l before:border-t"
            }`}
          >
            {content}
          </span>,
          document.body,
        )}
    </>
  );
}

export default function Leaderboard() {
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "cpsc",
    direction: "asc",
  });
  const [basketOpen, setBasketOpen] = useState(false);
  const [showCi, setShowCi] = useState(false);
  const { weights, setWeights } = useWeights();
  const { selectedModelIdSet } = useModelSelection();
  const hue = useHue();
  const cpscIntervals = useMemo(() => weightedCpscIntervals(weights), [weights]);

  const categoryIds = categories.map((c) => c.id);
  const sizeIds = sizes.map((size) => size.id);
  const categoryTotal = categories.reduce((s, c) => s + weights.categories[c.id], 0) || 1;
  const sizeTotal = sizes.reduce((s, size) => s + weights.sizes[size.id], 0) || 1;
  const rows = weightedAggregates(weights)
    .filter((row) => selectedModelIdSet.has(row.modelId))
    .filter((row) => row.repairLoops > 0)
    .sort((a, b) => {
      const col = cols.find((c) => c.key === sort.key)!;
      const dir = sort.direction === "asc" ? 1 : -1;
      const aRaw = col.sortValue(a);
      const bRaw = col.sortValue(b);
      if (aRaw == null && bRaw == null) return 0;
      if (aRaw == null) return 1;
      if (bRaw == null) return -1;
      return (aRaw - bRaw) * dir;
    });
  const ciDomain = useMemo<[number, number]>(() => {
    const spans = rows.map((row) => cpscIntervals[row.modelId]).filter((span): span is NonNullable<typeof span> => span != null);
    if (spans.length === 0) return [0.001, 1];
    return [Math.min(...spans.map((s) => s.lo)) / 1.1, Math.max(...spans.map((s) => s.hi)) * 1.1];
  }, [cpscIntervals, rows]);

  return (
    <div>
      {/* the declared basket: category-weighted CPSC over the run */}
      <div id="basket-mixer" className="relative z-20 mb-4 scroll-mt-20 rounded-xl border border-line bg-surface">
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            aria-expanded={basketOpen}
            aria-controls="basket-mixer-controls"
            onClick={() => setBasketOpen((open) => !open)}
            className="flex min-w-0 items-center gap-2 text-left"
          >
            <span
              className={`font-mono text-[0.7rem] text-muted transition-transform ${
                basketOpen ? "rotate-90" : ""
              }`}
              aria-hidden
            >
              ▶
            </span>
            <span className="min-w-0">
              <span className="block text-sm text-ink">Workload basket</span>
              <span className="block truncate font-mono text-[0.68rem] text-muted">
                Artifact {Math.round((weights.categories.artifact / categoryTotal) * 100)}% · Code{" "}
                {Math.round((weights.categories.code / categoryTotal) * 100)}% · Workflow{" "}
                {Math.round((weights.categories.workflow / categoryTotal) * 100)}% · Small{" "}
                {Math.round((weights.sizes.small / sizeTotal) * 100)}% · Medium{" "}
                {Math.round((weights.sizes.medium / sizeTotal) * 100)}% · Large{" "}
                {Math.round((weights.sizes.large / sizeTotal) * 100)}%
              </span>
            </span>
          </button>
          <BasketSlices />
        </div>

        {basketOpen && (
        <div id="basket-mixer-controls" className="grid gap-4 border-t border-line px-4 py-4 lg:grid-cols-2">
          <p className="text-xs leading-relaxed text-muted lg:col-span-2">
            Weight the mix toward the work you actually route. Every rank and chart on this page follows it.
          </p>
          <div>
            <div className="eyebrow mb-2 text-[0.62rem]">category mix</div>
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-1">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs text-ink-2">
                  <span className="w-20 shrink-0">{c.label}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={weights.categories[c.id]}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        categories: redistributeTernaryWeights(
                          weights.categories,
                          categoryIds,
                          c.id,
                          Number(e.target.value),
                        ),
                      })
                    }
                    className="h-1 w-full accent-[var(--waterline)]"
                    aria-label={`${c.label} category weight`}
                  />
                  <span className="w-9 shrink-0 text-right font-mono tnum text-muted">
                    {Math.round((weights.categories[c.id] / categoryTotal) * 100)}%
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2 text-[0.62rem]">size mix</div>
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-1">
              {sizes.map((size) => (
                <label key={size.id} className="flex items-center gap-2 text-xs text-ink-2">
                  <span className="w-20 shrink-0">{size.label}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={weights.sizes[size.id]}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        sizes: redistributeTernaryWeights(weights.sizes, sizeIds, size.id, Number(e.target.value)),
                      })
                    }
                    className="h-1 w-full accent-[var(--waterline)]"
                    aria-label={`${size.label} size weight`}
                  />
                  <span className="w-9 shrink-0 text-right font-mono tnum text-muted">
                    {Math.round((weights.sizes[size.id] / sizeTotal) * 100)}%
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="mb-3 grid gap-3 px-1 text-sm leading-relaxed text-ink-2 sm:flex sm:items-baseline">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-2">
          <span className="mr-0.5 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-waterline" aria-hidden />
          {rows.length === 0 ? (
            <span>No measured rows for the selected model set.</span>
          ) : rows.every((r) => r.successes === r.repairLoops) ? (
            <>
              Every selected model clears this basket — all{" "}
              <span className="font-mono tnum text-ink">{rows.reduce((s, r) => s + r.repairLoops, 0)}</span> scored
              repair loops ended in a verified pass. The ranking below is price, not ability.
            </>
          ) : (
            <>
              <span className="font-mono tnum text-ink">
                {rows.reduce((s, r) => s + r.successes, 0)} / {rows.reduce((s, r) => s + r.repairLoops, 0)}
              </span>{" "}
              scored repair loops ended in a verified pass — failed loops stay in the cost numerator.
            </>
          )}
          <a href="#method" className="font-mono text-[0.72rem] text-waterline underline-offset-2 hover:underline">
            how it&rsquo;s measured ↓
          </a>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          <ModelSelector />
          <button
            type="button"
            aria-pressed={showCi}
            onClick={() => setShowCi((v) => !v)}
            className={`rounded-full border px-2.5 py-1.5 font-mono text-[0.7rem] transition-colors ${
              showCi
                ? "border-line-strong bg-surface-2 text-ink"
                : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
            }`}
          >
            {showCi ? "hide 95% ranges" : "show 95% ranges"}
          </button>
        </div>
      </div>

      <div className="scroll-x rounded-xl border border-line">
        <table className="min-w-[58rem] border-collapse text-sm">
          <caption className="sr-only">Measured leaderboard for the selected basket weights, sortable</caption>
          <thead>
            <tr className="border-b border-line">
              <th className="px-3 py-2.5 text-left font-medium text-ink-2">Model</th>
              {cols.map((c) => {
                const active = sort.key === c.key;
                const nextDirection = active ? toggleSortDirection(sort.direction) : defaultSortDirection(c);
                return (
                  <Fragment key={c.key}>
                    <th
                      className="px-3 py-2.5 text-right"
                      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                    >
                      <TableTooltip content={c.title} side="bottom">
                        <button
                          type="button"
                          onClick={() => setSort({ key: c.key, direction: nextDirection })}
                          className={`inline-flex items-center gap-1 font-medium transition-colors ${
                            active ? "text-ink" : "text-ink-2 hover:text-ink"
                          }`}
                        >
                          <span
                            className={
                              active ? "underline decoration-waterline decoration-2 underline-offset-4" : undefined
                            }
                          >
                            {c.label}
                          </span>
                          <span className="text-[0.6rem]">{active ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
                        </button>
                      </TableTooltip>
                    </th>
                    {c.key === "cpsc" && showCi && (
                      <th className="px-3 py-2.5 text-left">
                        <TableTooltip content={CI_COLUMN_TITLE} side="bottom">
                          <span className="font-medium text-ink-2">95% range</span>
                        </TableTooltip>
                      </th>
                    )}
                  </Fragment>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={cols.length + (showCi ? 2 : 1)} className="px-3 py-8 text-center font-mono text-xs text-muted">
                  No measured rows yet for the selected basket.
                </td>
              </tr>
            )}
            {rows.map((r, i) => {
              const m = modelById[r.modelId];
              return (
                <tr key={r.modelId} className="border-b border-line last:border-0">
                  <th scope="row" className="px-3 py-2.5 text-left font-normal">
                    <span className="mr-2 inline-block w-6 text-right font-mono text-xs text-muted tnum">
                      {i + 1}
                    </span>
                    <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: hue(r.modelId) }} />
                    <TableTooltip className="inline-flex align-middle" content={`Price / 1M tokens: ${fmtModelPricing(r.modelId)}`}>
                      <span className="text-ink">{m.label}</span>
                    </TableTooltip>
                    <TableTooltip className="ml-1.5 inline-flex align-middle" content={effortTitle(m.effort)}>
                      <span className="font-mono text-[0.7rem] text-muted">{fmtEffort(m.effort)}</span>
                    </TableTooltip>
                    <span className="ml-1.5 font-mono text-[0.7rem] text-muted">{m.vendor}</span>
                  </th>
                  {cols.map((c) => {
                    const ci = c.key === "cpsc" && r.cpsc != null ? cpscIntervals[r.modelId] : undefined;
                    // With the range column hidden, the interval stays reachable
                    // from the cost tooltip.
                    const content =
                      ci && !showCi
                        ? `${c.valueTitle?.(r)} · 95% CI ${fmtUsd(ci.lo)}–${fmtUsd(ci.hi)} from resampling the task suite (overlap = tie)`
                        : c.valueTitle?.(r);
                    return (
                      <Fragment key={c.key}>
                        <td
                          className={`px-3 py-2.5 text-right font-mono tnum ${
                            sort.key === c.key ? "text-ink" : "text-ink-2"
                          }`}
                        >
                          <TableTooltip className="inline-flex w-full justify-end" content={content}>
                            <span>{c.fmt(r)}</span>
                          </TableTooltip>
                        </td>
                        {c.key === "cpsc" && showCi && (
                          <td className="px-3 py-2.5">
                            {ci ? (
                              <TableTooltip
                                className="inline-flex"
                                content={`95% CI ${fmtUsd(ci.lo)}–${fmtUsd(ci.hi)} · rows whose bands overlap are rank ties`}
                              >
                                <CiStrip
                                  lo={ci.lo}
                                  hi={ci.hi}
                                  value={r.cpsc!}
                                  domain={ciDomain}
                                  color={hue(r.modelId)}
                                />
                              </TableTooltip>
                            ) : (
                              <span className="font-mono text-xs text-muted">n/a</span>
                            )}
                          </td>
                        )}
                      </Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
