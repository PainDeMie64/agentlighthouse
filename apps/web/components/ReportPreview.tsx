import { renderMarkdownReport, type ScanResult } from "@agentlighthouse/core";

export function ReportPreview({ result }: { result: ScanResult }) {
  const preview = renderMarkdownReport(result).split("\n").slice(0, 22).join("\n");

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Markdown Preview</h2>
      <pre className="mt-4 max-h-80 overflow-auto rounded-md bg-ink p-4 text-xs leading-5 text-white">
        <code>{preview}</code>
      </pre>
    </section>
  );
}
