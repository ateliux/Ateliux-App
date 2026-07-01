import { defineConfig, devices } from "@playwright/test";
import { getE2EEnv, loadE2EEnvFiles } from "./e2e/helpers/env";

loadE2EEnvFiles();

const env = getE2EEnv();
const shouldStartServers = process.env.E2E_START_SERVERS === "true";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: env.frontendUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: shouldStartServers
    ? [
        {
          command: "npm run start:dev",
          cwd: "./backend",
          url: `${env.apiUrl}health`,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: "npm run dev -- -p 3002",
          cwd: "./admin",
          url: env.adminUrl,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: "npm run dev",
          cwd: "./frontend",
          url: env.frontendUrl,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ]
    : undefined,
});
