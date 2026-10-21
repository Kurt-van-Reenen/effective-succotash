import { expect, test } from "@playwright/test";

test("captures the dashboard for the README", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "John Doe" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Monthly trends" }).locator(".recharts-bar-rectangle"),
  ).not.toHaveCount(0);
  await expect(page.getByRole("status")).toHaveCount(0);
  // The doughnut animates in after its data loads; its slice labels appear only once it has finished.
  await expect(
    page
      .getByRole("img", { name: /Doughnut chart/ })
      .locator("svg text")
      .first(),
  ).toBeVisible();

  await page.screenshot({
    path: `docs/screenshots/dashboard-${testInfo.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
