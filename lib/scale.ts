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

export function niceLogBounds(values: number[]): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const lo = Math.pow(10, Math.floor(Math.log10(min) * 2) / 2);
  const hi = Math.pow(10, Math.ceil(Math.log10(max) * 2) / 2);
  return [lo, hi];
}
