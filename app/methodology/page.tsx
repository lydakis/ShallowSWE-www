import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import DocPage from "@/components/docs/DocPage";
import manifest from "@/content/manifest.json";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How ShallowSWE scores routine software work: one bounded repair loop per row, hidden functional verification, and cost per successful completion in three explicit views.",
  alternates: { canonical: "/methodology" },
};

const toc = [
  { id: "measures", label: "What ShallowSWE measures" },
  { id: "loop", label: "One bounded repair loop" },
  { id: "metric", label: "Three views of one metric" },
  { id: "anatomy", label: "Category, pressure, budget, scope" },
  { id: "calibration", label: "Calibration in four phases" },
  { id: "gates", label: "Task quality and admission" },
  { id: "tiers", label: "Claim tiers" },
  { id: "today", label: "What this site shows today" },
  { id: "limits", label: "Limitations" },
];

function PaperRef({ href, children }: { href: string; children: ReactNode }) {
  return (
    <p className="mt-4 font-mono text-[0.72rem] text-muted">
      full treatment:{" "}
      <a href={href} className="text-ink-2 transition-colors hover:text-brand">
        {children}
      </a>
    </p>
  );
}

function Frac({ num, den }: { num: ReactNode; den: ReactNode }) {
  return (
    <span className="inline-flex flex-col text-center align-middle">
      <span className="px-1.5 pb-0.5">{num}</span>
      <span className="border-t border-line-strong px-1.5 pt-0.5">{den}</span>
    </span>
  );
}

export default function MethodologyPage() {
  return (
    <DocPage
      eyebrow="Research · methodology"
      title="How ShallowSWE scores routine software work"
      chips={[
        { label: `Methodology ${manifest.methodology_version}` },
        { label: "Freeze candidate · under independent review", tone: "warn" },
      ]}
      lede={
        <p>
          The five-minute version of the{" "}
          <a href="/paper" className="text-brand underline decoration-brand/35 underline-offset-2 hover:decoration-brand">
            working paper
          </a>
          : what is measured, how a run works, what the score means, and which claims the benchmark does and does not
          make.
        </p>
      }
      toc={toc}
    >
      <article className="doc-prose">
        <section id="measures" className="scroll-mt-24">
          <h2>What ShallowSWE measures</h2>
          <p>
            Most software-engineering benchmarks ask whether agents can solve <em>difficult</em> tasks. ShallowSWE
            targets the opposite regime: original, routine, functionally verifiable work that a frontier agent should
            usually complete — regression fixes, compatibility changes, report transformations, configuration repairs,
            branch operations, bounded tool workflows. In this regime many configurations eventually succeed, but they
            differ sharply in premature completion, repair cycles, context appetite, and spend.
          </p>
          <p>The central question is:</p>
          <blockquote>
            <p>
              For a declared workload basket, how much reference-budget cost is charged per verified completion when
              one fixed agent policy handles every ticket?
            </p>
          </blockquote>
          <p>
            Each scored row binds one immutable model configuration and one fixed agent policy — model, provider route,
            sampling, scaffold, prompt, tools, and continuation behavior stay fixed for the whole trajectory. The
            result is properly read as{" "}
            <strong>model configuration × agent policy × provider path × snapshot</strong>. It is not a universal
            intelligence ranking, a comparison of vendors&apos; native coding products, or a task-value estimate.
          </p>
          <PaperRef href="/paper#2-scope-and-design-principles">paper §2 — scope and design principles</PaperRef>
        </section>

        <section id="loop" className="scroll-mt-24">
          <h2>One bounded repair loop</h2>
          <p>
            A row starts in a clean, isolated sandbox. The agent works normally and declares completion; only then does
            a hidden programmatic verifier run. If verification fails and the undisclosed allowance remains, the{" "}
            <strong>same agent continues in the same conversation and filesystem state</strong> with only coarse
            feedback — never the failing check itself:
          </p>
          <pre>
            <code>{`The requested behavior is not yet satisfied. Continue working.
The run failed because the required artifact is missing.
The submitted result could not be executed.
The submitted output does not match the required contract.`}</code>
          </pre>
          <p>The contract is deliberately naturalistic. The agent is never told:</p>
          <ul>
            <li>that it is in a benchmark, or that verification is hidden;</li>
            <li>how many submissions, steps, or dollars remain;</li>
            <li>whether a submission is final.</li>
          </ul>
          <p>
            The loop ends at verified success or a scored terminal condition: exhausting the undisclosed verifier
            -submission cap, agent-step guard, or dollar budget; context exhaustion after meaningful progress; or
            giving up. Provider outages, network errors, and harness failures are excluded and retried, not scored. No
            fallback, model switching, ensembling, or fresh retry happens inside a scored row.
          </p>
          <PaperRef href="/paper#7-bounded-repair-loop-protocol">paper §7 — bounded repair-loop protocol</PaperRef>
        </section>

        <section id="metric" className="scroll-mt-24">
          <h2>Three views of one metric</h2>
          <p>
            The headline metric is <strong>reference-budget cost per successful completion</strong>, CPSC
            <sup>B</sup>. Successful rows are charged what they actually spent. Failed rows are charged the task&apos;s
            frozen reference budget B<sub>t</sub> — a task-only failure price, independent of how the row happened to
            stop. For solve probability p and mean successful spend μ<sup>S</sup>:
          </p>

          <div className="my-6 rounded-xl border border-line bg-surface p-5 sm:p-6">
            <div className="eyebrow mb-4">the headline</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-lg text-ink sm:text-xl">
              <span>
                CPSC<sup className="text-sm">B</sup>
              </span>
              <span className="text-muted">=</span>
              <span>
                μ<sup className="text-sm">S</sup>
              </span>
              <span className="text-muted">+</span>
              <Frac num={<span>1 − p</span>} den={<span>p</span>} />
              <span className="text-muted">·</span>
              <span>
                B<sub className="text-sm">t</sub>
              </span>
            </div>
            <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink-2">
              The cost of successful work, plus a <strong className="text-ink">reliability tax</strong>{" "}priced by
              the task&apos;s reference budget.
            </p>
          </div>

          <p>
            A worked example with B<sub>t</sub> = $0.20: configuration A succeeds 90% of the time at $0.04 per success,
            so it scores $0.04 + (0.10 / 0.90) · $0.20 ≈ <strong>$0.062</strong>. Configuration B always succeeds but
            costs $0.08. A is cheaper under the reference-budget policy — though a separate reliability floor may still
            make it ineligible for recommendation.
          </p>
          <p>Two companion views are always published beside the headline, so a recommendation can be checked against the failure convention it depends on:</p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>View</th>
                  <th>Failed rows are charged</th>
                  <th>What it answers</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Reference-budget</strong>
                  </td>
                  <td>
                    the frozen task budget B<sub>t</sub>
                  </td>
                  <td>the headline: a task-only failure price, comparable across models</td>
                </tr>
                <tr>
                  <td>
                    <strong>Realized</strong>
                  </td>
                  <td>their actual observed spend</td>
                  <td>the literal benchmark invoice — what this site&apos;s preview shows today</td>
                </tr>
                <tr>
                  <td>
                    <strong>Escalation</strong>
                  </td>
                  <td>
                    actual spend + the anchor replacement cost R<sub>t</sub>
                  </td>
                  <td>try the candidate, then pay a reference model to redo failures</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Aggregation is a weighted ratio — weighted spend over weighted successes — never an average of per-task
            CPSC values. Cells with zero successes are shown as <em>no verified successes</em>, not dropped. A
            provisional 90% observed solve-rate floor gates recommendations.
          </p>
          <PaperRef href="/paper#8-metric-family">paper §8 — metric family</PaperRef>
        </section>

        <section id="anatomy" className="scroll-mt-24">
          <h2>Category, pressure, budget, scope</h2>
          <p>ShallowSWE separates four properties that are usually collapsed into &ldquo;task size&rdquo;:</p>
          <ul>
            <li>
              <strong>Category</strong> — what kind of work: <em>code</em> (change software behavior),{" "}
              <em>artifact</em> (transform inputs into checked outputs), <em>workflow</em> (operate on repository, tool,
              or system state).
            </li>
            <li>
              <strong>Floor pressure</strong> — measured, not manufactured: how often a frozen economical reference
              configuration solves the task on the first submission. Low ≈ 70–100%, medium ≈ 30–70%, high ≈ 0–40%.
            </li>
            <li>
              <strong>Reference budget B<sub>t</sub></strong> — a calibrated dollar allowance per task, and the
              headline failure charge.
            </li>
            <li>
              <strong>Structural scope</strong> — how much state must be traversed: files, context, artifacts, steps.
              Metadata, not pressure.
            </li>
          </ul>
          <p>
            A task can be broad but easy, or narrow but punishing — the benchmark does not force these axes to
            correlate. The suite is organized by category × pressure; budget and scope stay continuous. Coverage is a
            target, not a quota: if credible routine tasks cannot fill a cell, the cell is reported undercovered rather
            than filled with manufactured pressure.
          </p>
          <PaperRef href="/paper#4-benchmark-overview">paper §4 — benchmark overview</PaperRef>
        </section>

        <section id="calibration" className="scroll-mt-24">
          <h2>Calibration in four phases</h2>
          <p>
            Every constant a score depends on is frozen in order, before the runs it governs. Construct review comes
            before any model calibration; caps freeze before budgets; fresh runs confirm the final policy.
          </p>
          <ol>
            <li>
              <strong>Permissive collection.</strong> Frozen anchor and floor panels run under generous undisclosed
              limits, recording spend, submissions, steps, and first success.
            </li>
            <li>
              <strong>Freeze supervision and liveness.</strong> The hidden verifier-submission cap K is the smallest
              value after which extra feedback adds negligible legitimate success; the step cap is a pooled liveness
              guard that should almost never bind.
            </li>
            <li>
              <strong>Select the reference budget.</strong> B<sub>t</sub> is the smallest pre-registered dollar band in
              which the anchor reaches the coverage target, checked on a held-out split with at most one adjacent band
              increase.
            </li>
            <li>
              <strong>Fresh confirmation.</strong> New anchor replicates run under the exact frozen policy — no budget
              increases allowed — and estimate the replacement cost R<sub>t</sub>: total anchor spend divided by anchor
              successes.
            </li>
          </ol>
          <PaperRef href="/paper#6-calibration">paper §6 — calibration</PaperRef>
        </section>

        <section id="gates" className="scroll-mt-24">
          <h2>Task quality and admission</h2>
          <p>
            Tasks are written from scratch — no adaptations of public issues, patches, or benchmark instances. Before
            any model calibration, every candidate passes a <strong>routine-work construct gate</strong>: at least one
            qualified reviewer who is not the task author rates realism, frequency, delegability, ambiguity, and
            expected effort against a predeclared rubric, and the review is published.
          </p>
          <p>Each task must then execute — not merely declare — its quality evidence:</p>
          <ul>
            <li>prompt–verifier consistency checks;</li>
            <li>a reference solution and a materially different alternate solution that both pass;</li>
            <li>no-op and negative controls that fail;</li>
            <li>feedback-leakage review and clean-sandbox reproducibility.</li>
          </ul>
          <p>
            Verifiers are deterministic and implementation-flexible: every hidden assertion maps to a visible
            requirement or public contract, so materially different valid implementations pass while hardcoded
            fixtures and partial solutions fail. Admission requires the frozen frontier anchor to succeed in one-shot
            mode (provisionally 12/16). Every snapshot publishes the full candidate funnel — authored, rejected at each
            gate, accepted — with reasons.
          </p>
          <PaperRef href="/paper#5-task-sampling-construction-and-quality-assurance">
            paper §5 — task sampling and quality assurance
          </PaperRef>
        </section>

        <section id="tiers" className="scroll-mt-24">
          <h2>Claim tiers</h2>
          <p>Releases come in two classes, and the tier is part of every artifact:</p>
          <ul>
            <li>
              <strong>Protocol-validation pilot.</strong> Six construct-reviewed tasks exercise all four calibration
              phases at small scope. It proposes constants and demonstrates machinery; it supports no global
              leaderboard claim. This is the{" "}
              <a href="/pilot">current stage</a>.
            </li>
            <li>
              <strong>Report-grade snapshot.</strong> A calibrated suite and frozen panel with fresh anchor
              confirmation, all three metric views, provider reconciliation, eligibility extensions, and pre-registered
              rank-stability analysis.
            </li>
          </ul>
          <PaperRef href="/paper#104-claim-tiers-and-rollout-counts">paper §10.4 — claim tiers and rollout counts</PaperRef>
        </section>

        <section id="today" className="scroll-mt-24">
          <h2>What this site shows today</h2>
          <div className="my-5 rounded-xl border border-warn/40 bg-surface p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden />
              <span className="eyebrow" style={{ color: "var(--warn)" }}>
                read this before comparing numbers
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink-2">
              The <Link href="/#chart">leaderboard</Link> reports the existing preview&apos;s{" "}
              <strong className="text-ink">realized repair-loop CPSC</strong>: actual spend over verified successes,
              under fixed preview caps ($5, 20 submissions, 120 steps) at N=3 seeds. The v1 methodology&apos;s headline
              is <strong className="text-ink">reference-budget CPSC</strong>, which requires calibrated per-task
              budgets B<sub>t</sub> that do not exist yet. The preview validates machinery and is nearly saturated (753
              successes in 756 loops); it is not a report-grade ranking, and the two numbers should not be conflated.
            </p>
          </div>
          <PaperRef href="/paper#13-implementation-boundary">paper §1.3 — implementation boundary</PaperRef>
        </section>

        <section id="limits" className="scroll-mt-24">
          <h2>Limitations</h2>
          <ul>
            <li>
              <strong>Within-suite claims only.</strong> The rank belongs to a declared, curated, currently
              Python-heavy basket — not a probability sample of software engineering.
            </li>
            <li>
              <strong>Anchor and convention dependence.</strong> B<sub>t</sub> and R<sub>t</sub> depend on the chosen
              anchor, provider route, and price sheet; sensitivity to them is reported as part of the result.
            </li>
            <li>
              <strong>Supervision shapes behavior.</strong> Even coarse hidden rejection is supervision, and the
              submission cap shapes the repair process.
            </li>
            <li>
              <strong>Small N.</strong> Initial rollout counts support protocol validation and within-suite
              comparisons; near-threshold solve rates and budget tails stay noisy.
            </li>
            <li>
              <strong>Tasks age.</strong> Public tasks lose value for future rankings and require new versions or
              held-out extensions.
            </li>
          </ul>
          <PaperRef href="/paper#13-limitations">paper §13 — limitations</PaperRef>
        </section>
      </article>
    </DocPage>
  );
}
