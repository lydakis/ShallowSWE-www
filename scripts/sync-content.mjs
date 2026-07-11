// Imports the white paper, pilot protocol, and paper PDF from the benchmark
// repository into this site, and records provenance in content/manifest.json.
// The benchmark repo stays the source of truth; re-run after it changes:
//
//   node scripts/sync-content.mjs [path-to-ShallowSWE-repo]
//
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import katex from "katex";

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_REPO = path.resolve(process.argv[2] ?? process.env.SHALLOWSWE_REPO ?? path.join(SITE_ROOT, "..", "ShallowSWE"));

const PAPER_MD = "docs/white-paper-v0.4.2.md";
const PILOT_MD = "docs/six-task-pilot-protocol-v0.3.md";
const PAPER_PDF = "paper/main.pdf";
const FIGURES_DIR = "paper/figures";

const CONTENT_DIR = path.join(SITE_ROOT, "content");
const PUBLIC_PAPER_DIR = path.join(SITE_ROOT, "public", "paper");
const PDF_PUBLIC_PATH = "/paper/shallowswe-working-paper-v0.4.2.pdf";

function fail(message) {
  console.error(`sync-content: ${message}`);
  process.exit(1);
}

function read(relPath) {
  const abs = path.join(SOURCE_REPO, relPath);
  if (!fs.existsSync(abs)) fail(`missing ${abs}`);
  return fs.readFileSync(abs);
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function git(args) {
  return execSync(`git -C ${JSON.stringify(SOURCE_REPO)} ${args}`, { encoding: "utf8" }).trim();
}

// --- gather source state ----------------------------------------------------

const sourceCommit = git("rev-parse HEAD");
const sourceCommitDate = git("log -1 --format=%cI");
const dirtyFiles = git("status --porcelain")
  .split("\n")
  .filter(Boolean)
  .map((line) => line.slice(3));
const isUncommitted = (relPath) => dirtyFiles.some((f) => f === relPath || relPath.startsWith(`${f}/`) || f.startsWith(`${relPath}/`) || f.startsWith(relPath));

const paperMd = read(PAPER_MD).toString("utf8");
const pilotMd = read(PILOT_MD).toString("utf8");
const paperPdf = read(PAPER_PDF);

// --- markdown -> HTML with KaTeX math ----------------------------------------

// Pull \( .. \) and \[ .. \] segments out before markdown parsing so backslashes
// survive, then substitute rendered KaTeX back into the HTML.
function extractMath(markdown) {
  const segments = [];
  const replaced = markdown
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => {
      segments.push({ tex: tex.trim(), display: true });
      return `@@MATH${segments.length - 1}@@`;
    })
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => {
      segments.push({ tex: tex.trim(), display: false });
      return `@@MATH${segments.length - 1}@@`;
    });
  return { replaced, segments };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/@@math\d+@@/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function renderPaper(markdown) {
  // Drop the H1 title and the bold byline lines; the page supplies its own header.
  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length && !lines[i].startsWith("# ")) i += 1;
  i += 1;
  while (i < lines.length && (lines[i].trim() === "" || /^\*\*.*\*\*\s*$/.test(lines[i].trim()))) i += 1;
  const body = lines.slice(i).join("\n");

  const { replaced, segments } = extractMath(body);

  const toc = [];
  const seenSlugs = new Set();
  let inAppendix = false;

  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const plain = tokens.map((t) => t.raw ?? "").join("");
        let slug = slugify(plain);
        while (seenSlugs.has(slug)) slug = `${slug}-x`;
        seenSlugs.add(slug);

        // Source doc: sections are ##, appendices/references are #. Title h1 is
        // already stripped, so any depth-1 heading marks the appendix matter.
        if (depth === 1) inAppendix = true;
        const level = depth === 1 ? 2 : inAppendix ? Math.min(depth + 1, 6) : Math.min(depth, 6);
        if (level === 2) toc.push({ id: slug, label: plain.trim() });
        return `<h${level} id="${slug}">${html}</h${level}>\n`;
      },
      image({ href, text }) {
        const src = href.replace(/^\.\.\/paper\/figures\//, "/paper/figures/");
        return `<figure><img src="${src}" alt="${text}" loading="lazy" /><figcaption>${text}</figcaption></figure>`;
      },
    },
  });

  let html = marked.parse(replaced);
  html = html
    .replace(/<p>(<figure[\s\S]*?<\/figure>)<\/p>/g, "$1")
    .replace(/<table>/g, '<div class="table-scroll"><table>')
    .replace(/<\/table>/g, "</table></div>")
    .replace(/@@MATH(\d+)@@/g, (_, index) => {
      const { tex, display } = segments[Number(index)];
      return katex.renderToString(tex, { displayMode: display, throwOnError: false });
    });

  return { html, toc };
}

const { html: paperHtml, toc: paperToc } = renderPaper(paperMd);

// --- write outputs ------------------------------------------------------------

fs.mkdirSync(CONTENT_DIR, { recursive: true });
fs.mkdirSync(path.join(PUBLIC_PAPER_DIR, "figures"), { recursive: true });

fs.writeFileSync(path.join(CONTENT_DIR, "paper.html"), paperHtml);
fs.writeFileSync(path.join(CONTENT_DIR, "paper-toc.json"), `${JSON.stringify(paperToc, null, 2)}\n`);
fs.writeFileSync(path.join(CONTENT_DIR, "pilot-protocol-v0.3.md"), pilotMd);
fs.writeFileSync(path.join(SITE_ROOT, "public", PDF_PUBLIC_PATH.slice(1)), paperPdf);

const figures = [];
for (const name of fs.readdirSync(path.join(SOURCE_REPO, FIGURES_DIR)).sort()) {
  if (!name.endsWith(".png")) continue;
  const buffer = read(path.join(FIGURES_DIR, name));
  fs.writeFileSync(path.join(PUBLIC_PAPER_DIR, "figures", name), buffer);
  figures.push({ name, sha256: sha256(buffer) });
}

const manifest = {
  schema_version: "shallowswe.www_content_manifest.v1",
  synced_at: new Date().toISOString(),
  source_repo: "https://github.com/lydakis/ShallowSWE",
  source_commit: sourceCommit,
  source_commit_date: sourceCommitDate,
  source_worktree_dirty: dirtyFiles.length > 0,
  methodology_version: "v0.4.2",
  methodology_status: "working paper — freeze candidate, under independent review",
  pilot_protocol_version: "v0.3",
  pilot_status: "independent review in progress; no official runs started",
  documents: {
    paper: {
      source_path: PAPER_MD,
      sha256: sha256(Buffer.from(paperMd)),
      committed_in_source: !isUncommitted(PAPER_MD),
    },
    paper_pdf: {
      source_path: PAPER_PDF,
      public_path: PDF_PUBLIC_PATH,
      sha256: sha256(paperPdf),
      committed_in_source: !isUncommitted(PAPER_PDF),
    },
    pilot_protocol: {
      source_path: PILOT_MD,
      sha256: sha256(Buffer.from(pilotMd)),
      committed_in_source: !isUncommitted(PILOT_MD),
    },
    figures,
  },
};

fs.writeFileSync(path.join(CONTENT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`synced from ${SOURCE_REPO} @ ${sourceCommit.slice(0, 12)}${manifest.source_worktree_dirty ? " (worktree dirty)" : ""}`);
console.log(`  paper: ${manifest.documents.paper.sha256.slice(0, 12)} committed=${manifest.documents.paper.committed_in_source}`);
console.log(`  pilot: ${manifest.documents.pilot_protocol.sha256.slice(0, 12)} committed=${manifest.documents.pilot_protocol.committed_in_source}`);
console.log(`  pdf:   ${manifest.documents.paper_pdf.sha256.slice(0, 12)} -> public${PDF_PUBLIC_PATH}`);
console.log(`  toc:   ${paperToc.length} sections`);
