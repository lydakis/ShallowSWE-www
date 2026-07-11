export interface TokenUsage {
  inputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
}

export interface TokenPrices {
  inputPer1M: number;
  cachedInputPer1M: number;
  cacheWritePer1M: number | null;
  outputPer1M: number;
}

export function priceTokenUsage(usage: TokenUsage, prices: TokenPrices) {
  const cacheRead = Math.max(0, usage.cacheReadTokens);
  const cacheWrite = Math.max(0, usage.cacheWriteTokens);
  const uncachedInput = Math.max(0, usage.inputTokens - cacheRead);
  const freshInput = Math.max(0, uncachedInput - cacheWrite);
  const output = Math.max(0, usage.outputTokens);
  const freshInputUsd = (freshInput * prices.inputPer1M) / 1e6;
  const cacheReadUsd = (cacheRead * prices.cachedInputPer1M) / 1e6;
  const cacheWriteUsd = (cacheWrite * (prices.cacheWritePer1M ?? prices.inputPer1M)) / 1e6;
  const outputUsd = (output * prices.outputPer1M) / 1e6;

  return {
    tokens: { freshInput, cacheRead, cacheWrite, output },
    usd: {
      freshInput: freshInputUsd,
      cacheRead: cacheReadUsd,
      cacheWrite: cacheWriteUsd,
      output: outputUsd,
      total: freshInputUsd + cacheReadUsd + cacheWriteUsd + outputUsd,
    },
  };
}
