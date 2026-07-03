import aggregateByModelJson from "@/public/data/aggregate-by-model.json";
import aggregateByTaskModelJson from "@/public/data/aggregate-by-task-model.json";
import priceSheetJson from "@/public/data/prices-openrouter-2026-07-03.json";
import runManifestJson from "@/public/data/run-manifest.json";
import deepsweComparisonJson from "@/public/data/deepswe-comparison.json";

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
export const SUITE_TASKS = runManifest.tasks.length;
export const ROLLOUTS = runManifest.rollouts_per_task_model_config;
export const PANEL_SIZE = aggregateByModel.length;
export const PILOT_TRIALS = aggregateByModel.reduce((sum, row) => sum + row.attempts, 0);
export const SNAPSHOT_STATUS = "Measured pilot";
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
    modelConfig: "anthropic/claude-fable-5[low]",
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
    modelConfig: "anthropic/claude-sonnet-5[low]",
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
    modelConfig: "anthropic/claude-sonnet-5[medium]",
    label: "Claude Sonnet 5",
    short: "Sonnet 5 med",
    familyShort: "Sonnet",
    vendor: "Anthropic",
    size: "mid",
    priceKey: "anthropic/claude-sonnet-5",
    effort: "medium",
    hueLight: "#1f9f9a",
    hueDark: "#29beb8",
  },
  {
    id: "kimi-k2-7-default",
    modelConfig: "moonshotai/kimi-k2.7-code",
    label: "Kimi K2.7 Code",
    short: "Kimi default",
    familyShort: "Kimi",
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
    modelConfig: "anthropic/claude-opus-4.8[medium]",
    label: "Claude Opus 4.8",
    short: "Opus 4.8 med",
    familyShort: "Opus",
    vendor: "Anthropic",
    size: "large",
    priceKey: "anthropic/claude-opus-4.8",
    effort: "medium",
    hueLight: "#bd3f6a",
    hueDark: "#d85c86",
  },
  {
    id: "gpt-5-5-low",
    modelConfig: "openai/gpt-5.5[low]",
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
    modelConfig: "openai/gpt-5.5[medium]",
    label: "GPT-5.5",
    short: "GPT-5.5 med",
    familyShort: "GPT-5.5",
    vendor: "OpenAI",
    size: "large",
    priceKey: "openai/gpt-5.5",
    effort: "medium",
    hueLight: "#b87924",
    hueDark: "#d69130",
  },
  {
    id: "gemini-flash-medium",
    modelConfig: "google/gemini-3.5-flash[medium]",
    label: "Gemini 3.5 Flash",
    short: "Gemini medium",
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
    modelConfig: "z-ai/glm-5.2[high]",
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

function effortKey(effort: string | null): string {
  return effort ?? "default";
}

function sameEffort(a: string | null, b: string | null): boolean {
  return effortKey(a) === effortKey(b);
}

export function deepsweCostPerSolved(id: string): number | null {
  const model = modelById[id];
  if (!model) return null;
  const row = deepsweComparison.rows.find(
    (candidate) =>
      candidate.model_config === model.modelConfig &&
      sameEffort(candidate.deepswe_reasoning_effort, model.effort),
  );
  return row?.deepswe_cpsc ?? null;
}

/* ---------------------------------------------------------------------------
   DeepSWE effort curves — real published v1.1 source data.
   These are DeepSWE-only rows (hard SWE work), one per reasoning-effort level,
   used to show the accuracy/cost escalation that ShallowSWE deliberately does
   not sweep. Never mixed into ShallowSWE measured values.
--------------------------------------------------------------------------- */

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

const modelFamilies = models.reduce<Record<string, ModelDef[]>>((acc, model) => {
  acc[model.priceKey] = [...(acc[model.priceKey] ?? []), model];
  return acc;
}, {});

export interface ShallowEffortPoint {
  modelId: string;
  effort: string | null;
  cpsc: number;
  tokensPerSuccess: number;
  passRate: number;
  turns: number;
  attempts: number;
  passes: number;
}

export interface ShallowEffortCurve {
  familyKey: string;
  modelId: string;
  label: string;
  short: string;
  points: ShallowEffortPoint[];
}

export const shallowEffortCurves: ShallowEffortCurve[] = Object.entries(modelFamilies)
  .map(([familyKey, familyModels]) => {
    const representative = familyModels[0];
    const suiteById = Object.fromEntries(suiteAggregates().map((row) => [row.modelId, row]));
    const pilotById = Object.fromEntries(pilotModelRows.map((row) => [row.modelId, row]));
    const points = familyModels
      .map((model) => {
        const suite = suiteById[model.id];
        const pilot = pilotById[model.id];
        if (!suite || !pilot) return null;
        return {
          modelId: model.id,
          effort: model.effort,
          cpsc: suite.cpsc,
          tokensPerSuccess: suite.tokensPerSuccess,
          passRate: suite.passRate,
          turns: suite.turns,
          attempts: pilot.attempts,
          passes: pilot.passes,
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

export const deepsweEffortCurves: DeepsweEffortCurve[] = Object.entries(modelFamilies).map(([familyKey, familyModels]) => {
  const representative = familyModels[0];
  const configs = new Set(familyModels.map((model) => model.modelConfig));
  const matchedEfforts = new Set(familyModels.map((model) => effortKey(model.effort)));
  const uniqueRows = new Map<string, DeepsweComparisonRow>();

  for (const row of deepsweComparison.rows) {
    if (configs.has(row.model_config) || row.model === familyKey) {
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
  if (points.length === 0) throw new Error(`No DeepSWE effort rows for ${familyKey}`);
  return {
    familyKey,
    modelId: representative.id,
    label: representative.label,
    short: representative.familyShort,
    matchedEfforts: [...matchedEfforts],
    points,
  };
});

export interface RankRow {
  modelId: string;
  deepRank: number;
  shallowRank: number;
  deepValue: number;
  shallowValue: number;
}

/**
 * Rank translation, deep end → shallow end. Both sides are dollars-per-success:
 * DeepSWE cost per solved hard task (effort-matched) vs the measured ShallowSWE
 * pilot basket CPSC. Rank 1 = cheapest.
 */
export function rankTranslation(): RankRow[] {
  const shallow = suiteAggregates();
  const shallowValueOf = Object.fromEntries(shallow.map((a) => [a.modelId, a.cpsc]));
  const shallowRankOf = Object.fromEntries(
    [...shallow].sort((a, b) => a.cpsc - b.cpsc).map((a, i) => [a.modelId, i + 1]),
  );
  return models
    .map((m) => ({ modelId: m.id, deepValue: deepsweCostPerSolved(m.id) }))
    .filter((row): row is { modelId: string; deepValue: number } => row.deepValue != null)
    .sort((a, b) => a.deepValue - b.deepValue)
    .map((row, i) => ({
      modelId: row.modelId,
      deepRank: i + 1,
      shallowRank: shallowRankOf[row.modelId],
      deepValue: row.deepValue,
      shallowValue: shallowValueOf[row.modelId],
    }));
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
