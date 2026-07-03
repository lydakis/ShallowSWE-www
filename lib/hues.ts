"use client";

import { modelById } from "@/app/data/model";
import { useResolvedTheme } from "./theme";

/** Returns a fn mapping a modelId to its fixed hue for the current theme. */
export function useHue() {
  const theme = useResolvedTheme();
  return (modelId: string) => {
    const m = modelById[modelId];
    if (!m) return theme === "dark" ? "#56d2f7" : "#0968b4";
    return theme === "dark" ? m.hueDark : m.hueLight;
  };
}
