"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/methodology", label: "Methodology" },
  { href: "/paper", label: "Paper" },
  { href: "/pilot", label: "Pilot" },
  { href: "/data", label: "Data" },
];

export default function DocNavLinks() {
  const pathname = usePathname();
  return (
    <div className="ml-4 hidden items-center gap-1 md:flex">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              active ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
