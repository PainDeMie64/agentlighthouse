import type { ChangedFile, ChangedFileSource, ChangedFileStatus } from "../schemas/types.js";

const gitStatusMap: Record<string, ChangedFileStatus> = {
  A: "added",
  M: "modified",
  D: "deleted",
  R: "renamed",
  C: "copied"
};

export function normalizeChangedPath(filePath: string): string {
  return filePath
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "");
}

export function parseChangedFilesText(
  content: string,
  source: ChangedFileSource = "explicit"
): ChangedFile[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseChangedFileLine(line, source))
    .filter((file) => file.path);
}

export function parseGitNameStatus(
  output: string,
  source: ChangedFileSource = "git"
): ChangedFile[] {
  if (output.includes("\0")) {
    return parseNullDelimitedNameStatus(output, source);
  }
  return parseChangedFilesText(output, source);
}

function parseNullDelimitedNameStatus(output: string, source: ChangedFileSource): ChangedFile[] {
  const tokens = output.split("\0").filter(Boolean);
  const files: ChangedFile[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const statusToken = tokens[index] ?? "";
    const status = mapStatus(statusToken);
    if (status === "renamed" || status === "copied") {
      files.push({
        path: normalizeChangedPath(tokens[index + 2] ?? ""),
        oldPath: normalizeChangedPath(tokens[index + 1] ?? ""),
        status,
        source
      });
      index += 2;
      continue;
    }
    files.push({
      path: normalizeChangedPath(tokens[index + 1] ?? statusToken),
      status,
      source
    });
    index += 1;
  }
  return files.filter((file) => file.path);
}

function parseChangedFileLine(line: string, source: ChangedFileSource): ChangedFile {
  const parts = line.split("\t");
  if (parts.length >= 2) {
    const status = mapStatus(parts[0] ?? "");
    if ((status === "renamed" || status === "copied") && parts.length >= 3) {
      return {
        path: normalizeChangedPath(parts[2] ?? ""),
        oldPath: normalizeChangedPath(parts[1] ?? ""),
        status,
        source
      };
    }
    return { path: normalizeChangedPath(parts[1] ?? ""), status, source };
  }
  return { path: normalizeChangedPath(line), status: "modified", source };
}

function mapStatus(statusToken: string): ChangedFileStatus {
  return gitStatusMap[statusToken.charAt(0).toUpperCase()] ?? "unknown";
}
