"use client";

import { useEffect, useState } from "react";
import { categories, sizes } from "@/app/data/model";
import { redistributeTernaryWeights, useWeights } from "@/lib/weights";
import BasketSlices from "./BasketSlices";

/**
 * A floating basket control that appears once the real mixer has scrolled out
 * of view above, then disappears after the results and comparison sections.
 * Presets lead; sliders are the fine-tune layer, desktop only — on mobile the
 * inline mixer stays the precision tool.
 */
export default function StickyMixer() {
  const { weights, setWeights } = useWeights();
  const [shown, setShown] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [slidersOpen, setSlidersOpen] = useState(false);

  // Phones start from the compact chip: the expanded pill wraps to three rows
  // there and covers too much chart.
  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const frame = requestAnimationFrame(() => setCollapsed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const mixer = document.getElementById("basket-mixer");
    const foil = document.getElementById("foil");
    if (!mixer || !foil) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const controlsExpanded = document.getElementById("basket-mixer-controls") != null;
      const triggerOffset = controlsExpanded ? 8 : -40;
      const mixerAbove = mixer.getBoundingClientRect().bottom < triggerOffset;
      const deepsweStillRelevant = foil.getBoundingClientRect().bottom > 96;
      setShown(mixerAbove && deepsweStillRelevant);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const categoryTotal = categories.reduce((sum, c) => sum + weights.categories[c.id], 0) || 1;
  const sizeTotal = sizes.reduce((sum, size) => sum + weights.sizes[size.id], 0) || 1;
  const categoryIds = categories.map((c) => c.id);
  const sizeIds = sizes.map((size) => size.id);
  const summary = [
    ...categories.map((c) => Math.round((weights.categories[c.id] / categoryTotal) * 100)),
    "/",
    ...sizes.map((size) => Math.round((weights.sizes[size.id] / sizeTotal) * 100)),
  ]
    .join(" ")
    .replaceAll(" /", " /");

  return (
    <div
      className={`fixed inset-x-0 bottom-4 z-30 flex justify-center px-3 transition-all duration-300 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      aria-hidden={!shown}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-2 backdrop-blur transition-colors hover:border-line-strong"
          style={{ boxShadow: "var(--shadow)" }}
          aria-label="Show basket presets"
        >
          <span className="eyebrow text-[0.62rem]">basket</span>
          <span className="font-mono text-[0.68rem] tnum text-muted">{summary}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden className="text-muted">
            <path d="m6 14 6-6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div
          className={`flex max-w-full flex-col gap-2.5 rounded-3xl border border-line bg-surface/90 px-3 py-2.5 backdrop-blur sm:px-4 ${
            slidersOpen ? "" : "sm:rounded-full"
          }`}
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="eyebrow mr-0.5 text-[0.62rem]">basket</span>
            <BasketSlices />
            <a
              href="#basket-mixer"
              className="rounded-full px-2 py-1 font-mono text-[0.68rem] text-muted underline-offset-2 hover:underline sm:hidden"
            >
              fine-tune ↑
            </a>
            <button
              type="button"
              onClick={() => setSlidersOpen((open) => !open)}
              aria-pressed={slidersOpen}
              aria-label="Fine-tune with sliders"
              className={`hidden rounded-full border p-1.5 transition-colors sm:block ${
                slidersOpen ? "border-line-strong bg-surface-2 text-ink" : "border-line text-muted hover:text-ink"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 8h10m4 0h2M4 16h2m4 0h10M14 5.5v5M8 13.5v5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded-full p-1 text-muted transition-colors hover:text-ink"
              aria-label="Collapse basket controls"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="m6 10 6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {slidersOpen && (
            <div className="hidden items-center justify-center gap-4 pb-1 sm:flex">
              {categories.map((c) => (
                <label key={c.id} className="flex shrink-0 items-center gap-1.5 text-xs text-ink-2">
                  {c.label}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={weights.categories[c.id]}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        categories: redistributeTernaryWeights(weights.categories, categoryIds, c.id, Number(e.target.value)),
                      })
                    }
                    className="h-1 w-16 accent-[var(--waterline)]"
                    aria-label={`${c.label} category weight`}
                  />
                  <span className="w-8 shrink-0 text-right font-mono tnum text-muted">
                    {Math.round((weights.categories[c.id] / categoryTotal) * 100)}%
                  </span>
                </label>
              ))}
              <span className="h-5 w-px bg-line" aria-hidden />
              {sizes.map((size) => (
                <label key={size.id} className="flex shrink-0 items-center gap-1.5 text-xs text-ink-2">
                  {size.label}
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
                    className="h-1 w-16 accent-[var(--waterline)]"
                    aria-label={`${size.label} size weight`}
                  />
                  <span className="w-8 shrink-0 text-right font-mono tnum text-muted">
                    {Math.round((weights.sizes[size.id] / sizeTotal) * 100)}%
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
