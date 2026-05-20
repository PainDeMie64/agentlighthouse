import Link from "next/link";
import { Terminal } from "lucide-react";

export function ProductHeader() {
  return (
    <header className="border-b border-black/10 bg-paper/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-normal text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
            AL
          </span>
          <span>AgentLighthouse</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-ink/70 hover:text-ink">
            Dashboard
          </Link>
          <a
            href="#cli"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 font-medium text-white hover:bg-black"
          >
            <Terminal className="h-4 w-4" aria-hidden="true" />
            CLI
          </a>
        </nav>
      </div>
    </header>
  );
}
