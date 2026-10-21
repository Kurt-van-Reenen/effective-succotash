import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

// Captures the README screenshots. Run with `npm run screenshots`; not part of the test suite.
export default defineConfig({
  ...baseConfig,
  testIgnore: [],
  testMatch: "**/*.screenshots.ts",
  projects: (baseConfig.projects ?? []).filter((project) => project.name !== "tablet"),
});
