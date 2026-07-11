import manifest from "@/content/manifest.json";

const SOURCE_REPO_URL = manifest.source_repo;

export function sourceFileUrl(sourcePath: string): string {
  return `${SOURCE_REPO_URL}/blob/${manifest.source_commit}/${sourcePath}`;
}

export default function Provenance({ doc }: { doc?: "paper" | "pilot_protocol" }) {
  const document = doc ? manifest.documents[doc] : undefined;
  const shortCommit = manifest.source_commit.slice(0, 12);
  const syncedDate = manifest.synced_at.slice(0, 10);

  return (
    <div className="mt-14 border-t border-line pt-5 font-mono text-[0.72rem] leading-relaxed text-muted">
      <p>
        Synced from{" "}
        <a href={`${SOURCE_REPO_URL}/tree/${manifest.source_commit}`} className="text-ink-2 transition-colors hover:text-brand">
          lydakis/ShallowSWE @ {shortCommit}
        </a>{" "}
        on {syncedDate}
        {manifest.source_worktree_dirty ? " (source worktree had uncommitted changes)" : ""}. The benchmark repository is
        the source of truth.
      </p>
      {document && (
        <p className="mt-1">
          <a href={sourceFileUrl(document.source_path)} className="text-ink-2 transition-colors hover:text-brand">
            {document.source_path}
          </a>{" "}
          · sha256 {document.sha256.slice(0, 16)}…
          {!document.committed_in_source && " · not yet committed in source at sync time"}
        </p>
      )}
    </div>
  );
}
