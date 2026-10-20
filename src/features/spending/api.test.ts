import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import { server } from "../../test/server";
import {
  getAvailableFilters,
  getCustomerProfile,
  getSpendingCategories,
  getSpendingGoals,
  getSpendingSummary,
  getSpendingTrends,
  getTransactions,
} from "./api";

describe("spending endpoint API functions", () => {
  it("returns validated data from all seven MSW endpoints", async () => {
    const [profile, summary, categories, trends, transactions, goals, filters] = await Promise.all([
      getCustomerProfile(),
      getSpendingSummary("30d"),
      getSpendingCategories("30d"),
      getSpendingTrends(6),
      getTransactions(10, 0, "date_desc"),
      getSpendingGoals(),
      getAvailableFilters(),
    ]);

    expect(profile.customerId).toBe("12345");
    expect(summary.period).toBe("30d");
    expect(categories.categories.length).toBe(6);
    expect(trends.trends.length).toBe(6);
    expect(transactions.transactions).toHaveLength(10);
    expect(transactions.pagination.hasMore).toBe(true);
    expect(goals.goals.length).toBeGreaterThan(0);
    expect(filters.dateRangePresets).toHaveLength(4);
  });

  it("surfaces an HTTP failure instead of returning a successful fallback", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/profile"), () =>
        HttpResponse.json({ message: "Unavailable" }, { status: 503 }),
      ),
    );

    await expect(getCustomerProfile()).rejects.toThrow("503");
  });

  it("rejects a successful response with an invalid Zod shape", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/profile"), () =>
        HttpResponse.json({ customerId: "12345", name: "Missing required fields" }),
      ),
    );

    await expect(getCustomerProfile()).rejects.toThrow("Invalid API response");
  });

  it("rejects unsafe API category colors", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/filters"), () =>
        HttpResponse.json({
          categories: [{ name: "Unsafe", color: "url(javascript:alert(1))", icon: "zap" }],
          paymentMethods: ["Credit Card"],
          dateRangePresets: [{ label: "Last 30 days", value: "30d" }],
        }),
      ),
    );

    await expect(getAvailableFilters()).rejects.toThrow("Invalid API response");
  });
});
