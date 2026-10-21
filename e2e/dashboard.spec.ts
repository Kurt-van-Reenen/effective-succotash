import { expect, test, type Page } from "@playwright/test";

// Layout breakpoints from Dashboard.module.css.
const wideLayoutMinWidth = 768;
const transactionTableMinWidth = 1024;

function viewportWidth(page: Page): number {
  return page.viewportSize()?.width ?? 0;
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

test("shows transactions as cards below 1024px and as a table above", async ({ page }) => {
  const transactions = page.getByRole("region", { name: "Recent Transactions" });
  const table = transactions.getByRole("table", { name: "Customer transactions" });
  const firstCard = transactions.getByRole("article").first();

  if (viewportWidth(page) >= transactionTableMinWidth) {
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

  expect(rows).toBe(viewportWidth(page) >= wideLayoutMinWidth ? 1 : 2);
});

test("fits the whole transaction table from the table breakpoint up", async ({ page }) => {
  test.skip(viewportWidth(page) < transactionTableMinWidth, "Narrower screens show cards");

  // Check the narrowest table width as well as this project's own width.
  for (const width of [transactionTableMinWidth, viewportWidth(page)]) {
    await page.setViewportSize({ width, height: 900 });
    const table = page.getByRole("table", { name: "Customer transactions" });
    await expect(table).toBeVisible();

    const overflow = await table.evaluate((element) => {
      const wrapper = element.parentElement;
      return wrapper ? wrapper.scrollWidth - wrapper.clientWidth : 0;
    });

    expect(overflow, `table overflow at ${String(width)}px`).toBeLessThanOrEqual(0);
  }
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
