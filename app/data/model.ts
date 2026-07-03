import aggregateByModelJson from "@/public/data/aggregate-by-model.json";
import aggregateByTaskModelJson from "@/public/data/aggregate-by-task-model.json";
import priceSheetJson from "@/public/data/prices-openrouter-2026-07-03.json";
import runManifestJson from "@/public/data/run-manifest.json";

export type SizeClass = "small" | "mid" | "large";
export type CategoryId = "fix" | "operate" | "transform";
export type TierId = "t2" | "t3";
export type Metric = "cpsc" | "tps";

interface AggregateRow {
  model_config: string;
  task_id?: string;
  attempts: number;
  excluded_attempts: number;
  passes: number;
  pass_rate: number;
  mean_tokens_per_attempt: number;
  tokens_per_success: number;
  mean_input_tokens_per_attempt: number;
  mean_output_tokens_per_attempt: number;
  mean_cache_read_tokens_per_attempt: number;
  mean_cache_write_tokens_per_attempt: number;
  mean_reasoning_tokens_per_attempt: number;
  mean_turns: number;
  mean_cost_per_attempt: number | null;
  cpsc: number | null;
  mean_gateway_reported_cost_per_attempt: number | null;
}

interface PriceSheetModel {
  provider: string;
  input_per_1m: number;
  cached_input_per_1m: number;
  output_per_1m: number;
  cache_write_per_1m: number | null;
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
  rollouts_per_task_model_config: number;
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

export interface TierDef {
  id: TierId;
  label: string;
  gloss: string;
}

export interface TaskDef {
  id: string;
  label: string;
  category: CategoryId;
  tier: TierId;
  shape: string;
}

export interface Cell {
  modelId: string;
  modelConfig: string;
  taskId: string;
  category: CategoryId;
  tier: TierId;
  attempts: number;
  passes: number;
  passRate: number;
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  reasoningTokens: number;
  turns: number;
  costPerAttempt: number;
  cpsc: number;
  tokensPerSuccess: number;
}

export interface Aggregate {
  modelId: string;
  modelConfig: string;
  cpsc: number;
  tokensPerSuccess: number;
  passRate: number;
  turns: number;
}

export type CategoryWeights = Record<CategoryId, number>;

const aggregateByModel = aggregateByModelJson as AggregateRow[];
const aggregateByTaskModel = aggregateByTaskModelJson as AggregateRow[];
const priceSheet = priceSheetJson as PriceSheet;
const runManifest = runManifestJson as RunManifest;

export const PRICE_SHEET_DATE = priceSheet.effective_date;
export const PRICE_GATEWAY = priceSheet.gateway;
export const PILOT_NAME = runManifest.name;
export const PILOT_GENERATED_AT = runManifest.generated_at;
export const SUITE_TASKS = runManifest.tasks.length;
export const ROLLOUTS = runManifest.rollouts_per_task_model_config;
export const PANEL_SIZE = 5;
export const PILOT_TRIALS = SUITE_TASKS * ROLLOUTS * PANEL_SIZE;
export const SNAPSHOT_STATUS = "Measured pilot";

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
    id: "sonnet-5-low",
    modelConfig: "anthropic/claude-sonnet-5[low]",
    label: "Claude Sonnet 5",
    short: "Sonnet 5 low",
    vendor: "Anthropic",
    size: "mid",
    priceKey: "anthropic/claude-sonnet-5",
    effort: "low",
    hueLight: "#2a78d6",
    hueDark: "#3987e5",
  },
  {
    id: "kimi-k2-7-default",
    modelConfig: "moonshotai/kimi-k2.7-code",
    label: "Kimi K2.7 Code",
    short: "Kimi default",
    vendor: "Moonshot",
    size: "small",
    priceKey: "moonshotai/kimi-k2.7-code",
    effort: null,
    hueLight: "#008300",
    hueDark: "#2e9e6b",
  },
  {
    id: "opus-4-8-low",
    modelConfig: "anthropic/claude-opus-4.8[low]",
    label: "Claude Opus 4.8",
    short: "Opus 4.8 low",
    vendor: "Anthropic",
    size: "large",
    priceKey: "anthropic/claude-opus-4.8",
    effort: "low",
    hueLight: "#e34948",
    hueDark: "#e66767",
  },
  {
    id: "gpt-5-5-low",
    modelConfig: "openai/gpt-5.5[low]",
    label: "GPT-5.5",
    short: "GPT-5.5 low",
    vendor: "OpenAI",
    size: "large",
    priceKey: "openai/gpt-5.5",
    effort: "low",
    hueLight: "#eb6834",
    hueDark: "#d95926",
  },
  {
    id: "gemini-flash-medium",
    modelConfig: "google/gemini-3.5-flash[medium]",
    label: "Gemini 3.5 Flash",
    short: "Gemini medium",
    vendor: "Google",
    size: "small",
    priceKey: "google/gemini-3.5-flash",
    effort: "medium",
    hueLight: "#eda100",
    hueDark: "#c98500",
  },
];

export const panelModels = models;
export const modelById = Object.fromEntries(models.map((m) => [m.id, m]));
export const modelByConfig = Object.fromEntries(models.map((m) => [m.modelConfig, m]));

export const categories: CategoryDef[] = [
  {
    id: "fix",
    label: "Fix",
    gloss: "Regression test plus fix",
    detail: "Duplicate invoice imports must be idempotent and covered by a regression test.",
  },
  {
    id: "operate",
    label: "Operate",
    gloss: "Small repo operation",
    detail: "Feature wiring and config tracing in a compact project.",
  },
  {
    id: "transform",
    label: "Transform",
    gloss: "Multi-source data join",
    detail: "Join invoices, payments, refunds, and customers into payouts and rejects.",
  },
];

export const tiers: TierDef[] = [
  { id: "t2", label: "T2", gloss: "Routine" },
  { id: "t3", label: "T3", gloss: "Mildly gnarly" },
];

export const tasks: TaskDef[] = [
  {
    id: "invoice-cli-regression-test-fix",
    label: "Invoice duplicate regression",
    category: "fix",
    tier: "t2",
    shape: "regression-test-plus-fix",
  },
  {
    id: "report-json-format",
    label: "Report JSON format",
    category: "operate",
    tier: "t2",
    shape: "small-feature-wiring",
  },
  {
    id: "config-flag-ignored",
    label: "Ignored config flag",
    category: "operate",
    tier: "t3",
    shape: "trace-and-fix-config-bug",
  },
  {
    id: "payout-reconcile",
    label: "Payout reconciliation",
    category: "transform",
    tier: "t3",
    shape: "multi-source-join-with-rejects",
  },
];

export const taskById = Object.fromEntries(tasks.map((task) => [task.id, task]));
export const EQUAL_WEIGHTS: CategoryWeights = { fix: 34, operate: 33, transform: 33 };

export const measuredCells: Cell[] = aggregateByTaskModel.map((row) => {
  const model = modelByConfig[row.model_config];
  const task = taskById[row.task_id!];
  if (!model) throw new Error(`Unknown model_config ${row.model_config}`);
  if (!task) throw new Error(`Unknown task_id ${row.task_id}`);
  if (row.mean_cost_per_attempt == null || row.cpsc == null) {
    throw new Error(`Unpriced task row ${row.task_id} / ${row.model_config}`);
  }
  return {
    modelId: model.id,
    modelConfig: row.model_config,
    taskId: row.task_id!,
    category: task.category,
    tier: task.tier,
    attempts: row.attempts,
    passes: row.passes,
    passRate: row.pass_rate,
    inputTokens: row.mean_input_tokens_per_attempt,
    outputTokens: row.mean_output_tokens_per_attempt,
    cacheRead: row.mean_cache_read_tokens_per_attempt,
    cacheWrite: row.mean_cache_write_tokens_per_attempt,
    reasoningTokens: row.mean_reasoning_tokens_per_attempt,
    turns: row.mean_turns,
    costPerAttempt: row.mean_cost_per_attempt,
    cpsc: row.cpsc,
    tokensPerSuccess: row.tokens_per_success,
  };
});

export const pilotModelRows: (Aggregate & {
  attempts: number;
  passes: number;
  costPerAttempt: number;
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  reasoningTokens: number;
})[] = aggregateByModel.map((row) => {
  const model = modelByConfig[row.model_config];
  if (!model) throw new Error(`Unknown model_config ${row.model_config}`);
  if (row.mean_cost_per_attempt == null || row.cpsc == null) {
    throw new Error(`Unpriced model row ${row.model_config}`);
  }
  return {
    modelId: model.id,
    modelConfig: row.model_config,
    attempts: row.attempts,
    passes: row.passes,
    passRate: row.pass_rate,
    costPerAttempt: row.mean_cost_per_attempt,
    cpsc: row.cpsc,
    tokensPerSuccess: row.tokens_per_success,
    turns: row.mean_turns,
    inputTokens: row.mean_input_tokens_per_attempt,
    outputTokens: row.mean_output_tokens_per_attempt,
    cacheRead: row.mean_cache_read_tokens_per_attempt,
    reasoningTokens: row.mean_reasoning_tokens_per_attempt,
  };
});

export function cellsFor(category: CategoryId, modelId: string): Cell[] {
  return measuredCells
    .filter((cell) => cell.category === category && cell.modelId === modelId)
    .sort((a, b) => tasks.findIndex((task) => task.id === a.taskId) - tasks.findIndex((task) => task.id === b.taskId));
}

export function taskLabelsFor(category: CategoryId): string[] {
  return tasks.filter((task) => task.category === category).map((task) => `${task.label} · ${task.tier.toUpperCase()}`);
}

export function metricValue(cell: Cell, metric: Metric): number {
  return metric === "cpsc" ? cell.cpsc : cell.tokensPerSuccess;
}

export function measuredValues(metric: Metric): number[] {
  return measuredCells.map((cell) => metricValue(cell, metric)).filter((value) => value > 0);
}

export function weightedAggregates(weights: CategoryWeights): Aggregate[] {
  const activeCategories = categories.filter((category) => measuredCells.some((cell) => cell.category === category.id));
  const total = activeCategories.reduce((sum, category) => sum + weights[category.id], 0) || 1;
  return models.map((model) => {
    const aggregate = { cpsc: 0, tokensPerSuccess: 0, passRate: 0, turns: 0 };
    for (const category of activeCategories) {
      const cells = cellsFor(category.id, model.id);
      const weight = weights[category.id] / total;
      aggregate.cpsc += (weight * cells.reduce((sum, cell) => sum + cell.cpsc, 0)) / cells.length;
      aggregate.tokensPerSuccess +=
        (weight * cells.reduce((sum, cell) => sum + cell.tokensPerSuccess, 0)) / cells.length;
      aggregate.passRate += (weight * cells.reduce((sum, cell) => sum + cell.passRate, 0)) / cells.length;
      aggregate.turns += (weight * cells.reduce((sum, cell) => sum + cell.turns, 0)) / cells.length;
    }
    return { modelId: model.id, modelConfig: model.modelConfig, ...aggregate };
  });
}

export function suiteAggregates(): Aggregate[] {
  return weightedAggregates(EQUAL_WEIGHTS);
}

export const DEEPSWE_SOURCE = {
  name: "DeepSWE v1.1 leaderboard",
  url: "https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json",
  generatedAt: "2026-07-01T21:40:08Z",
  tasks: 113,
};

export interface DeepsweRow {
  pass: number;
  effort: string | null;
  meanCostUsd: number;
}

export const deepsweRows: Record<string, DeepsweRow> = {
  "sonnet-5-low": { pass: 0.3051224944320713, effort: "low", meanCostUsd: 2.1865550832962137 },
  "kimi-k2-7-default": { pass: 0.3053097345132743, effort: null, meanCostUsd: 2.815536243274336 },
  "opus-4-8-low": { pass: 0.4079822616407982, effort: "low", meanCostUsd: 2.293369216740577 },
  "gpt-5-5-low": { pass: 0.26991150442477874, effort: "low", meanCostUsd: 1.2002025442477877 },
  "gemini-flash-medium": { pass: 0.37389380530973454, effort: "medium", meanCostUsd: 7.341823985508849 },
};

export function deepsweCostPerSolved(id: string): number | null {
  const row = deepsweRows[id];
  return row ? row.meanCostUsd / row.pass : null;
}

export function fmtUsd(value: number): string {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(3)}`;
  if (value >= 0.001) return `$${value.toFixed(4)}`;
  return `$${value.toExponential(1)}`;
}

export function fmtTokens(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}K`;
  return `${Math.round(value)}`;
}

export function fmtMetric(value: number, metric: Metric): string {
  return metric === "cpsc" ? fmtUsd(value) : fmtTokens(value);
}
