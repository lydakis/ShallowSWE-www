import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#chart", label: "Leaderboard" },
  { href: "#foil", label: "Deep vs shallow" },
  { href: "#suite", label: "Suite" },
  { href: "#method", label: "Method" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-plane/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="#top" className="flex items-center gap-2.5 text-ink">
          <Logo className="h-7 w-7 text-ink" />
          <span className="font-display text-[1.05rem]">ShallowSWE</span>
        </Link>
        <div className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/data/rollouts.json"
            className="hidden rounded-full border border-line px-3 py-1.5 font-mono text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink sm:inline-block"
          >
            rows.json
          </a>
          <a
            href="https://github.com/lydakis/ShallowSWE"
            className="hidden rounded-full border border-line px-3 py-1.5 font-mono text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink sm:inline-block"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
