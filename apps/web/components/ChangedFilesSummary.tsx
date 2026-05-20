import type { ComparisonResult } from "@agentlighthouse/core";

export function ChangedFilesSummary({ comparison }: { comparison: ComparisonResult }) {
  const files = comparison.prImpact?.changedFiles.slice(0, 6) ?? [];
  if (files.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Changed Files</h2>
      <div className="mt-3 divide-y divide-black/10">
        {files.map((file) => (
          <div key={`${file.status}-${file.oldPath ?? ""}-${file.path}`} className="py-2 text-sm">
            <span className="mr-2 rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {file.status}
            </span>
            <span className="font-mono text-ink">
              {file.oldPath ? `${file.oldPath} -> ` : ""}
              {file.path}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
