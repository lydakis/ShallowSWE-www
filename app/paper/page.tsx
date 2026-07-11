import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import DocPage from "@/components/docs/DocPage";
import { sourceFileUrl } from "@/components/docs/Provenance";
import manifest from "@/content/manifest.json";
import paperToc from "@/content/paper-toc.json";
import { SITE_URL } from "@/lib/site";

const PAPER_TITLE = "ShallowSWE: Measuring Reference-Budget Cost per Verified Completion on Routine Software Work";
const PDF_PATH = manifest.documents.paper_pdf.public_path;

export const metadata: Metadata = {
  title: "Working paper",
  description:
    "The ShallowSWE methodology white paper (v0.4.2, freeze candidate): reference-budget cost per successful completion on routine software work. Web version and PDF.",
  alternates: { canonical: "/paper" },
};

const paperHtml = fs.readFileSync(path.join(process.cwd(), "content", "paper.html"), "utf8");

const BIBTEX = `@techreport{lydakis2026shallowswe,
  author = {Lydakis, George},
  title  = {ShallowSWE: Measuring Reference-Budget Cost per
            Verified Completion on Routine Software Work},
  year   = {2026},
  month  = jul,
  note   = {Working paper v0.4.2, freeze candidate},
  url    = {${SITE_URL}/paper}
}`;

export default function PaperPage() {
  return (
    <DocPage
      eyebrow="Research · working paper"
      title={PAPER_TITLE}
      chips={[
        { label: `Working paper ${manifest.methodology_version}` },
        { label: "Freeze candidate · under independent review", tone: "warn" },
        { label: "Pilot not yet executed" },
      ]}
      lede={
        <>
          <p>
            George Lydakis · July 2026. This is the full methodology paper, rendered from the benchmark repository. For
            the five-minute version, read the{" "}
            <a href="/methodology" className="text-brand underline decoration-brand/35 underline-offset-3 hover:decoration-brand">
              methodology overview
            </a>
            .
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={PDF_PATH}
              download
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5"
              style={{ color: "var(--plane)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download PDF
            </a>
            <a
              href={sourceFileUrl(manifest.documents.paper.source_path)}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Source markdown
            </a>
          </div>
        </>
      }
      toc={[...paperToc, { id: "cite", label: "How to cite" }]}
      provenanceDoc="paper"
    >
      <article className="doc-prose" dangerouslySetInnerHTML={{ __html: paperHtml }} />

      <section id="cite" className="mt-14 scroll-mt-24">
        <h2 className="font-display text-2xl text-ink">How to cite</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          This draft has a stable URL at{" "}
          <span className="font-mono text-ink">{SITE_URL.replace("https://", "")}/paper</span>. It is not yet on arXiv;
          when it is, the citation below will be updated without replacing this archived draft.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface-2 p-4 font-mono text-[0.78rem] leading-relaxed text-ink-2">
          {BIBTEX}
        </pre>
        <div className="mt-6 rounded-xl border border-line bg-surface p-4">
          <div className="eyebrow mb-3">Version history</div>
          <ul className="space-y-2 text-sm text-ink-2">
            <li className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-[0.78rem] text-ink">v0.4.2</span>
              <span className="font-mono text-[0.78rem] text-muted">2026-07-11</span>
              <span>Freeze candidate; under independent review. Current version.</span>
            </li>
            <li className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-[0.78rem] text-ink">arXiv</span>
              <span>Not yet posted; pending pilot execution and review.</span>
            </li>
          </ul>
        </div>
      </section>
    </DocPage>
  );
}
