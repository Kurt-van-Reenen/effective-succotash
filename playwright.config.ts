import { defineConfig } from "@playwright/test";

// Set PLAYWRIGHT_BASE_URL to test an already-running app, such as the Docker image in CI.
// Without it, Playwright builds the app and serves the production bundle with `vite preview`.
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const previewUrl = "http://localhost:4173";

export default defineConfig({
  testDir: "e2e",
  testIgnore: "**/*.screenshots.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: externalBaseUrl ?? previewUrl,
    trace: "retain-on-failure",
  },
  // One viewport on each side of the 560px and 768px layout breakpoints.
  projects: [
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet",
      use: { browserName: "chromium", viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1280, height: 900 } },
    },
  ],
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: "npm run build && npm run preview -- --port 4173 --strictPort",
          url: previewUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
