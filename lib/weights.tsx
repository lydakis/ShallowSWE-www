"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { CategoryWeights, EQUAL_WEIGHTS } from "@/app/data/model";

interface WeightsCtx {
  weights: CategoryWeights;
  setWeights: (w: CategoryWeights) => void;
}

const Ctx = createContext<WeightsCtx | null>(null);

/** Holds the basket mix once for the whole page so every ranking reacts to it. */
export function WeightsProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<CategoryWeights>(EQUAL_WEIGHTS);
  return <Ctx.Provider value={{ weights, setWeights }}>{children}</Ctx.Provider>;
}

export function useWeights(): WeightsCtx {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  // Fallback keeps a component renderable in isolation (e.g. tests).
  return { weights: EQUAL_WEIGHTS, setWeights: () => {} };
}
