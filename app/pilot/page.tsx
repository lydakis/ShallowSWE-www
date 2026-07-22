import type { Metadata } from "next";
import Link from "next/link";
import DocPage from "@/components/docs/DocPage";
import { sourceFileUrl } from "@/components/docs/Provenance";
import manifest from "@/content/manifest.json";

export const metadata: Metadata = {
  title: "Pilot status",
  description:
    "Status of the ShallowSWE six-task protocol-validation pilot: the completed Kaggle development shakedown and pending report-grade plan.",
  alternates: { canonical: "/pilot" },
};

const toc = [
  { id: "status", label: "Current status" },
  { id: "glance", label: "The plan at a glance" },
  { id: "tasks", label: "The six-task panel" },
  { id: "trajectories", label: "112 official trajectories" },
  { id: "stages", label: "Stage gates" },
  { id: "stop", label: "Stop conditions" },
];

const stages = [
  {
    name: "Freeze and local QA",
    gate: "Six reviewed task packets, executed quality evidence, frozen hashes and canary manifest. $0 metered spend.",
    state: "in review",
  },
  {
    name: "Development triage",
    gate: "A valid N=3 Codex/Pier/Docker floor was audited for all six candidates. Outcomes remain quarantined development evidence and are withheld during independent review.",
    state: "complete",
  },
  {
    name: "Two-task canary",
    gate: "16 trajectories verify provider identity, continuation, verifier isolation, and cost reconciliation before anything else runs.",
    state: "pending",
  },
  {
    name: "Permissive collection",
    gate: "72 trajectories across all six tasks under generous undisclosed limits; supplies the data for cap and budget selection.",
    state: "pending",
  },
  {
    name: "Freeze policy and budgets",
    gate: "Analysis only: propose the submission cap K, a pooled step guard, pressure bands, and per-task budgets Bt.",
    state: "pending",
  },
  {
    name: "Fresh anchor confirmation",
    gate: "24 trajectories on three preregistered tasks under the exact frozen policy; estimates the replacement cost Rt.",
    state: "pending",
  },
  {
    name: "Conditional extensions",
    gate: "Up to 30 reserve trajectories, only for cells that change a named decision; optional $25-capped external comparator after the core pilot.",
    state: "pending",
  },
];

export default function PilotPage() {
  return (
    <DocPage
      eyebrow="Research · pilot"
      title="Six-task protocol-validation pilot"
      chips={[
        { label: `Protocol ${manifest.pilot_protocol_version} · freeze candidate` },
        { label: "Kaggle shakedown complete" },
        { label: "Report-grade pilot pending", tone: "warn" },
      ]}
      lede={
        <p>
          A six-task Kaggle development shakedown has exercised the full calibration and scoring machinery. The
          report-grade pilot remains a separate, construct-reviewed study under the protocol below and makes no
          leaderboard claim until those gates close.
        </p>
      }
      toc={toc}
      provenanceDoc="pilot_protocol"
    >
      <article className="doc-prose">
        <section id="status" className="scroll-mt-24">
          <h2>Current status</h2>
          <p>
            A separate six-task development shakedown completed on Kaggle with 190 declared trajectories spanning
            canary, permissive calibration, policy selection, fresh confirmation, and candidate scoring. It proved the
            end-to-end machinery and exposed task-validity and runner issues, but it is not a benchmark release or the
            report-grade execution of this protocol. The <a href="/paper">v0.4.2 working paper</a> and the plan below
            remain freeze candidates pending independent construct review and corrected task versions. The{" "}
            <Link href="/#chart">preview leaderboard</Link> on the homepage comes from earlier plumbing-validation
            runs and is separate from the shakedown.
          </p>
        </section>

        <section id="glance" className="scroll-mt-24">
          <h2>The plan at a glance</h2>
          <div className="my-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {[
              ["6", "tasks, two per category"],
              ["112", "official trajectories"],
              ["$43 / $63", "base / high estimate"],
              ["$200 + $100", "core limit + reserve"],
            ].map(([value, label]) => (
              <div key={label} className="bg-surface p-4">
                <div className="font-display text-xl text-ink tnum sm:text-2xl">{value}</div>
                <div className="mt-1 font-mono text-[0.68rem] uppercase leading-snug text-muted">{label}</div>
              </div>
            ))}
          </div>
          <p>
            The dollar limits are safety bounds, not expected spend. Official evidence is grant-funded (Kaggle), with
            subscription compute for development only and a $25 cap on optional out-of-pocket extensions. Canonical
            list-price-equivalent cost is reconstructed for every trajectory even when cash outlay is zero.
          </p>
        </section>

        <section id="tasks" className="scroll-mt-24">
          <h2>The six-task panel</h2>
          <p>
            Two candidates per work-product category are selected and hash-frozen for independent review. Task
            identities, authored pressure hypotheses, and development outcomes remain off this public page until the
            review closes, preventing calibration evidence from anchoring construct judgments.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th align="right">Candidates</th>
                  <th>Current gate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Artifact</td>
                  <td align="right">2</td>
                  <td>Blind construct review pending</td>
                </tr>
                <tr>
                  <td>Code</td>
                  <td align="right">2</td>
                  <td>Blind construct review pending</td>
                </tr>
                <tr>
                  <td>Workflow</td>
                  <td align="right">2</td>
                  <td>Blind construct review pending</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Reviewers receive the instruction, visible repository, redacted metadata, and hash-bound review form
            before any verifier-quality evidence. Solutions, hidden tests, model trajectories, pass rates, and authored
            pressure labels are excluded from the blind phase.
          </p>
        </section>

        <section id="trajectories" className="scroll-mt-24">
          <h2>112 official trajectories</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Work</th>
                  <th align="right">Trajectories</th>
                  <th align="right">Base est.</th>
                  <th align="right">High est.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Two-task canary</td>
                  <td align="right">16</td>
                  <td align="right">~$6</td>
                  <td align="right">~$9</td>
                </tr>
                <tr>
                  <td>Permissive six-task collection</td>
                  <td align="right">72</td>
                  <td align="right">~$22</td>
                  <td align="right">~$32</td>
                </tr>
                <tr>
                  <td>Fresh anchor confirmation (3 tasks × 8)</td>
                  <td align="right">24</td>
                  <td align="right">~$15</td>
                  <td align="right">~$22</td>
                </tr>
                <tr>
                  <td>
                    <strong>Core official pilot</strong>
                  </td>
                  <td align="right">
                    <strong>112</strong>
                  </td>
                  <td align="right">
                    <strong>~$43</strong>
                  </td>
                  <td align="right">
                    <strong>~$63</strong>
                  </td>
                </tr>
                <tr>
                  <td>Extension reserve (conditional)</td>
                  <td align="right">≤ 30</td>
                  <td align="right">~$8</td>
                  <td align="right">~$15</td>
                </tr>
                <tr>
                  <td>Optional external comparator</td>
                  <td align="right">≤ 18</td>
                  <td align="right">~$2</td>
                  <td align="right">$25 cash cap</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            The frozen anchor is <code>gpt-5.5-2026-04-23</code> at high reasoning effort, with{" "}
            <code>gpt-5.4-mini</code> and <code>gpt-5.4</code> at low effort as the floor panel. Requested
            configurations, provider routes, and immutable identities freeze in the manifest before the canary; any
            requested/resolved mismatch invalidates the affected rows.
          </p>
        </section>

        <section id="stages" className="scroll-mt-24">
          <h2>Stage gates</h2>
          <p>Each stage must produce its required evidence before the next spends anything:</p>
          <ol>
            {stages.map((stage) => (
              <li key={stage.name}>
                <strong>{stage.name}</strong>
                <span
                  className={`ml-2 inline-block rounded-full border px-1.5 py-px align-middle font-mono text-[0.62rem] uppercase ${
                    stage.state === "in review" ? "border-warn/50 text-warn" : "border-line text-muted"
                  }`}
                >
                  {stage.state}
                </span>
                <br />
                {stage.gate}
              </li>
            ))}
          </ol>
        </section>

        <section id="stop" className="scroll-mt-24">
          <h2>Stop conditions</h2>
          <p>The pilot halts immediately — before spending more — when any of these occurs:</p>
          <ul>
            <li>provider or resolved-model identity is missing, or configurations collapse to one aggregate identity;</li>
            <li>canonical and metered costs disagree beyond the reconciliation tolerance;</li>
            <li>continuation fails to preserve conversation and filesystem state, or the verifier leaks hidden assertions;</li>
            <li>permissive trajectories support no stable hidden-feedback cap, or ordinary successes hit the step guard;</li>
            <li>first-submit and repair-loop data show no meaningful task or model separation — more seeds cannot fix a task-signal failure;</li>
            <li>core grant draw would exceed $200 before targeted confirmation, or the core claim would require personal API spend.</li>
          </ul>
          <p>
            The full sequence, funding rules, and go/no-go criteria are preregistered in the{" "}
            <a href={sourceFileUrl(manifest.documents.pilot_protocol.source_path)}>pilot protocol</a> in the benchmark
            repository.
          </p>
        </section>
      </article>
    </DocPage>
  );
}
