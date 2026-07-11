import { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DocToc, { TocItem } from "./DocToc";
import Provenance from "./Provenance";

export type StatusChip = { label: string; tone?: "neutral" | "warn" | "brand" };

const chipTones: Record<NonNullable<StatusChip["tone"]>, string> = {
  neutral: "border-line text-ink-2",
  warn: "border-warn/50 text-warn",
  brand: "border-brand/50 text-brand",
};

export function StatusChips({ chips }: { chips: StatusChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] uppercase ${chipTones[chip.tone ?? "neutral"]}`}
        >
          {chip.tone === "warn" && <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden />}
          {chip.label}
        </span>
      ))}
    </div>
  );
}

export default function DocPage({
  eyebrow,
  title,
  chips,
  lede,
  toc,
  provenanceDoc,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  chips?: StatusChip[];
  lede?: ReactNode;
  toc: TocItem[];
  provenanceDoc?: "paper" | "pilot_protocol";
  children: ReactNode;
}) {
  return (
    <>
      <Nav sectionLinks={false} />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
        <header className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-px w-6 bg-waterline" />
            <span className="eyebrow">{eyebrow}</span>
          </div>
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-[2.6rem]">{title}</h1>
          {chips && chips.length > 0 && (
            <div className="mt-4">
              <StatusChips chips={chips} />
            </div>
          )}
          {lede && <div className="mt-5 text-[1.05rem] leading-relaxed text-ink-2">{lede}</div>}
        </header>

        <div className="waterline my-10" aria-hidden />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="min-w-0 max-w-[44rem]">
            <DocToc items={toc} variant="mobile" />
            {children}
            <Provenance doc={provenanceDoc} />
          </div>
          <div className="hidden lg:block">
            <DocToc items={toc} variant="desktop" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
