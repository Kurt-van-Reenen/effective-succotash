import { expect, test, type Page } from "@playwright/test";

const tableLayoutMinWidth = 768;

function isTableLayout(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) >= tableLayoutMinWidth;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // The profile is the first endpoint the dashboard needs; once it renders, the mock API is serving.
  await expect(page.getByRole("heading", { level: 1, name: "John Doe" })).toBeVisible();
});

test("shows every dashboard section", async ({ page }) => {
  for (const heading of [
    "Date range",
    "Spending summary",
    "Spending by category",
    "Monthly trends",
    "Spending goals",
    "Recent Transactions",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
});

test("fits the viewport without horizontal scrolling", async ({ page }) => {
  await expect(page.getByRole("table", { name: "Monthly spending totals" })).toBeAttached();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
});

test("switches transactions between cards and a table at the tablet breakpoint", async ({
  page,
}) => {
  const transactions = page.getByRole("region", { name: "Recent Transactions" });
  const table = transactions.getByRole("table", { name: "Customer transactions" });
  const firstCard = transactions.getByRole("article").first();

  if (isTableLayout(page)) {
    await expect(table).toBeVisible();
    await expect(firstCard).toBeHidden();
  } else {
    await expect(firstCard).toBeVisible();
    await expect(table).toBeHidden();
  }
});

test("places summary cards in one row only on wide screens", async ({ page }) => {
  const cards = page.getByRole("region", { name: "Spending summary" }).getByRole("article");
  await expect(cards).toHaveCount(4);

  const tops = await cards.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().top)),
  );
  const rows = new Set(tops).size;

  expect(rows).toBe(isTableLayout(page) ? 1 : 2);
});

test("draws the monthly trend chart and redraws it for a longer range", async ({ page }) => {
  const trends = page.getByRole("region", { name: "Monthly trends" });
  const bars = trends.locator(".recharts-bar-rectangle");

  await expect(bars).toHaveCount(6);

  await trends.getByLabel("Months shown").selectOption("12");

  await expect(trends.getByRole("img", { name: /for 12 months/ })).toBeVisible();
  await expect(bars).toHaveCount(12);
});

test("keeps the category doughnut inside its chart area", async ({ page }) => {
  const chart = page.getByRole("img", { name: /Doughnut chart of spending by category/ });
  const sectors = chart.locator(".recharts-sector");

  await expect(sectors).toHaveCount(5);
  // Slice labels appear once the entry animation has finished.
  // The doughnut has no axes, so its only SVG text is the slice labels.
  await expect(chart.locator("svg text").first()).toBeVisible();

  const overflow = await chart.evaluate((element) => {
    const chartRect = element.getBoundingClientRect();
    const ringRects = [...element.querySelectorAll(".recharts-sector")].map((sector) =>
      sector.getBoundingClientRect(),
    );
    const left = Math.min(...ringRects.map((rect) => rect.left));
    const right = Math.max(...ringRects.map((rect) => rect.right));
    return Math.max(chartRect.left - left, right - chartRect.right);
  });

  // Allow one pixel for anti-aliasing.
  expect(overflow).toBeLessThanOrEqual(1);
});

test("loads without console errors or blocked resources", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    problems.push(error.message);
  });

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "John Doe" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Monthly trends" }).locator(".recharts-bar-rectangle"),
  ).not.toHaveCount(0);

  expect(problems).toEqual([]);
});
