import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/.tmp/**"],
    include: ["packages/**/*.test.ts"]
  }
});
