// Direct-label placement for the scatter charts. Labels anchor left or right
// of their dot, but stacking must be resolved globally: per-side stacking lets
// a left-anchored and a right-anchored label overprint whenever their dots sit
// close together (which is exactly what dense baskets produce).

export interface StackableLabel {
  py: number;
}

/**
 * Returns a labelY per item such that every pair of labels keeps at least
 * `gap` vertical separation while staying inside [top, bottom]. Order of the
 * returned array matches the input order.
 */
export function stackLabels<T extends StackableLabel>(
  items: T[],
  top: number,
  bottom: number,
  gap = 17,
): number[] {
  const order = items
    .map((item, index) => ({ py: item.py, index }))
    .sort((a, b) => a.py - b.py);
  const placed = new Array<number>(items.length);

  let previous = top - gap;
  for (const entry of order) {
    const y = Math.max(entry.py, previous + gap);
    placed[entry.index] = y;
    previous = y;
  }

  // If the stack ran past the bottom, push it back up without reintroducing
  // overlaps; clamp at the top when there is simply not enough room.
  const last = order.at(-1);
  if (last) {
    const overflow = placed[last.index] - bottom;
    if (overflow > 0) {
      let next = bottom;
      for (const entry of [...order].reverse()) {
        placed[entry.index] = Math.max(top, Math.min(placed[entry.index] - overflow, next));
        next = placed[entry.index] - gap;
      }
    }
  }
  return placed;
}
