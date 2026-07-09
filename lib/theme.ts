"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
export type ThemeSetting = "system" | Theme;
const KEY = "sswe-theme";
const LIGHT_THEME_COLOR = "#eff1f2";
const DARK_THEME_COLOR = "#080d10";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readCookieSetting(): ThemeSetting {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(/(?:^|; )sswe-theme=(light|dark)(?:;|$)/);
  return match ? (match[1] as Theme) : "system";
}

function readSetting(): ThemeSetting {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(KEY);
  return value === "light" || value === "dark" ? value : readCookieSetting();
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
  document.body.style.backgroundColor = color;
  const metas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
  if (theme === "light") {
    metas.forEach((node) => node.remove());
    return;
  }
  if (!metas.length) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.setAttribute("data-sswe-theme-color", "");
    document.head.appendChild(meta);
    metas.push(meta);
  }
  metas.forEach((node) => {
    node.content = color;
    node.removeAttribute("media");
  });
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

function writeSetting(next: ThemeSetting) {
  try {
    if (next === "system") {
      window.localStorage.removeItem(KEY);
      document.cookie = `${KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
    } else {
      window.localStorage.setItem(KEY, next);
      document.cookie = `${KEY}=${next}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
    }
  } catch {}
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
    writeSetting(next);
    applyTheme(next);
    emit();
  };
  return { setting, resolvedTheme, setSetting };
}
