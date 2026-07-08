"use client";

import { fmtEffort, effortTitle, models } from "@/app/data/model";
import { useHue } from "@/lib/hues";
import { useModelSelection } from "@/lib/model-selection";

export default function ModelSelector() {
  const hue = useHue();
  const {
    selectedCount,
    totalCount,
    isSelected,
    toggleModel,
    selectAllModels,
    clearModels,
  } = useModelSelection();

  return (
    <details className="group relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-line-strong hover:text-ink [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-[0.68rem] text-muted">Models</span>
        <span className="font-mono text-[0.72rem] tnum text-ink">
          {selectedCount}/{totalCount}
        </span>
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3 text-muted transition-transform group-open:rotate-180"
          fill="none"
          aria-hidden
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="absolute left-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-2 shadow-[0_18px_42px_-24px_rgba(7,23,32,0.62)] ring-1 ring-white/30 sm:left-auto sm:right-0">
        <div className="flex items-center justify-between gap-3 border-b border-line px-2 pb-2">
          <div>
            <div className="font-display text-sm text-ink">Model filter</div>
            <div className="font-mono text-[0.66rem] text-muted">applies to every chart</div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={selectAllModels}
              className="rounded-full px-2 py-1 font-mono text-[0.68rem] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              all
            </button>
            <button
              type="button"
              onClick={clearModels}
              className="rounded-full px-2 py-1 font-mono text-[0.68rem] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              none
            </button>
          </div>
        </div>

        <div className="mt-2 grid max-h-[22rem] gap-1 overflow-y-auto pr-1">
          {selectedCount === 0 && (
            <div className="rounded-lg border border-dashed border-line px-3 py-4 text-center font-mono text-[0.7rem] text-muted">
              No models selected.
            </div>
          )}
          {models.map((model) => {
            const selected = isSelected(model.id);
            return (
              <label
                key={model.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  selected ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2/60 hover:text-ink"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleModel(model.id)}
                  className="h-4 w-4 accent-[var(--waterline)]"
                />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: hue(model.id) }} />
                <span className="min-w-0 flex-1 truncate">{model.short}</span>
                <span title={effortTitle(model.effort)} className="font-mono text-[0.66rem] text-muted">
                  {fmtEffort(model.effort)}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </details>
  );
}
