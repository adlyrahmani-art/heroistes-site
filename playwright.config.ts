import { defineConfig, devices } from "@playwright/test";

const headers: Record<string, string> = {};
if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) headers["x-vercel-protection-bypass"] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (process.env.E2E_TOKEN) headers["x-e2e-token"] = process.env.E2E_TOKEN;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    extraHTTPHeaders: headers,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
  ],
});
