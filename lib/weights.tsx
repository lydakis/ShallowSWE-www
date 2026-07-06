"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { BasketWeights, CategoryId, EQUAL_WEIGHTS, SizeId } from "@/app/data/model";

interface WeightsCtx {
  weights: BasketWeights;
  setWeights: (w: BasketWeights) => void;
}

const Ctx = createContext<WeightsCtx | null>(null);

/** Holds the basket mix once for the whole page so every ranking reacts to it. */
export function WeightsProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<BasketWeights>(EQUAL_WEIGHTS);
  return <Ctx.Provider value={{ weights, setWeights }}>{children}</Ctx.Provider>;
}

export function useWeights(): WeightsCtx {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  // Fallback keeps a component renderable in isolation (e.g. tests).
  return { weights: EQUAL_WEIGHTS, setWeights: () => {} };
}

// Slices, not preset blends: "which model wins on large tasks" is the
// question people ask, and per-axis filters compose (Code × Large). Custom
// mixes belong to the sliders.

export type CategorySlice = CategoryId | "all";
export type SizeSlice = SizeId | "all";

function axisMatches<T extends string>(x: Record<T, number>, y: Record<T, number>): boolean {
  return (Object.keys(x) as T[]).every((key) => x[key] === y[key]);
}

function sliceOf<T extends string>(axis: Record<T, number>, equal: Record<T, number>): T | "all" | null {
  if (axisMatches(axis, equal)) return "all";
  const ids = Object.keys(axis) as T[];
  const winner = ids.find((id) => axis[id] === 100);
  if (winner != null && ids.every((id) => id === winner || axis[id] === 0)) return winner;
  return null; // slider-custom mix
}

function axisFor<T extends string>(slice: T | "all", equal: Record<T, number>): Record<T, number> {
  if (slice === "all") return equal;
  return Object.fromEntries((Object.keys(equal) as T[]).map((id) => [id, id === slice ? 100 : 0])) as Record<T, number>;
}

export function categorySliceOf(w: BasketWeights): CategorySlice | null {
  return sliceOf(w.categories, EQUAL_WEIGHTS.categories);
}

export function sizeSliceOf(w: BasketWeights): SizeSlice | null {
  return sliceOf(w.sizes, EQUAL_WEIGHTS.sizes);
}

export function withCategorySlice(w: BasketWeights, slice: CategorySlice): BasketWeights {
  return { ...w, categories: axisFor(slice, EQUAL_WEIGHTS.categories) };
}

export function withSizeSlice(w: BasketWeights, slice: SizeSlice): BasketWeights {
  return { ...w, sizes: axisFor(slice, EQUAL_WEIGHTS.sizes) };
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function redistributeTernaryWeights<T extends string>(
  current: Record<T, number>,
  ids: readonly T[],
  changedId: T,
  changedValue: number,
): Record<T, number> {
  const next = { ...current };
  const target = clampPercent(changedValue);
  const others = ids.filter((id) => id !== changedId);
  const remaining = 100 - target;
  const otherTotal = others.reduce((sum, id) => sum + Math.max(0, current[id] ?? 0), 0);

  next[changedId] = target;
  if (!others.length) return next;

  if (otherTotal <= 0) {
    for (const id of others) next[id] = remaining / others.length;
    return next;
  }

  let assigned = target;
  for (const id of others.slice(0, -1)) {
    const value = remaining * (Math.max(0, current[id] ?? 0) / otherTotal);
    next[id] = value;
    assigned += value;
  }
  next[others[others.length - 1]] = Math.max(0, 100 - assigned);
  return next;
}
