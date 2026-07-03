export const FACET = { W: 344, H: 236, L: 46, R: 58, T: 16, B: 34 } as const;
export const PLOT = {
  left: FACET.L,
  right: FACET.W - FACET.R,
  top: FACET.T,
  bottom: FACET.H - FACET.B,
} as const;
export function pointX(i: number, count: number): number {
  if (count <= 1) return (PLOT.left + PLOT.right) / 2;
  return PLOT.left + (i / (count - 1)) * (PLOT.right - PLOT.left);
}
