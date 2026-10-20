// Defines the typed network requests for customer spending insights.
import { getJson } from "../../api/client";
import type { Period, SortBy } from "../../api/types";
import {
  AvailableFiltersSchema,
  CustomerProfileSchema,
  SpendingCategoriesSchema,
  SpendingGoalsSchema,
  SpendingSummarySchema,
  SpendingTrendsSchema,
  TransactionsResponseSchema,
} from "../../api/types";

const customerId = encodeURIComponent(import.meta.env.VITE_CUSTOMER_ID || "12345");
const customerPath = `customers/${customerId}`;

function buildQuery(parameters: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== "") {
      query.set(key, value);
    }
  }
  return query.toString();
}

export function getCustomerProfile() {
  return getJson(`${customerPath}/profile`, CustomerProfileSchema);
}

export function getSpendingSummary(period: Period) {
  const query = buildQuery({ period });
  return getJson(`${customerPath}/spending/summary?${query}`, SpendingSummarySchema);
}

export function getSpendingCategories(period: Period, startDate?: string, endDate?: string) {
  const query = buildQuery({ period, startDate, endDate });
  return getJson(`${customerPath}/spending/categories?${query}`, SpendingCategoriesSchema);
}

export function getSpendingTrends(months: number) {
  const query = buildQuery({ months: String(months) });
  return getJson(`${customerPath}/spending/trends?${query}`, SpendingTrendsSchema);
}

export function getTransactions(
  limit: number,
  offset: number,
  sortBy: SortBy,
  category?: string,
  paymentMethod?: string,
  startDate?: string,
  endDate?: string,
) {
  const query = buildQuery({
    limit: String(limit),
    offset: String(offset),
    sortBy,
    category,
    paymentMethod,
    startDate,
    endDate,
  });
  return getJson(`${customerPath}/transactions?${query}`, TransactionsResponseSchema);
}

export function getSpendingGoals() {
  return getJson(`${customerPath}/goals`, SpendingGoalsSchema);
}

export function getAvailableFilters() {
  return getJson(`${customerPath}/filters`, AvailableFiltersSchema);
}
