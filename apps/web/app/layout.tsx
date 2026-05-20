import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentLighthouse",
  description: "Lighthouse for AI agents: scan projects for agent-readiness."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
