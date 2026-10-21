import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// WCAG 2.2 level A and AA, the usual bar for public-facing banking apps.
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function waitForDashboard(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "John Doe" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  // Let both charts finish their entry animation so axe sees their final markup and colours.
  await expect(
    page
      .getByRole("img", { name: /Doughnut chart/ })
      .locator("svg text")
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Monthly trends" }).locator(".recharts-bar-rectangle"),
  ).not.toHaveCount(0);
}

async function scan(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

  // List each rule with its failing elements, so a failure says what to fix.
  return results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact ?? "unknown"}): ${violation.help}\n` +
      violation.nodes.map((node) => `  - ${node.target.join(" ")}`).join("\n") +
      `\n  ${violation.helpUrl}`,
  );
}

test("the loaded dashboard has no WCAG 2.2 AA violations", async ({ page }) => {
  await waitForDashboard(page);

  expect(await scan(page)).toEqual([]);
});

test("the invalid date range message has no WCAG 2.2 AA violations", async ({ page }) => {
  await waitForDashboard(page);
  await page.getByLabel("Custom start date").fill("2024-03-10");
  await page.getByLabel("Custom end date").fill("2024-03-01");
  await expect(page.getByRole("alert")).toHaveText(
    "The start date must be on or before the end date.",
  );

  expect(await scan(page)).toEqual([]);
});
