import assert from "node:assert/strict";
import test from "node:test";

import { priceTokenUsage } from "../lib/pricing.ts";

test("priceTokenUsage bills cache writes once at the cache-write rate", () => {
  const priced = priceTokenUsage(
    {
      inputTokens: 1_000,
      cacheReadTokens: 400,
      cacheWriteTokens: 200,
      outputTokens: 100,
    },
    {
      inputPer1M: 10,
      cachedInputPer1M: 1,
      cacheWritePer1M: 5,
      outputPer1M: 20,
    },
  );

  assert.deepEqual(priced.tokens, {
    freshInput: 400,
    cacheRead: 400,
    cacheWrite: 200,
    output: 100,
  });
  assert.deepEqual(priced.usd, {
    freshInput: 0.004,
    cacheRead: 0.0004,
    cacheWrite: 0.001,
    output: 0.002,
    total: 0.0074,
  });
});

test("priceTokenUsage falls back to the input rate when writes have no separate price", () => {
  const priced = priceTokenUsage(
    {
      inputTokens: 1_000,
      cacheReadTokens: 400,
      cacheWriteTokens: 200,
      outputTokens: 100,
    },
    {
      inputPer1M: 10,
      cachedInputPer1M: 1,
      cacheWritePer1M: null,
      outputPer1M: 20,
    },
  );

  assert.equal(priced.usd.cacheWrite, 0.002);
  assert.ok(Math.abs(priced.usd.total - 0.0084) < Number.EPSILON);
});
