import { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="h-px w-6 bg-waterline" />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-[2.4rem]">{title}</h2>
      {children && <div className="mt-4 text-[1.02rem] leading-relaxed text-ink-2">{children}</div>}
    </div>
  );
}

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}
