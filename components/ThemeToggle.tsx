"use client";

import { useEffect, useRef, useState } from "react";
import { useThemePreference, type ThemeSetting } from "@/lib/theme";

const options: Array<{ value: ThemeSetting; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function ThemeIcon({ setting, className = "h-4 w-4" }: { setting: ThemeSetting; className?: string }) {
  if (setting === "light") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
        {[...Array(8)].map((_, index) => (
          <line
            key={index}
            x1="12"
            y1="2"
            x2="12"
            y2="4.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            transform={`rotate(${index * 45} 12 12)`}
          />
        ))}
      </svg>
    );
  }

  if (setting === "dark") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 14.2A8 8 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 20h6M12 16v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="m3.5 8.2 2.7 2.6 6.3-6.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { setting, setSetting } = useThemePreference();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
      >
        <ThemeIcon setting={setting} />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute right-0 top-11 z-50 min-w-36 rounded-lg border border-line bg-surface p-1.5 shadow-[var(--shadow)]"
        >
          {options.map((option) => {
            const selected = setting === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setSetting(option.value);
                  setOpen(false);
                }}
                className={[
                  "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left font-mono text-xs transition-colors",
                  selected ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                ].join(" ")}
              >
                <ThemeIcon setting={option.value} className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{option.label}</span>
                <span className={selected ? "text-brand" : "text-transparent"}>
                  <CheckIcon />
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
