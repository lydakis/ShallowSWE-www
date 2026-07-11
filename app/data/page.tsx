import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import DocPage from "@/components/docs/DocPage";
import contentManifest from "@/content/manifest.json";
import runManifest from "@/public/data/run-manifest.json";
import { SITE_DATA_LICENSE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Data & downloads",
  description:
    "Row-level exports, aggregates, price sheets, licenses, and provenance for the ShallowSWE preview snapshot — plus what a future calibrated snapshot will add.",
  alternates: { canonical: "/data" },
};

const toc = [
  { id: "snapshot", label: "Current preview snapshot" },
  { id: "downloads", label: "Downloads" },
  { id: "prices", label: "Price sheets" },
  { id: "provenance", label: "Provenance & runner" },
  { id: "license", label: "License" },
  { id: "v1", label: "What changes at v1" },
];

function fileSize(publicPath: string): string {
  const bytes = fs.statSync(path.join(process.cwd(), "public", publicPath)).size;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const downloads = [
  ["rollouts.json", "Repair-loop rows", "Every scored bounded repair-loop row: outcome, spend, tokens, submissions, steps."],
  ["aggregate-by-model.json", "Aggregate by model", "Model-level CPSC, solve rate, and diagnostics."],
  ["aggregate-by-task-model.json", "Aggregate by task × model", "The per-cell numbers behind every chart."],
  ["workload-index.json", "Workload index", "Declared basket weights for the suite views."],
  ["deepswe-comparison.json", "DeepSWE comparison", "The published DeepSWE v1.1 leaderboard rows used as clearly-labeled context."],
  ["run-manifest.json", "Run manifest", "Snapshot metadata: protocol caps, panel, seeds, and budget gate."],
] as const;

const priceSheets = ["prices-openrouter-2026-07-09.json", "prices-openrouter-2026-07-08.json", "prices-openrouter-2026-07-03.json"] as const;

export default function DataPage() {
  return (
    <DocPage
      eyebrow="Research · data"
      title="Data & downloads"
      chips={[{ label: "Preview snapshot", tone: "warn" }, { label: `Generated ${runManifest.generated_at.slice(0, 10)}` }]}
      lede={
        <p>
          Everything on this site is computed from the files below — no number appears on a chart that you cannot
          recompute from a download. The current snapshot is a <strong className="text-ink">machinery-validation
          preview</strong>, not a report-grade release; the difference is spelled out at the bottom.
        </p>
      }
      toc={toc}
    >
      <article className="doc-prose">
        <section id="snapshot" className="scroll-mt-24">
          <h2>Current preview snapshot</h2>
          <p>
            Snapshot <code>{runManifest.snapshot_id}</code>: {runManifest.partial_rows_exported} bounded repair-loop
            rows across {runManifest.tasks.length} tasks at N=
            {runManifest.repair_loop_seeds_per_task_model_config} seeds per task × model config. Fixed preview caps
            apply to every row: ${runManifest.protocol.dollar_cap_usd.toFixed(0)} spend,{" "}
            {runManifest.protocol.verifier_submission_cap} verifier submissions,{" "}
            {runManifest.protocol.agent_step_cap} agent steps. Failures keep their actual spend in the bill —
            this is <strong>realized CPSC</strong>, the preview view of the{" "}
            <a href="/methodology#metric">metric family</a>.
          </p>
          <p>
            The preview is nearly saturated by design (753 successes in 756 loops): it validates the repair-loop
            machinery, accounting, and export path rather than discriminating model capability.
          </p>
        </section>

        <section id="downloads" className="scroll-mt-24">
          <h2>Downloads</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Contents</th>
                  <th align="right">Size</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map(([file, name, description]) => (
                  <tr key={file}>
                    <td>
                      <a href={`/data/${file}`} download className="font-mono text-[0.8rem]">
                        {file}
                      </a>
                    </td>
                    <td>
                      <strong>{name}.</strong> {description}
                    </td>
                    <td align="right">{fileSize(`data/${file}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="prices" className="scroll-mt-24">
          <h2>Price sheets</h2>
          <p>
            Dollars are always token counts × a dated OpenRouter price sheet, so every cost is repriceable. The charts
            use the newest sheet; older sheets are kept so past numbers stay reproducible.
          </p>
          <ul>
            {priceSheets.map((file) => (
              <li key={file}>
                <a href={`/data/${file}`} download className="font-mono text-[0.8rem]">
                  {file}
                </a>{" "}
                <span className="text-muted">({fileSize(`data/${file}`)})</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="provenance" className="scroll-mt-24">
          <h2>Provenance & runner</h2>
          <ul>
            <li>
              <strong>Runner:</strong> {runManifest.runner}, agent <code>{runManifest.agent}</code>.
            </li>
            <li>
              <strong>Protocol invariants:</strong> one model config per row, no fallbacks, conversation and filesystem
              continuation across verifier feedback, coarse feedback classes only (
              {runManifest.protocol.allowed_feedback_classes.join(", ")}).
            </li>
            <li>
              <strong>Research documents:</strong> the <a href="/paper">working paper</a> and{" "}
              <a href="/pilot">pilot protocol</a> on this site are synced from{" "}
              <a href={`${contentManifest.source_repo}/tree/${contentManifest.source_commit}`}>
                lydakis/ShallowSWE @ {contentManifest.source_commit.slice(0, 12)}
              </a>{" "}
              with per-document hashes recorded in a{" "}
              <a href={`https://github.com/lydakis/ShallowSWE-www/blob/main/content/manifest.json`}>content manifest</a>.
            </li>
            <li>
              <strong>DeepSWE context rows</strong> come from the published DeepSWE v1.1 leaderboard and are never
              blended into ShallowSWE values.
            </li>
          </ul>
        </section>

        <section id="license" className="scroll-mt-24">
          <h2>License</h2>
          <p>
            All ShallowSWE data files are released under <strong>CC BY 4.0</strong> — use them freely with attribution.
            See <a href={SITE_DATA_LICENSE_URL}>LICENSE.txt</a> for the exact terms and the attribution line to use.
          </p>
        </section>

        <section id="v1" className="scroll-mt-24">
          <h2>What changes at v1</h2>
          <p>
            A calibrated snapshot is a different artifact from this preview, and its files will say so. When the{" "}
            <a href="/pilot">pilot</a> completes and a report-grade run happens, the exports gain:
          </p>
          <ul>
            <li>
              calibrated per-task budgets B<sub>t</sub> and anchor replacement costs R<sub>t</sub>, with sample sizes
              and intervals;
            </li>
            <li>
              charged-spend fields for all three metric views — reference-budget, realized, and escalation CPSC — beside
              actual spend;
            </li>
            <li>immutable <code>model_config_id</code> and <code>agent_policy_id</code> identities with full provider provenance;</li>
            <li>
              an explicit claim tier on every artifact (<code>protocol_validation</code> or <code>report_grade</code>),
              plus the candidate funnel, exclusions, and rank-stability results.
            </li>
          </ul>
          <p>
            Preview files will remain downloadable after that, clearly separated from calibrated snapshots. The full
            field list is in <a href="/paper#appendix-c-minimum-schema-migration">paper appendix C</a>.
          </p>
        </section>
      </article>
    </DocPage>
  );
}
