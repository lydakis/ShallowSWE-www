import aggregateByModelJson from "@/public/data/aggregate-by-model.json";
import aggregateByTaskModelJson from "@/public/data/aggregate-by-task-model.json";
import priceSheetJson from "@/public/data/prices-openrouter-2026-07-18-site-plus-inkling-preview.json";
import runManifestJson from "@/public/data/run-manifest.json";
import deepsweComparisonJson from "@/public/data/deepswe-comparison.json";
import rolloutsJson from "@/public/data/rollouts.json";
import { priceTokenUsage } from "@/lib/pricing";

export type SizeClass = "small" | "mid" | "large";
export type CategoryId = "artifact" | "code" | "workflow";
export type SizeId = "small" | "medium" | "large";
export type TierId = SizeId;
export type Metric = "cpsc" | "tps";

interface AggregateRow {
  model_config: string;
  task_id?: string;
  total_trials: number;
  repair_loops?: number;
  excluded_repair_loops?: number;
  successes?: number;
  solve_rate?: number;
  cap_hits?: number;
  cap_hit_rate?: number;
  mean_tokens_per_repair_loop?: number;
  tokens_per_success: number | null;
  mean_input_tokens_per_repair_loop?: number;
  mean_output_tokens_per_repair_loop?: number;
  mean_cache_read_tokens_per_repair_loop?: number;
  mean_cache_write_tokens_per_repair_loop?: number;
  mean_reasoning_tokens_per_repair_loop?: number;
  mean_turns_per_repair_loop?: number;
  p95_turns_per_repair_loop?: number;
  mean_agent_steps_per_repair_loop?: number | null;
  p95_agent_steps_per_repair_loop?: number | null;
  mean_verifier_submissions_per_repair_loop?: number;
  mean_verifier_submissions_to_success?: number | null;
  total_model_spend_usd?: number;
  mean_cost_per_repair_loop?: number;
  p95_cost_per_repair_loop?: number;
  cpsc: number | null;
  stop_reasons?: Record<string, number>;
  mean_gateway_reported_cost_per_repair_loop?: number | null;

  attempts?: number;
  excluded_attempts?: number;
  passes?: number;
  pass_rate?: number;
  mean_tokens_per_attempt?: number;
  mean_input_tokens_per_attempt?: number;
  mean_output_tokens_per_attempt?: number;
  mean_cache_read_tokens_per_attempt?: number;
  mean_cache_write_tokens_per_attempt?: number;
  mean_reasoning_tokens_per_attempt?: number;
  mean_turns?: number;
  mean_cost_per_attempt?: number | null;
  mean_gateway_reported_cost_per_attempt?: number | null;
}

interface PriceSheetModel {
  provider: string;
  input_per_1m: number;
  cached_input_per_1m: number;
  output_per_1m: number;
  cache_write_per_1m: number | null;
}

interface RolloutRow {
  model: string;
  task_id: string;
  status?: string;
  passed?: boolean;
  verifier_submissions?: number | null;
  reasoning_effort?: string | null;
}

interface PriceSheet {
  effective_date: string;
  gateway: string;
  models: Record<string, PriceSheetModel>;
}

interface RunManifest {
  name: string;
  generated_at: string;
  tasks: string[];
  repair_loop_seeds_per_task_model_config?: number | string;
  rollouts_per_task_model_config?: number | string;
  repair_loop_policy?: string;
  rollout_policy?: string;
}

export interface ModelPrice {
  inputPer1M: number;
  cachedInputPer1M: number;
  outputPer1M: number;
  cacheWritePer1M: number | null;
}

export interface ModelDef {
  id: string;
  modelConfig: string;
  label: string;
  short: string;
  familyShort: string;
  vendor: string;
  size: SizeClass;
  priceKey: string;
  effort: string | null;
  hueLight: string;
  hueDark: string;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  gloss: string;
  detail: string;
}

export interface SizeDef {
  id: SizeId;
  label: string;
  gloss: string;
}

export type TierDef = SizeDef;

export interface TaskDef {
  id: string;
  label: string;
  category: CategoryId;
  size: SizeId;
  tier: TierId;
  shape: string;
}

export interface Cell {
  modelId: string;
  modelConfig: string;
  taskId: string;
  category: CategoryId;
  size: SizeId;
  tier: TierId;
  totalTrials: number;
  repairLoops: number;
  excludedRepairLoops: number;
  attempts: number;
  successes: number;
  passes: number;
  scoredCoverageRate: number;
  solveRate: number;
  passRate: number;
  tokensPerRepairLoop: number;
  tokensPerAttempt: number;
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  reasoningTokens: number;
  turns: number;
  p95Turns: number;
  costPerRepairLoop: number;
  p95CostPerRepairLoop: number;
  costPerAttempt: number;
  cpsc: number | null;
  tokensPerSuccess: number | null;
  meanVerifierSubmissions: number;
  firstCheckPassRate: number;
  verifierSubmissionsToSuccess: number | null;
  stopReasons: Record<string, number>;
  capHitRate: number;
  capHits: number;
  totalSpend: number;
}

export interface Aggregate {
  modelId: string;
  modelConfig: string;
  cpsc: number | null;
  tokensPerSuccess: number | null;
  solveRate: number;
  passRate: number;
  scoredCoverageRate: number;
  excludedRepairLoops: number;
  totalTrials: number;
  turns: number;
  p95Turns: number;
  repairLoops: number;
  attempts: number;
  successes: number;
  passes: number;
  meanVerifierSubmissions: number;
  firstCheckPassRate: number;
  capHitRate: number;
  totalSpend: number;
  costPerRepairLoop: number;
  p95CostPerRepairLoop: number;
  tokensPerRepairLoop: number;
}

export type CategoryWeights = Record<CategoryId, number>;
export type SizeWeights = Record<SizeId, number>;
export interface BasketWeights {
  categories: CategoryWeights;
  sizes: SizeWeights;
}

const aggregateByModel = aggregateByModelJson as unknown as AggregateRow[];
const aggregateByTaskModel = aggregateByTaskModelJson as unknown as AggregateRow[];
const rollouts = rolloutsJson as RolloutRow[];
const priceSheet = priceSheetJson as PriceSheet;
const runManifest = runManifestJson as RunManifest;

interface DeepsweComparisonRow {
  model_config: string;
  model: string;
  reasoning_effort: string | null;
  deepswe_config: string;
  deepswe_model: string;
  deepswe_reasoning_effort: string | null;
  deepswe_pass_rate: number;
  deepswe_mean_cost_usd: number;
  deepswe_cpsc: number;
}

interface DeepsweComparison {
  deepswe_source: string;
  deepswe_generated_at: string;
  rows: DeepsweComparisonRow[];
}

const deepsweComparison = deepsweComparisonJson as DeepsweComparison;

export const PRICE_SHEET_DATE = priceSheet.effective_date;
export const PRICE_GATEWAY = priceSheet.gateway;
export const PILOT_NAME = runManifest.name;
export const PILOT_GENERATED_AT = runManifest.generated_at;
export const ROLLOUTS =
  runManifest.repair_loop_seeds_per_task_model_config ??
  runManifest.rollouts_per_task_model_config ??
  "mixed";
export const ROLLOUT_POLICY =
  runManifest.repair_loop_policy ??
  runManifest.rollout_policy ??
  `${ROLLOUTS} bounded repair-loop seeds per task/model_config`;

// Actual scored seed coverage, derived from the shipped rows rather than the
// manifest's plan — the two disagree while the preview is still filling in.
const scoredSeedCounts = (() => {
  const counts = new Map<string, number>();
  for (const row of rolloutsJson as RolloutRow[]) {
    if (!row.model || !row.task_id || row.status === "excluded") continue;
    const key = `${row.task_id}\0${row.model}\0${row.reasoning_effort ?? ""}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.values()];
})();
export const SEED_COVERAGE = scoredSeedCounts.length
  ? (() => {
      const lo = Math.min(...scoredSeedCounts);
      const hi = Math.max(...scoredSeedCounts);
      return lo === hi ? `${lo}` : `${lo}–${hi}`;
    })()
  : "0";
export const SEED_PLAN = ROLLOUTS;
export const SNAPSHOT_STATUS = "Repair-loop preview";
export const DEEPSWE_COMPARISON_GENERATED_AT = deepsweComparison.deepswe_generated_at;

export const prices: Record<string, ModelPrice> = Object.fromEntries(
  Object.entries(priceSheet.models).map(([key, value]) => [
    key,
    {
      inputPer1M: value.input_per_1m,
      cachedInputPer1M: value.cached_input_per_1m,
      outputPer1M: value.output_per_1m,
      cacheWritePer1M: value.cache_write_per_1m,
    },
  ]),
);

export const models: ModelDef[] = [
  {
    id: "fable-5-low",
    modelConfig: "openrouter/anthropic/claude-fable-5[low]",
    label: "Claude Fable 5",
    short: "Fable 5 low",
    familyShort: "Fable",
    vendor: "Anthropic",
    size: "large",
    priceKey: "anthropic/claude-fable-5",
    effort: "low",
    hueLight: "#6b57d2",
    hueDark: "#8b78ff",
  },
  {
    id: "sonnet-5-low",
    modelConfig: "openrouter/anthropic/claude-sonnet-5[low]",
    label: "Claude Sonnet 5",
    short: "Sonnet 5 low",
    familyShort: "Sonnet",
    vendor: "Anthropic",
    size: "mid",
    priceKey: "anthropic/claude-sonnet-5",
    effort: "low",
    hueLight: "#2a78d6",
    hueDark: "#3987e5",
  },
  {
    id: "sonnet-5-medium",
    modelConfig: "openrouter/anthropic/claude-sonnet-5[medium]",
    label: "Claude Sonnet 5",
    short: "Sonnet 5 med",
    familyShort: "Sonnet",
    vendor: "Anthropic",
    size: "mid",
    priceKey: "anthropic/claude-sonnet-5",
    effort: "medium",
    hueLight: "#2a78d6",
    hueDark: "#3987e5",
  },
  {
    id: "opus-4-8-low",
    modelConfig: "openrouter/anthropic/claude-opus-4.8[low]",
    label: "Claude Opus 4.8",
    short: "Opus 4.8 low",
    familyShort: "Opus",
    vendor: "Anthropic",
    size: "large",
    priceKey: "anthropic/claude-opus-4.8",
    effort: "low",
    hueLight: "#e34948",
    hueDark: "#e66767",
  },
  {
    id: "opus-4-8-medium",
    modelConfig: "openrouter/anthropic/claude-opus-4.8[medium]",
    label: "Claude Opus 4.8",
    short: "Opus 4.8 med",
    familyShort: "Opus",
    vendor: "Anthropic",
    size: "large",
    priceKey: "anthropic/claude-opus-4.8",
    effort: "medium",
    hueLight: "#e34948",
    hueDark: "#e66767",
  },
  {
    id: "gpt-5-5-low",
    modelConfig: "openrouter/openai/gpt-5.5[low]",
    label: "GPT-5.5",
    short: "GPT-5.5 low",
    familyShort: "GPT-5.5",
    vendor: "OpenAI",
    size: "large",
    priceKey: "openai/gpt-5.5",
    effort: "low",
    hueLight: "#eb6834",
    hueDark: "#d95926",
  },
  {
    id: "gpt-5-5-medium",
    modelConfig: "openrouter/openai/gpt-5.5[medium]",
    label: "GPT-5.5",
    short: "GPT-5.5 med",
    familyShort: "GPT-5.5",
    vendor: "OpenAI",
    size: "large",
    priceKey: "openai/gpt-5.5",
    effort: "medium",
    hueLight: "#eb6834",
    hueDark: "#d95926",
  },
  {
    id: "gpt-5-6-luna-low",
    modelConfig: "openrouter/openai/gpt-5.6-luna[low]",
    label: "GPT-5.6 Luna",
    short: "GPT-5.6 Luna low",
    familyShort: "GPT-5.6",
    vendor: "OpenAI",
    size: "small",
    priceKey: "openai/gpt-5.6-luna",
    effort: "low",
    hueLight: "#149d80",
    hueDark: "#34c2a5",
  },
  {
    id: "gpt-5-6-terra-low",
    modelConfig: "openrouter/openai/gpt-5.6-terra[low]",
    label: "GPT-5.6 Terra",
    short: "GPT-5.6 Terra low",
    familyShort: "GPT-5.6",
    vendor: "OpenAI",
    size: "mid",
    priceKey: "openai/gpt-5.6-terra",
    effort: "low",
    hueLight: "#b27a00",
    hueDark: "#d99a17",
  },
  {
    id: "gpt-5-6-sol-low",
    modelConfig: "openrouter/openai/gpt-5.6-sol[low]",
    label: "GPT-5.6 Sol",
    short: "GPT-5.6 Sol low",
    familyShort: "GPT-5.6",
    vendor: "OpenAI",
    size: "large",
    priceKey: "openai/gpt-5.6-sol",
    effort: "low",
    hueLight: "#c34232",
    hueDark: "#e05d4c",
  },
  {
    id: "gemini-flash-medium",
    modelConfig: "openrouter/google/gemini-3.5-flash[medium]",
    label: "Gemini 3.5 Flash",
    short: "Gemini 3.5 Flash med",
    familyShort: "Gemini",
    vendor: "Google",
    size: "small",
    priceKey: "google/gemini-3.5-flash",
    effort: "medium",
    hueLight: "#eda100",
    hueDark: "#c98500",
  },
  {
    id: "glm-5-2-high",
    modelConfig: "openrouter/z-ai/glm-5.2[high]",
    label: "GLM 5.2",
    short: "GLM 5.2 high",
    familyShort: "GLM",
    vendor: "Z.ai",
    size: "mid",
    priceKey: "z-ai/glm-5.2",
    effort: "high",
    hueLight: "#687f1f",
    hueDark: "#9db742",
  },
  {
    id: "kimi-k2-7-default",
    modelConfig: "openrouter/moonshotai/kimi-k2.7-code",
    label: "Kimi K2.7 Code",
    short: "Kimi K2.7 Code",
    familyShort: "Kimi K2.7 Code",
    vendor: "Moonshot",
    size: "small",
    priceKey: "moonshotai/kimi-k2.7-code",
    effort: null,
    hueLight: "#008300",
    hueDark: "#2e9e6b",
  },
  {
    id: "kimi-k3-max",
    modelConfig: "openrouter/moonshotai/kimi-k3[max]",
    label: "Kimi K3",
    short: "Kimi K3 max",
    familyShort: "Kimi K3",
    vendor: "Moonshot",
    size: "large",
    priceKey: "moonshotai/kimi-k3",
    effort: "max",
    hueLight: "#7047c8",
    hueDark: "#a98bea",
  },
  {
    id: "grok-4-5-high",
    modelConfig: "openrouter/x-ai/grok-4.5[high]",
    label: "Grok 4.5",
    short: "Grok 4.5 high",
    familyShort: "Grok",
    vendor: "xAI",
    size: "large",
    priceKey: "x-ai/grok-4.5",
    effort: "high",
    hueLight: "#0f9b8e",
    hueDark: "#20c7b7",
  },
  {
    id: "inkling-high",
    modelConfig: "openrouter/thinkingmachines/inkling[high]",
    label: "Inkling",
    short: "Inkling high",
    familyShort: "Inkling",
    vendor: "Thinking Machines",
    size: "mid",
    priceKey: "thinkingmachines/inkling",
    effort: "high",
    hueLight: "#5367d8",
    hueDark: "#8796ff",
  },
];

export const panelModels = models;
export const modelById = Object.fromEntries(models.map((m) => [m.id, m]));
export const modelByConfig = Object.fromEntries(models.map((m) => [m.modelConfig, m]));

export const categories: CategoryDef[] = [
  {
    id: "artifact",
    label: "Artifact",
    gloss: "Produce checked files",
    detail: "Transform logs, CSVs, env files, and support data into required artifacts.",
  },
  {
    id: "code",
    label: "Code",
    gloss: "Repair code paths",
    detail: "Fix regressions, add coverage, split logic, and preserve user-facing behavior.",
  },
  {
    id: "workflow",
    label: "Workflow",
    gloss: "Operate repo state",
    detail: "Apply status updates, reconcile tickets, merge config branches, and preserve state.",
  },
];

export const sizes: SizeDef[] = [
  { id: "small", label: "Small", gloss: "Narrow, localized task" },
  { id: "medium", label: "Medium", gloss: "Several files or states" },
  { id: "large", label: "Large", gloss: "Broader context and validation" },
];

export const tiers = sizes;

export const tasks: TaskDef[] = [
  task("env-flags-to-json", "Env flags to JSON", "artifact", "small", "file-transform"),
  task("extract-error-fields", "Extract error fields", "artifact", "small", "json-extraction"),
  task("payout-reconcile", "Payout reconciliation", "artifact", "medium", "multi-source-reconcile"),
  task("access-log-to-incidents", "Access log incidents", "artifact", "medium", "log-to-report"),
  task("billing-revenue-rollup", "Billing revenue rollup", "artifact", "large", "rollup-package"),
  task("support-sla-business-hours", "Support SLA business hours", "artifact", "large", "sla-recompute"),
  task("invoice-cli-regression-test-fix", "Invoice duplicate regression", "code", "small", "test-plus-fix"),
  task("retry-error-fallback", "Retry error fallback", "code", "small", "bug-fix"),
  task("auth-token-expiry-regression", "Auth token expiry regression", "code", "medium", "regression-repair"),
  task("split-notification-renderer", "Split notification renderer", "code", "medium", "feature-refactor"),
  task("cache-invalidates-on-settings-change", "Settings cache invalidation", "code", "large", "cross-file-bug"),
  task("invoice-multi-source-merge", "Invoice multi-source merge", "code", "large", "merge-importer"),
  task("post-build-status", "Post build status", "workflow", "small", "state-update"),
  task("ticket-cut-from-bug-report", "Ticket from bug report", "workflow", "small", "ticket-creation"),
  task("config-flag-ignored", "Ignored config flag", "workflow", "medium", "config-tracing"),
  task("ticket-update-dont-duplicate", "Ticket update without duplicate", "workflow", "medium", "api-state-update"),
  task("merge-divergent-config-branches", "Merge config branches", "workflow", "large", "git-state-merge"),
  task("config-key-rollover", "Config key rollover", "workflow", "large", "cross-cutting-rename"),
];

export const taskById = Object.fromEntries(tasks.map((task) => [task.id, task]));
export const EQUAL_WEIGHTS: BasketWeights = {
  categories: { artifact: 34, code: 33, workflow: 33 },
  sizes: { small: 34, medium: 33, large: 33 },
};
export const SUITE_TASKS = tasks.length;
export const PANEL_SIZE = models.length;
export const PILOT_TRIALS = aggregateByModel.reduce((sum, row) => sum + rowRepairLoops(row), 0);

const tasksByCategorySize = tasks.reduce<Record<string, TaskDef[]>>((acc, item) => {
  const key = cellKey(item.category, item.size);
  acc[key] = [...(acc[key] ?? []), item];
  return acc;
}, {});

const firstCheckPassByTaskModel = rollouts.reduce<
  Record<string, { scored: number; firstCheckPasses: number }>
>((acc, row) => {
  const config = rolloutModelConfig(row);
  if (!config || !row.task_id || row.status === "excluded") return acc;
  const key = taskModelKey(row.task_id, config);
  const bucket = acc[key] ?? { scored: 0, firstCheckPasses: 0 };
  bucket.scored += 1;
  if (row.passed && row.verifier_submissions === 1) bucket.firstCheckPasses += 1;
  acc[key] = bucket;
  return acc;
}, {});

export const measuredCells: Cell[] = aggregateByTaskModel.map((row) => {
  const model = modelByConfig[row.model_config];
  const item = taskById[row.task_id!];
  if (!model) throw new Error(`Unknown model_config ${row.model_config}`);
  if (!item) throw new Error(`Unknown task_id ${row.task_id}`);
  return rowToCell(row, model, item);
});

export const pilotModelRows: (Aggregate & {
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  reasoningTokens: number;
})[] = aggregateByModel.map((row) => {
  const model = modelByConfig[row.model_config];
  if (!model) throw new Error(`Unknown model_config ${row.model_config}`);
  const repairLoops = rowRepairLoops(row);
  const successes = rowSuccesses(row);
  return {
    modelId: model.id,
    modelConfig: row.model_config,
    repairLoops,
    attempts: repairLoops,
    scoredCoverageRate:
      (row.total_trials ?? repairLoops) > 0
        ? repairLoops / (row.total_trials ?? repairLoops)
        : 0,
    excludedRepairLoops: row.excluded_repair_loops ?? row.excluded_attempts ?? 0,
    totalTrials: row.total_trials ?? repairLoops,
    successes,
    passes: successes,
    solveRate: rowSolveRate(row),
    passRate: rowSolveRate(row),
    costPerRepairLoop: rowCostPerLoop(row),
    p95CostPerRepairLoop: rowP95CostPerLoop(row),
    tokensPerRepairLoop: rowTokensPerLoop(row),
    cpsc: row.cpsc,
    tokensPerSuccess: row.tokens_per_success,
    turns: rowTurns(row),
    p95Turns: rowP95Turns(row),
    meanVerifierSubmissions: row.mean_verifier_submissions_per_repair_loop ?? 0,
    firstCheckPassRate:
      repairLoops > 0 && (row.mean_verifier_submissions_per_repair_loop ?? 0) <= 1 && rowSolveRate(row) === 1
        ? 1
        : 0,
    capHitRate: row.cap_hit_rate ?? 0,
    totalSpend: row.total_model_spend_usd ?? rowCostPerLoop(row) * repairLoops,
    inputTokens: row.mean_input_tokens_per_repair_loop ?? row.mean_input_tokens_per_attempt ?? 0,
    outputTokens: row.mean_output_tokens_per_repair_loop ?? row.mean_output_tokens_per_attempt ?? 0,
    cacheRead: row.mean_cache_read_tokens_per_repair_loop ?? row.mean_cache_read_tokens_per_attempt ?? 0,
    reasoningTokens: row.mean_reasoning_tokens_per_repair_loop ?? row.mean_reasoning_tokens_per_attempt ?? 0,
  };
});

export function cellsFor(category: CategoryId, modelId: string): Cell[] {
  return measuredCells
    .filter((cell) => cell.category === category && cell.modelId === modelId)
    .sort((a, b) => tasks.findIndex((item) => item.id === a.taskId) - tasks.findIndex((item) => item.id === b.taskId));
}

export function taskLabelsFor(category: CategoryId): string[] {
  return tasks
    .filter((item) => item.category === category)
    .map((item) => `${sizeById[item.size].label[0]} · ${item.label}`);
}

export function taskIdsFor(category: CategoryId): string[] {
  return tasks.filter((item) => item.category === category).map((item) => item.id);
}

export function metricValue(cell: Cell, metric: Metric): number | null {
  return metric === "cpsc" ? cell.cpsc : cell.tokensPerSuccess;
}

export function measuredValues(metric: Metric, modelIds?: ReadonlySet<string>): number[] {
  return measuredCells
    .filter((cell) => modelIds == null || modelIds.has(cell.modelId))
    .map((cell) => metricValue(cell, metric))
    .filter((value): value is number => value != null && value > 0);
}

export function weightedAggregates(weights: BasketWeights): Aggregate[] {
  return models.map((model) => {
    let spendNumerator = 0;
    let tokenNumerator = 0;
    let solveNumerator = 0;
    let coverageNumerator = 0;
    let turnsNumerator = 0;
    let p95TurnsNumerator = 0;
    let verifierNumerator = 0;
    let firstCheckNumerator = 0;
    let capNumerator = 0;
    let observedWeight = 0;
    let measuredWeight = 0;
    let repairLoops = 0;
    let excludedRepairLoops = 0;
    let totalTrials = 0;
    let successes = 0;
    let totalSpend = 0;
    let p95CostNumerator = 0;

    for (const item of tasks) {
      const cell = measuredCells.find((candidate) => candidate.modelId === model.id && candidate.taskId === item.id);
      if (!cell) continue;
      const weight = taskWeight(item, weights);
      if (weight <= 0) continue;
      measuredWeight += weight;
      coverageNumerator += weight * cell.scoredCoverageRate;
      excludedRepairLoops += cell.excludedRepairLoops;
      totalTrials += cell.totalTrials;
      if (cell.repairLoops <= 0) continue;
      spendNumerator += weight * cell.costPerRepairLoop;
      tokenNumerator += weight * cell.tokensPerRepairLoop;
      solveNumerator += weight * cell.solveRate;
      turnsNumerator += weight * cell.turns;
      p95TurnsNumerator += weight * cell.p95Turns;
      verifierNumerator += weight * cell.meanVerifierSubmissions;
      firstCheckNumerator += weight * cell.firstCheckPassRate;
      capNumerator += weight * cell.capHitRate;
      observedWeight += weight;
      repairLoops += cell.repairLoops;
      successes += cell.successes;
      totalSpend += cell.totalSpend;
      p95CostNumerator += weight * cell.p95CostPerRepairLoop;
    }

    const solveRate = observedWeight > 0 ? solveNumerator / observedWeight : 0;
    return {
      modelId: model.id,
      modelConfig: model.modelConfig,
      cpsc: solveNumerator > 0 ? spendNumerator / solveNumerator : null,
      tokensPerSuccess: solveNumerator > 0 ? tokenNumerator / solveNumerator : null,
      solveRate,
      passRate: solveRate,
      scoredCoverageRate: measuredWeight > 0 ? coverageNumerator / measuredWeight : 0,
      excludedRepairLoops,
      totalTrials,
      turns: observedWeight > 0 ? turnsNumerator / observedWeight : 0,
      p95Turns: observedWeight > 0 ? p95TurnsNumerator / observedWeight : 0,
      repairLoops,
      attempts: repairLoops,
      successes,
      passes: successes,
      meanVerifierSubmissions: observedWeight > 0 ? verifierNumerator / observedWeight : 0,
      firstCheckPassRate: observedWeight > 0 ? firstCheckNumerator / observedWeight : 0,
      capHitRate: observedWeight > 0 ? capNumerator / observedWeight : 0,
      totalSpend,
      costPerRepairLoop: observedWeight > 0 ? spendNumerator / observedWeight : 0,
      p95CostPerRepairLoop: observedWeight > 0 ? p95CostNumerator / observedWeight : 0,
      tokensPerRepairLoop: observedWeight > 0 ? tokenNumerator / observedWeight : 0,
    };
  });
}

export function suiteAggregates(): Aggregate[] {
  return weightedAggregates(EQUAL_WEIGHTS);
}

export interface CostAnatomyRow {
  modelId: string;
  /** Mean $ per scored repair loop spent on uncached prompt tokens. */
  freshInputUsd: number;
  /** Mean $ per scored repair loop spent on cache-read tokens. */
  cacheReadUsd: number;
  /** Mean $ per scored repair loop spent on cache-write tokens. */
  cacheWriteUsd: number;
  /** Mean $ per scored repair loop spent on output (incl. reasoning) tokens. */
  outputUsd: number;
  totalUsd: number;
  freshInputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
}

/**
 * Decomposes each model's basket-weighted mean loop cost into price-sheet
 * components. Reported input token means include cache reads and writes, so
 * those subsets must be removed before billing fresh input. The sum reconciles
 * with mean loop cost.
 */
export function weightedCostAnatomy(weights: BasketWeights): CostAnatomyRow[] {
  return models
    .map((model) => {
      const price = prices[model.priceKey];
      let fresh$ = 0;
      let cache$ = 0;
      let write$ = 0;
      let out$ = 0;
      let freshTok = 0;
      let cacheTok = 0;
      let writeTok = 0;
      let outTok = 0;
      let observedWeight = 0;
      for (const item of tasks) {
        const cell = measuredCells.find((c) => c.modelId === model.id && c.taskId === item.id);
        if (!cell || cell.repairLoops <= 0) continue;
        const weight = taskWeight(item, weights);
        if (weight <= 0) continue;
        const priced = priceTokenUsage(
          {
            inputTokens: cell.inputTokens,
            cacheReadTokens: cell.cacheRead,
            cacheWriteTokens: cell.cacheWrite,
            outputTokens: cell.outputTokens,
          },
          price,
        );
        fresh$ += weight * priced.usd.freshInput;
        cache$ += weight * priced.usd.cacheRead;
        write$ += weight * priced.usd.cacheWrite;
        out$ += weight * priced.usd.output;
        freshTok += weight * priced.tokens.freshInput;
        cacheTok += weight * priced.tokens.cacheRead;
        writeTok += weight * priced.tokens.cacheWrite;
        outTok += weight * priced.tokens.output;
        observedWeight += weight;
      }
      if (observedWeight <= 0) return null;
      const freshInputUsd = fresh$ / observedWeight;
      const cacheReadUsd = cache$ / observedWeight;
      const cacheWriteUsd = write$ / observedWeight;
      const outputUsd = out$ / observedWeight;
      return {
        modelId: model.id,
        freshInputUsd,
        cacheReadUsd,
        cacheWriteUsd,
        outputUsd,
        totalUsd: freshInputUsd + cacheReadUsd + cacheWriteUsd + outputUsd,
        freshInputTokens: freshTok / observedWeight,
        cacheReadTokens: cacheTok / observedWeight,
        cacheWriteTokens: writeTok / observedWeight,
        outputTokens: outTok / observedWeight,
      };
    })
    .filter((row): row is CostAnatomyRow => row != null)
    .sort((a, b) => a.totalUsd - b.totalUsd);
}

export interface CpscInterval {
  lo: number;
  hi: number;
}

const BOOTSTRAP_SAMPLES = 2000;

/**
 * Deterministic PRNG so the intervals are identical across renders and
 * across server/client. Common random numbers across weight settings also
 * keep the intervals from jittering while a basket slider is dragged.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 95% CI on each model's basket CPSC from a task-resampling bootstrap: tasks
 * are the sampling unit (seeds stay nested inside their task), so this asks
 * "how much would the ranking move on a different draw of 18 shallow tasks?"
 */
export function weightedCpscIntervals(weights: BasketWeights): Record<string, CpscInterval> {
  const intervals: Record<string, CpscInterval> = {};
  for (const model of models) {
    const wCost: number[] = [];
    const wSolve: number[] = [];
    for (const item of tasks) {
      const weight = taskWeight(item, weights);
      if (weight <= 0) continue;
      const cell = measuredCells.find(
        (candidate) => candidate.modelId === model.id && candidate.taskId === item.id,
      );
      if (!cell || cell.repairLoops <= 0) continue;
      wCost.push(weight * cell.costPerRepairLoop);
      wSolve.push(weight * cell.solveRate);
    }
    const n = wCost.length;
    if (n === 0) continue;
    const rand = mulberry32(0x5eed);
    const samples: number[] = [];
    for (let b = 0; b < BOOTSTRAP_SAMPLES; b++) {
      let cost = 0;
      let solve = 0;
      for (let i = 0; i < n; i++) {
        const k = Math.floor(rand() * n);
        cost += wCost[k];
        solve += wSolve[k];
      }
      if (solve > 0) samples.push(cost / solve);
    }
    if (samples.length === 0) continue;
    samples.sort((a, b) => a - b);
    intervals[model.id] = {
      lo: samples[Math.floor(0.025 * samples.length)],
      hi: samples[Math.min(samples.length - 1, Math.floor(0.975 * samples.length))],
    };
  }
  return intervals;
}

/** Default price anchor for the repricing counterfactual: the cheapest
 * competitively priced open-weight model on the panel. */
export const REFERENCE_PRICE_KEY = "z-ai/glm-5.2";

/** Every price sheet a panel model bills against, for the anchor picker. */
export const referencePriceOptions: { key: string; label: string }[] = models
  .filter((model, index) => models.findIndex((m) => m.priceKey === model.priceKey) === index)
  .map((model) => ({ key: model.priceKey, label: model.label }));

export interface StickerPremiumRow {
  modelId: string;
  /** Basket CPSC at the model's own list price (the leaderboard number). */
  ownCpsc: number;
  /** Basket CPSC if the same token usage were billed at the reference
   * open-weight sticker prices — token efficiency with price held equal. */
  repricedCpsc: number;
  /** ownCpsc / repricedCpsc: the list-price premium over open-market token
   * rates for identical work. 1.0x for the reference model by construction. */
  premium: number;
}

export function stickerPremiumRows(
  weights: BasketWeights,
  referencePriceKey: string = REFERENCE_PRICE_KEY,
): StickerPremiumRow[] {
  const ref = prices[referencePriceKey] ?? prices[REFERENCE_PRICE_KEY];
  return models
    .map((model) => {
      let spendNumerator = 0;
      let repricedNumerator = 0;
      let solveNumerator = 0;
      for (const item of tasks) {
        const weight = taskWeight(item, weights);
        if (weight <= 0) continue;
        const cell = measuredCells.find(
          (candidate) => candidate.modelId === model.id && candidate.taskId === item.id,
        );
        if (!cell || cell.repairLoops <= 0) continue;
        const repricedLoopUsd = priceTokenUsage(
          {
            inputTokens: cell.inputTokens,
            cacheReadTokens: cell.cacheRead,
            cacheWriteTokens: cell.cacheWrite,
            outputTokens: cell.outputTokens,
          },
          ref,
        ).usd.total;
        spendNumerator += weight * cell.costPerRepairLoop;
        repricedNumerator += weight * repricedLoopUsd;
        solveNumerator += weight * cell.solveRate;
      }
      if (solveNumerator <= 0 || repricedNumerator <= 0) return null;
      const ownCpsc = spendNumerator / solveNumerator;
      const repricedCpsc = repricedNumerator / solveNumerator;
      return { modelId: model.id, ownCpsc, repricedCpsc, premium: ownCpsc / repricedCpsc };
    })
    .filter((row): row is StickerPremiumRow => row != null)
    .sort((a, b) => b.premium - a.premium);
}

export const DEEPSWE_SOURCE = {
  name: "DeepSWE v1.1 leaderboard",
  url: "https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json",
  generatedAt: DEEPSWE_COMPARISON_GENERATED_AT,
  tasks: 113,
};

function effortKey(effort: string | null): string {
  return effort ?? "default";
}

function sameEffort(a: string | null, b: string | null): boolean {
  return effortKey(a) === effortKey(b);
}

function sameModelFamily(a: string, b: string): boolean {
  return a.replace(/^openrouter\//, "") === b.replace(/^openrouter\//, "");
}

export function deepsweCostPerSolved(id: string): number | null {
  const model = modelById[id];
  if (!model) return null;
  const row = deepsweComparison.rows.find(
    (candidate) =>
      (candidate.model_config === model.modelConfig ||
        sameModelFamily(candidate.model, model.priceKey)) &&
      sameEffort(candidate.deepswe_reasoning_effort, model.effort),
  );
  return row?.deepswe_cpsc ?? null;
}

export function deepswePassAt1(id: string): number | null {
  const model = modelById[id];
  if (!model) return null;
  const row = deepsweComparison.rows.find(
    (candidate) =>
      (candidate.model_config === model.modelConfig ||
        sameModelFamily(candidate.model, model.priceKey)) &&
      sameEffort(candidate.deepswe_reasoning_effort, model.effort),
  );
  return row?.deepswe_pass_rate ?? null;
}

export const EFFORT_ORDER = ["low", "medium", "high", "xhigh", "max"] as const;

export function effortRank(effort: string | null): number {
  if (effort == null) return -1;
  const i = (EFFORT_ORDER as readonly string[]).indexOf(effort);
  return i === -1 ? 99 : i;
}

export interface DeepsweEffortPoint {
  effort: string | null;
  passRate: number;
  meanCostUsd: number;
  costPerSolved: number;
  matched: boolean;
}

export interface DeepsweEffortCurve {
  familyKey: string;
  modelId: string;
  label: string;
  short: string;
  matchedEfforts: string[];
  points: DeepsweEffortPoint[];
}

export interface ShallowEffortPoint {
  modelId: string;
  effort: string | null;
  cpsc: number;
  tokensPerSuccess: number | null;
  passRate: number;
  solveRate: number;
  turns: number;
  attempts: number;
  repairLoops: number;
  passes: number;
  successes: number;
}

export interface ShallowEffortCurve {
  familyKey: string;
  modelId: string;
  label: string;
  short: string;
  points: ShallowEffortPoint[];
}

const modelFamilies = models.reduce<Record<string, ModelDef[]>>((acc, model) => {
  acc[model.priceKey] = [...(acc[model.priceKey] ?? []), model];
  return acc;
}, {});

export const shallowEffortCurves: ShallowEffortCurve[] = Object.entries(modelFamilies)
  .map(([familyKey, familyModels]) => {
    const representative = familyModels[0];
    const suiteById = Object.fromEntries(suiteAggregates().map((row) => [row.modelId, row]));
    const points = familyModels
      .map((model) => {
        const suite = suiteById[model.id];
        if (!suite || suite.cpsc == null) return null;
        return {
          modelId: model.id,
          effort: model.effort,
          cpsc: suite.cpsc,
          tokensPerSuccess: suite.tokensPerSuccess,
          passRate: suite.solveRate,
          solveRate: suite.solveRate,
          turns: suite.turns,
          attempts: suite.repairLoops,
          repairLoops: suite.repairLoops,
          passes: suite.successes,
          successes: suite.successes,
        };
      })
      .filter((point): point is ShallowEffortPoint => point != null)
      .sort((a, b) => effortRank(a.effort) - effortRank(b.effort));

    return {
      familyKey,
      modelId: representative.id,
      label: representative.label,
      short: representative.familyShort,
      points,
    };
  })
  .filter((curve) => curve.points.length > 0)
  .sort((a, b) => Math.min(...a.points.map((point) => point.cpsc)) - Math.min(...b.points.map((point) => point.cpsc)));

export const deepsweEffortCurves: DeepsweEffortCurve[] = Object.entries(modelFamilies)
  .map(([familyKey, familyModels]) => {
    const representative = familyModels[0];
    const matchedEfforts = new Set(familyModels.map((model) => effortKey(model.effort)));
    const uniqueRows = new Map<string, DeepsweComparisonRow>();

    for (const row of deepsweComparison.rows) {
      if (sameModelFamily(row.model, familyKey)) {
        uniqueRows.set(effortKey(row.deepswe_reasoning_effort), row);
      }
    }

    const points = [...uniqueRows.values()]
      .sort((a, b) => effortRank(a.deepswe_reasoning_effort) - effortRank(b.deepswe_reasoning_effort))
      .map((row) => ({
        effort: row.deepswe_reasoning_effort,
        passRate: row.deepswe_pass_rate,
        meanCostUsd: row.deepswe_mean_cost_usd,
        costPerSolved: row.deepswe_cpsc,
        matched: matchedEfforts.has(effortKey(row.deepswe_reasoning_effort)),
      }));
    return {
      familyKey,
      modelId: representative.id,
      label: representative.label,
      short: representative.familyShort,
      matchedEfforts: [...matchedEfforts],
      points,
    };
  })
  .filter((curve) => curve.points.length > 0);

export interface RankRow {
  modelId: string;
  deepRank: number;
  shallowRank: number;
  deepValue: number;
  shallowValue: number;
}

export function rankTranslation(
  weights: BasketWeights = EQUAL_WEIGHTS,
  modelIds?: ReadonlySet<string>,
): RankRow[] {
  const shallow = weightedAggregates(weights).filter((row): row is Aggregate & { cpsc: number } => row.cpsc != null);
  const shallowValueOf = Object.fromEntries(shallow.map((a) => [a.modelId, a.cpsc]));
  const matchedRows = models
    .filter((m) => modelIds == null || modelIds.has(m.id))
    .map((m) => ({
      modelId: m.id,
      deepValue: deepswePassAt1(m.id),
      shallowValue: shallowValueOf[m.id],
    }))
    .filter((row): row is { modelId: string; deepValue: number; shallowValue: number } => {
      return row.deepValue != null && row.shallowValue != null;
    });
  const shallowRankOf = Object.fromEntries(
    [...matchedRows].sort((a, b) => a.shallowValue - b.shallowValue).map((a, i) => [a.modelId, i + 1]),
  );
  return matchedRows
    .sort((a, b) => b.deepValue - a.deepValue)
    .map((row, i) => ({
      modelId: row.modelId,
      deepRank: i + 1,
      shallowRank: shallowRankOf[row.modelId],
      deepValue: row.deepValue,
      shallowValue: row.shallowValue,
    }));
}

export function fmtUsd(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(3)}`;
  if (value >= 0.001) return `$${value.toFixed(4)}`;
  return `$${value.toExponential(1)}`;
}

export function fmtModelPricing(modelId: string): string {
  const model = modelById[modelId];
  const price = model ? prices[model.priceKey] : null;
  if (!price) return "n/a";
  return `${fmtUsd(price.inputPer1M)} in · ${fmtUsd(price.outputPer1M)} out`;
}

export function fmtTokens(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}K`;
  return `${Math.round(value)}`;
}

export function fmtPercent(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  return `${(value * 100).toFixed(1)}%`;
}

export function fmtEffort(effort: string | null): string {
  if (effort == null) return "fixed";
  if (effort === "medium") return "med";
  return effort;
}

export function effortTitle(effort: string | null): string {
  if (effort == null) {
    return "No reasoning_effort parameter sent; model uses provider-defined always-on thinking.";
  }
  return `reasoning_effort=${effort}`;
}

export function fmtMetric(value: number, metric: Metric): string {
  return metric === "cpsc" ? fmtUsd(value) : fmtTokens(value);
}

export function fmtMaybeMetric(value: number | null, metric: Metric): string {
  return value == null ? "n/a" : fmtMetric(value, metric);
}

function task(id: string, label: string, category: CategoryId, size: SizeId, shape: string): TaskDef {
  return { id, label, category, size, tier: size, shape };
}

const sizeById = Object.fromEntries(sizes.map((size) => [size.id, size]));

function rowToCell(row: AggregateRow, model: ModelDef, item: TaskDef): Cell {
  const repairLoops = rowRepairLoops(row);
  const totalTrials = row.total_trials ?? repairLoops;
  const excludedRepairLoops = row.excluded_repair_loops ?? row.excluded_attempts ?? 0;
  const successes = rowSuccesses(row);
  const costPerRepairLoop = rowCostPerLoop(row);
  const tokensPerRepairLoop = rowTokensPerLoop(row);
  return {
    modelId: model.id,
    modelConfig: row.model_config,
    taskId: item.id,
    category: item.category,
    size: item.size,
    tier: item.size,
    totalTrials,
    repairLoops,
    excludedRepairLoops,
    attempts: repairLoops,
    successes,
    passes: successes,
    scoredCoverageRate: totalTrials > 0 ? repairLoops / totalTrials : 0,
    solveRate: rowSolveRate(row),
    passRate: rowSolveRate(row),
    tokensPerRepairLoop,
    tokensPerAttempt: tokensPerRepairLoop,
    inputTokens: row.mean_input_tokens_per_repair_loop ?? row.mean_input_tokens_per_attempt ?? 0,
    outputTokens: row.mean_output_tokens_per_repair_loop ?? row.mean_output_tokens_per_attempt ?? 0,
    cacheRead: row.mean_cache_read_tokens_per_repair_loop ?? row.mean_cache_read_tokens_per_attempt ?? 0,
    cacheWrite: row.mean_cache_write_tokens_per_repair_loop ?? row.mean_cache_write_tokens_per_attempt ?? 0,
    reasoningTokens: row.mean_reasoning_tokens_per_repair_loop ?? row.mean_reasoning_tokens_per_attempt ?? 0,
    turns: rowTurns(row),
    p95Turns: rowP95Turns(row),
    costPerRepairLoop,
    p95CostPerRepairLoop: rowP95CostPerLoop(row),
    costPerAttempt: costPerRepairLoop,
    cpsc: row.cpsc,
    tokensPerSuccess: row.tokens_per_success,
    meanVerifierSubmissions: row.mean_verifier_submissions_per_repair_loop ?? 0,
    firstCheckPassRate: firstCheckPassRateForCell(row, model, item),
    verifierSubmissionsToSuccess: row.mean_verifier_submissions_to_success ?? null,
    stopReasons: row.stop_reasons ?? {},
    capHitRate: row.cap_hit_rate ?? 0,
    capHits: row.cap_hits ?? 0,
    totalSpend: row.total_model_spend_usd ?? costPerRepairLoop * repairLoops,
  };
}

function rowRepairLoops(row: AggregateRow): number {
  return row.repair_loops ?? row.attempts ?? 0;
}

function rowSuccesses(row: AggregateRow): number {
  return row.successes ?? row.passes ?? 0;
}

function rowSolveRate(row: AggregateRow): number {
  return row.solve_rate ?? row.pass_rate ?? 0;
}

function rowCostPerLoop(row: AggregateRow): number {
  return row.mean_cost_per_repair_loop ?? row.mean_cost_per_attempt ?? 0;
}

function rowP95CostPerLoop(row: AggregateRow): number {
  return row.p95_cost_per_repair_loop ?? rowCostPerLoop(row);
}

function rowTokensPerLoop(row: AggregateRow): number {
  return row.mean_tokens_per_repair_loop ?? row.mean_tokens_per_attempt ?? 0;
}

function rowTurns(row: AggregateRow): number {
  return row.mean_agent_steps_per_repair_loop ?? row.mean_turns_per_repair_loop ?? row.mean_turns ?? 0;
}

function rowP95Turns(row: AggregateRow): number {
  return row.p95_agent_steps_per_repair_loop ?? row.p95_turns_per_repair_loop ?? rowTurns(row);
}

function firstCheckPassRateForCell(row: AggregateRow, model: ModelDef, item: TaskDef): number {
  const bucket = firstCheckPassByTaskModel[taskModelKey(item.id, model.modelConfig)];
  if (bucket && bucket.scored > 0) return bucket.firstCheckPasses / bucket.scored;
  const repairLoops = rowRepairLoops(row);
  if (repairLoops <= 0) return 0;
  return (row.mean_verifier_submissions_per_repair_loop ?? 0) <= 1 && rowSolveRate(row) === 1 ? 1 : 0;
}

function taskModelKey(taskId: string, modelConfig: string): string {
  return `${taskId}\u0000${modelConfig}`;
}

function rolloutModelConfig(row: RolloutRow): string | null {
  if (!row.model) return null;
  return row.reasoning_effort ? `${row.model}[${row.reasoning_effort}]` : row.model;
}

function taskWeight(item: TaskDef, weights: BasketWeights): number {
  const categoryWeight = normalizedWeight(weights.categories, categories.map((category) => category.id), item.category);
  const sizeWeight = normalizedWeight(weights.sizes, sizes.map((size) => size.id), item.size);
  const inCell = tasksByCategorySize[cellKey(item.category, item.size)]?.length || 1;
  return (categoryWeight * sizeWeight) / inCell;
}

function normalizedWeight<T extends string>(weights: Record<T, number>, keys: T[], key: T): number {
  const total = keys.reduce((sum, item) => sum + Math.max(0, weights[item] ?? 0), 0);
  if (total <= 0) return 1 / keys.length;
  return Math.max(0, weights[key] ?? 0) / total;
}

function cellKey(category: CategoryId, size: SizeId): string {
  return `${category}/${size}`;
}
