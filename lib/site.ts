import runManifestJson from "@/public/data/run-manifest.json";

const runManifest = runManifestJson as { generated_at: string };

export const SITE_NAME = "ShallowSWE";
export const SITE_URL = "https://shallowswe.com";
export const SITE_DESCRIPTION =
  "ShallowSWE measures cost per verified success for routine software work with bounded repair-loop runs and hidden programmatic tests.";
export const SITE_OG_TITLE = "ShallowSWE: a cost benchmark for routine work";
export const SITE_LAST_MODIFIED = runManifest.generated_at;

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

