import aggregateByModelJson from "@/public/data/aggregate-by-model.json";
import runManifestJson from "@/public/data/run-manifest.json";

const runManifest = runManifestJson as { generated_at: string };
const aggregateByModel = aggregateByModelJson as Array<{ model_config: string }>;

const MODEL_NAME_OVERRIDES: Record<string, string> = {
  "claude-fable-5": "Claude Fable 5",
  "claude-opus-4.8": "Claude Opus 4.8",
  "claude-sonnet-5": "Claude Sonnet 5",
  "gemini-3.5-flash": "Gemini 3.5 Flash",
  "kimi-k2.7-code": "Kimi K2.7 Code",
  "gpt-5.5": "GPT-5.5",
  "gpt-5.6-luna": "GPT-5.6 Luna",
  "gpt-5.6-terra": "GPT-5.6 Terra",
  "gpt-5.6-sol": "GPT-5.6 Sol",
  "grok-4.5": "Grok 4.5",
  inkling: "Inkling",
  "glm-5.2": "GLM 5.2",
};

function displayModelName(modelConfig: string): string {
  const modelId = modelConfig.replace(/\[[^\]]+\]$/, "").split("/").at(-1) ?? modelConfig;
  return (
    MODEL_NAME_OVERRIDES[modelId] ??
    modelId
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export const SITE_NAME = "ShallowSWE";
export const SITE_URL = "https://shallowswe.com";
export const SITE_DESCRIPTION =
  "ShallowSWE is an AI coding benchmark comparing GPT, Claude, Gemini, Grok, Kimi, and GLM model configs by cost per verified success.";
export const SITE_OG_TITLE = "Choose coding models by cost of verified work | ShallowSWE";
export const SITE_LAST_MODIFIED = runManifest.generated_at;
export const SITE_DATA_LICENSE_URL = `${SITE_URL}/data/LICENSE.txt`;
export const SITE_BENCHMARKED_MODEL_CONFIGS = [...new Set(aggregateByModel.map((row) => row.model_config))];
export const SITE_BENCHMARKED_MODELS = [...new Set(SITE_BENCHMARKED_MODEL_CONFIGS.map(displayModelName))];
export const SITE_MODEL_KEYWORDS = [
  "GPT benchmark",
  "GPT coding benchmark",
  "Claude benchmark",
  "Claude coding benchmark",
  "Gemini coding benchmark",
  "Grok coding benchmark",
  "Kimi coding benchmark",
  "GLM coding benchmark",
  ...SITE_BENCHMARKED_MODELS.map((model) => `${model} benchmark`),
];

export const SITE_KEYWORDS = [
  "ShallowSWE",
  "software engineering benchmark",
  "AI coding benchmark",
  "routine software work",
  "cost per successful completion",
  "cost per verified success",
  "repair loop benchmark",
  "AI agents",
  "coding agents",
  "model evaluation",
  ...SITE_MODEL_KEYWORDS,
  ...SITE_BENCHMARKED_MODELS,
];

export const SITE_DATA_DOWNLOADS = [
  {
    name: "Repair-loop rows",
    path: "/data/rollouts.json",
    description: "Scored bounded repair-loop rows.",
  },
  {
    name: "Aggregate by model",
    path: "/data/aggregate-by-model.json",
    description: "Model-level aggregate benchmark results.",
  },
  {
    name: "Aggregate by task and model",
    path: "/data/aggregate-by-task-model.json",
    description: "Task and model aggregate benchmark results.",
  },
  {
    name: "DeepSWE comparison",
    path: "/data/deepswe-comparison.json",
    description: "Comparison data for DeepSWE and ShallowSWE views.",
  },
  {
    name: "Run manifest",
    path: "/data/run-manifest.json",
    description: "Snapshot metadata for the published benchmark run.",
  },
] as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
