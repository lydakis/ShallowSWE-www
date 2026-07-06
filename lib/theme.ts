"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
export type ThemeSetting = "system" | Theme;
const KEY = "sswe-theme";
const LIGHT_THEME_COLOR = "#eff1f2";
const DARK_THEME_COLOR = "#080d10";

function readSetting(): ThemeSetting {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(KEY);
  return value === "light" || value === "dark" ? value : "system";
}

function resolveSetting(setting: ThemeSetting): Theme {
  if (setting === "light" || setting === "dark") return setting;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function setThemeColor(theme: Theme) {
  const color = theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
  document.documentElement.style.backgroundColor = color;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((node) => {
    node.content = color;
    node.removeAttribute("media");
  });
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-sswe-theme-color]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.setAttribute("data-sswe-theme-color", "");
    document.head.appendChild(meta);
  }
  meta.content = color;
}

function applyTheme(setting: ThemeSetting) {
  const resolved = resolveSetting(setting);
  if (setting === "light" || setting === "dark") {
    document.documentElement.setAttribute("data-theme", setting);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  document.documentElement.setAttribute("data-theme-setting", setting);
  setThemeColor(resolved);
}

function getSnapshot() {
  const setting = readSetting();
  return `${setting}:${resolveSetting(setting)}`;
}

/** Resolved current theme, reactive to toggles and OS changes. */
export function useResolvedTheme(): Theme {
  return useThemePreference().resolvedTheme;
}

export function useThemePreference() {
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      if (readSetting() === "system") applyTheme("system");
      cb();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) {
        applyTheme(readSetting());
        cb();
      }
    };
    mq.addEventListener("change", onMediaChange);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      mq.removeEventListener("change", onMediaChange);
      window.removeEventListener("storage", onStorage);
    };
  };
  const [setting, resolvedTheme] = useSyncExternalStore(subscribe, getSnapshot, () => "system:light").split(
    ":",
  ) as [ThemeSetting, Theme];
  const setSetting = (next: ThemeSetting) => {
    try {
      if (next === "system") {
        window.localStorage.removeItem(KEY);
      } else {
        window.localStorage.setItem(KEY, next);
      }
    } catch {}
    applyTheme(next);
    emit();
  };
  return { setting, resolvedTheme, setSetting };
}
