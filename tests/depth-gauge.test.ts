import assert from "node:assert/strict";
import test from "node:test";

import { DEPTH_GAUGE_MODEL_IDS, selectDepthGaugeModels } from "../lib/depth-gauge.ts";

test("the default depth gauge selection is a curated set of ten models", () => {
  const knownModelIds = new Set([
    "fable-5-low",
    "sonnet-5-low",
    "sonnet-5-medium",
    "opus-4-8-low",
    "opus-4-8-medium",
    "gpt-5-5-low",
    "gpt-5-5-medium",
    "gpt-5-6-luna-low",
    "gpt-5-6-terra-low",
    "gpt-5-6-sol-low",
    "gemini-flash-medium",
    "glm-5-2-high",
    "kimi-k2-7-default",
    "grok-4-5-high",
  ]);

  assert.equal(DEPTH_GAUGE_MODEL_IDS.length, 10);
  assert.equal(new Set(DEPTH_GAUGE_MODEL_IDS).size, 10);
  assert.ok(DEPTH_GAUGE_MODEL_IDS.every((id) => knownModelIds.has(id)));
  assert.deepEqual(selectDepthGaugeModels([...DEPTH_GAUGE_MODEL_IDS, "terra", "fable"]), DEPTH_GAUGE_MODEL_IDS);
});

test("ten or fewer explicitly selected models are all preserved", () => {
  const selected = ["terra", "fable", "sonnet-medium"];
  assert.deepEqual(selectDepthGaugeModels(selected), selected);
});

test("a missing curated model is replaced when more than ten models are selected", () => {
  const selected = [...DEPTH_GAUGE_MODEL_IDS.filter((id) => id !== "opus-4-8-low"), "terra", "fable"];
  const result = selectDepthGaugeModels(selected);

  assert.equal(result.length, 10);
  assert.ok(result.includes("terra"));
  assert.ok(!result.includes("opus-4-8-low"));
});
