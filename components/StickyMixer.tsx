"use client";

import { useEffect, useState } from "react";
import { categories } from "@/app/data/model";
import { useWeights } from "@/lib/weights";

const shortLabel: Record<string, string> = { fix: "Fix", operate: "Op", transform: "Tr" };

/**
 * A slim floating basket control that appears once the real mixer has scrolled
 * out of view above, so the whole page can be repriced while reading any chart.
 */
export default function StickyMixer() {
  const { weights, setWeights } = useWeights();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = document.getElementById("basket-mixer");
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      // show once the real mixer has fully scrolled above the viewport
      setShown(el.getBoundingClientRect().bottom < 8);
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

  const total = categories.reduce((sum, c) => sum + weights[c.id], 0) || 1;

  return (
    <div
      className={`fixed inset-x-0 bottom-4 z-30 flex justify-center px-3 transition-all duration-300 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      aria-hidden={!shown}
    >
      <div
        className="flex max-w-full items-center gap-2.5 rounded-full border border-line bg-surface/90 px-3 py-2 backdrop-blur sm:gap-4 sm:px-4"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <span className="eyebrow hidden shrink-0 text-[0.62rem] sm:inline">basket</span>
        {categories.map((c) => (
          <label key={c.id} className="flex shrink-0 items-center gap-1.5 text-xs text-ink-2">
            <span className="hidden sm:inline">{c.label}</span>
            <span className="sm:hidden">{shortLabel[c.id]}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights[c.id]}
              onChange={(e) => setWeights({ ...weights, [c.id]: Number(e.target.value) })}
              className="h-1 w-12 accent-[var(--waterline)] sm:w-16"
              aria-label={`${c.label} weight`}
            />
            <span className="w-8 shrink-0 text-right font-mono tnum text-muted">
              {Math.round((weights[c.id] / total) * 100)}%
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
