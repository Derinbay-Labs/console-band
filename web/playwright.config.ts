import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env["PLAYWRIGHT_PORT"] ?? 3200);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : undefined,
  reporter: process.env["CI"] ? [["github"], ["line"]] : "line",
  use: { baseURL: BASE_URL, trace: "on-first-retry", screenshot: "only-on-failure" },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      name: "mobile-390",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  // The site is a static export: `npm run build` first, then out/ is served as plain files.
  webServer: {
    command: `node scripts/serve-out.mjs ${PORT}`,
    url: `${BASE_URL}/en/`,
    reuseExistingServer: !process.env["CI"],
    timeout: 30_000,
  },
});
