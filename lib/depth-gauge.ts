export const DEPTH_GAUGE_MODEL_IDS = [
  "gpt-5-6-luna-low",
  "glm-5-2-high",
  "kimi-k2-7-default",
  "grok-4-5-high",
  "sonnet-5-low",
  "opus-4-8-low",
  "gpt-5-5-low",
  "gpt-5-5-medium",
  "gpt-5-6-sol-low",
  "gemini-flash-medium",
] as const;

const DEPTH_GAUGE_LIMIT = DEPTH_GAUGE_MODEL_IDS.length;

export function selectDepthGaugeModels(selectedModelIds: string[]): string[] {
  if (selectedModelIds.length <= DEPTH_GAUGE_LIMIT) return selectedModelIds;

  const selected = new Set(selectedModelIds);
  const representative: string[] = DEPTH_GAUGE_MODEL_IDS.filter((id) => selected.has(id));

  for (const id of selectedModelIds) {
    if (representative.length === DEPTH_GAUGE_LIMIT) break;
    if (!representative.includes(id)) representative.push(id);
  }

  return representative;
}
