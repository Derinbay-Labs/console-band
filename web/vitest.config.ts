import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // An explicit alias: tsconfigPaths would also scan the plugin's own plugin/tsconfig.json.
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Playwright owns e2e; vitest must not try to run those specs.
    exclude: ["e2e/**", "node_modules/**", ".next/**", "out/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        // Route/layout wiring and static copy: exercised by the Playwright smoke suite.
        "src/app/**",
        "src/content/en.ts",
        "src/content/tr.ts",
        "src/content/types.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
      ],
      thresholds: { lines: 90, branches: 80, functions: 90, statements: 90 },
    },
  },
});
