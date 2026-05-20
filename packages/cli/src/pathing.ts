import path from "node:path";

export function resolveFromInvocationCwd(targetPath: string): string {
  if (path.isAbsolute(targetPath)) {
    return targetPath;
  }
  return path.resolve(process.env.INIT_CWD ?? process.cwd(), targetPath);
}
