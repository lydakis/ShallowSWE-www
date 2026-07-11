"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

export default function DocToc({ items, variant }: { items: TocItem[]; variant: "mobile" | "desktop" }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      // Highlight the last heading above the reading line (30% down the viewport)
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  const list = (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} aria-current={activeId === item.id || undefined}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "mobile") {
    return (
      <details className="mb-8 rounded-xl border border-line bg-surface px-4 py-3 lg:hidden">
        <summary className="eyebrow list-none [&::-webkit-details-marker]:hidden">
          Contents <span aria-hidden>↓</span>
        </summary>
        <nav aria-label="Contents" className="depth-rail mt-3">
          {list}
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="Contents" className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="eyebrow mb-3">Contents</div>
      <div className="depth-rail">{list}</div>
    </nav>
  );
}
