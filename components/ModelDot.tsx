"use client";

import { useHue } from "@/lib/hues";

export default function ModelDot({ id, className = "" }: { id: string; className?: string }) {
  const hue = useHue();
  return (
    <span
      className={`mr-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full align-middle ${className}`}
      style={{ background: hue(id) }}
      aria-hidden
    />
  );
}
