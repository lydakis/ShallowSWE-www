"use client";

import { categories, sizes } from "@/app/data/model";
import {
  categorySliceOf,
  sizeSliceOf,
  useWeights,
  withCategorySlice,
  withSizeSlice,
} from "@/lib/weights";

function Segment({
  options,
  active,
  onPick,
  groupLabel,
}: {
  options: { id: string; label: string }[];
  active: string | null;
  onPick: (id: string) => void;
  groupLabel: string;
}) {
  return (
    <div role="group" aria-label={groupLabel} className="inline-flex rounded-full border border-line bg-surface p-0.5">
      {options.map((option) => {
        const selected = active === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(option.id)}
            className={`rounded-full px-2.5 py-1 font-mono text-[0.68rem] transition-colors ${
              selected ? "bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Per-axis slice filters for the workload basket: pick a category, a size, or
 * both; "All" restores the equal mix on that axis. Slider-custom mixes leave
 * both groups unselected.
 */
export default function BasketSlices() {
  const { weights, setWeights } = useWeights();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Segment
        groupLabel="Category slice"
        options={[{ id: "all", label: "All" }, ...categories.map((c) => ({ id: c.id, label: c.label }))]}
        active={categorySliceOf(weights)}
        onPick={(id) => setWeights(withCategorySlice(weights, id as Parameters<typeof withCategorySlice>[1]))}
      />
      <Segment
        groupLabel="Size slice"
        options={[{ id: "all", label: "All" }, ...sizes.map((size) => ({ id: size.id, label: size.label }))]}
        active={sizeSliceOf(weights)}
        onPick={(id) => setWeights(withSizeSlice(weights, id as Parameters<typeof withSizeSlice>[1]))}
      />
    </div>
  );
}
