// Log-scale helpers for the depth charts. Cost/tokens span 2-3 orders of
// magnitude, so a log axis is the honest way to show them.

export function logScale(domainMin: number, domainMax: number, rangeMin: number, rangeMax: number) {
  const d0 = Math.log10(domainMin);
  const d1 = Math.log10(domainMax);
  const scale = (v: number) => {
    const t = (Math.log10(Math.max(v, domainMin)) - d0) / (d1 - d0);
    // Round to 3 decimals so server (Node) and client (browser) emit byte-identical
    // SVG coordinates — floating-point log differs in the last digit otherwise,
    // which trips React hydration.
    return Math.round((rangeMin + t * (rangeMax - rangeMin)) * 1000) / 1000;
  };
  return scale;
}

export function linScale(domainMin: number, domainMax: number, rangeMin: number, rangeMax: number) {
  const span = domainMax - domainMin || 1;
  return (v: number) =>
    Math.round((rangeMin + ((v - domainMin) / span) * (rangeMax - rangeMin)) * 1000) / 1000;
}

/** "Nice" decade + 1-2-5 ticks covering [min, max]. */
export function logTicks(min: number, max: number): number[] {
  const ticks: number[] = [];
  const start = Math.floor(Math.log10(min));
  const end = Math.ceil(Math.log10(max));
  for (let e = start; e <= end; e++) {
    for (const m of [1, 2, 5]) {
      const v = m * Math.pow(10, e);
      if (v >= min * 0.9 && v <= max * 1.1) ticks.push(v);
    }
  }
  return ticks;
}

function positiveFinite(values: number[]): number[] {
  return values.filter((value) => Number.isFinite(value) && value > 0);
}

function logFloor(value: number): number {
  const exponent = Math.floor(Math.log10(value));
  const base = Math.pow(10, exponent);
  const normalized = value / base;
  if (normalized >= 5) return 5 * base;
  if (normalized >= 2) return 2 * base;
  return base;
}

function logCeil(value: number): number {
  const exponent = Math.floor(Math.log10(value));
  const base = Math.pow(10, exponent);
  const normalized = value / base;
  if (normalized <= 1) return base;
  if (normalized <= 2) return 2 * base;
  if (normalized <= 5) return 5 * base;
  return 10 * base;
}

export function niceLogBounds(values: number[], fallback: [number, number] = [0.01, 1]): [number, number] {
  const finite = positiveFinite(values);
  if (!finite.length) return fallback;
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (min === max) {
    min /= 2;
    max *= 2;
  } else {
    min /= 1.35;
    max *= 1.35;
  }
  const lo = logFloor(min);
  const hi = logCeil(max);
  return [lo, hi];
}

export function paddedLinearBounds(
  values: number[],
  fallback: [number, number],
  { padding = 0.08, minSpan = 1 }: { padding?: number; minSpan?: number } = {},
): [number, number] {
  const finite = values.filter((value) => Number.isFinite(value));
  if (!finite.length) return fallback;
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (min === max) {
    min -= minSpan / 2;
    max += minSpan / 2;
  }
  const span = Math.max(max - min, minSpan);
  const mid = (min + max) / 2;
  const paddedSpan = span * (1 + padding * 2);
  return [mid - paddedSpan / 2, mid + paddedSpan / 2];
}
