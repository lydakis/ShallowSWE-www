"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const KEY = "sswe-theme";

function resolve(): Theme {
  if (typeof document === "undefined") return "light";
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

/** Resolved current theme, reactive to toggles and OS changes. */
export function useResolvedTheme(): Theme {
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", cb);
    return () => {
      listeners.delete(cb);
      mq.removeEventListener("change", cb);
    };
  };
  return useSyncExternalStore(subscribe, resolve, () => "light");
}

/** Toggle control state. `mounted` guards against SSR mismatch on the icon. */
export function useThemeToggle() {
  const theme = useResolvedTheme();
  const toggle = () => {
    const next: Theme = resolve() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    emit();
  };
  return { theme, mounted: true, toggle };
}
