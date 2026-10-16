// Simulates the seven spending-insights endpoints with query-aware responses.
import { http, HttpResponse } from "msw";
import { getApiUrl } from "../api/url";
import type { Period, SortBy } from "../api/types";
import {
  availableFilters,
  categoryDetails,
  customerProfile,
  spendingGoals,
  transactions,
} from "./data/spending";

const periodDays: Record<Period, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

function getPeriod(value: string | null): Period {
  if (value === "7d" || value === "90d" || value === "1y") {
    return value;
  }
  return "30d";
}

function getDateBounds(url: URL, period: Period): { start: Date; end: Date } {
  const endDate = url.searchParams.get("endDate");
  const startDate = url.searchParams.get("startDate");
  const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : new Date();
  const start = startDate
    ? new Date(`${startDate}T00:00:00.000Z`)
    : new Date(end.getTime() - periodDays[period] * 24 * 60 * 60 * 1000);
  return { start, end };
}

function filterByDate(source: typeof transactions, url: URL, period: Period): typeof transactions {
  const { start, end } = getDateBounds(url, period);
  return filterByRange(source, start, end);
}

function filterByRange(source: typeof transactions, start: Date, end: Date): typeof transactions {
  return source.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= start && date <= end;
  });
}

function filterByOptionalDate(source: typeof transactions, url: URL): typeof transactions {
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  if (!startDate && !endDate) {
    return source;
  }
  const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null;
  return source.filter((transaction) => {
    const date = new Date(transaction.date);
    return (!start || date >= start) && (!end || date <= end);
  });
}

function totalAmount(items: typeof transactions): number {
  return items.reduce((total, transaction) => total + transaction.amount, 0);
}

function percentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function sortTransactions(source: typeof transactions, sortBy: SortBy): typeof transactions {
  return [...source].sort((first, second) => {
    if (sortBy === "date_asc") {
      return first.date.localeCompare(second.date);
    }
    if (sortBy === "amount_asc") {
      return first.amount - second.amount;
    }
    if (sortBy === "amount_desc") {
      return second.amount - first.amount;
    }
    return second.date.localeCompare(first.date);
  });
}

function getSortBy(value: string | null): SortBy {
  if (value === "date_asc" || value === "amount_desc" || value === "amount_asc") {
    return value;
  }
  return "date_desc";
}

export const handlers = [
  http.get(getApiUrl("customers/:customerId/profile"), ({ params }) =>
    HttpResponse.json({
      ...customerProfile,
      customerId: String(params.customerId),
    }),
  ),
  http.get(getApiUrl("customers/:customerId/spending/summary"), ({ request }) => {
    const url = new URL(request.url);
    const period = getPeriod(url.searchParams.get("period"));
    const currentTransactions = filterByDate(transactions, url, period);
    const currentRange = getDateBounds(url, period);
    const previousEnd = new Date(currentRange.start.getTime() - 1);
    const previousStart = new Date(
      previousEnd.getTime() - periodDays[period] * 24 * 60 * 60 * 1000,
    );
    const previousTransactions = filterByRange(transactions, previousStart, previousEnd);
    const amountsByCategory = new Map<string, number>();
    for (const transaction of currentTransactions) {
      const current = amountsByCategory.get(transaction.category) ?? 0;
      amountsByCategory.set(transaction.category, current + transaction.amount);
    }
    const topCategory =
      [...amountsByCategory.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] ?? "";
    const currentTotal = totalAmount(currentTransactions);
    const previousTotal = totalAmount(previousTransactions);
    return HttpResponse.json({
      period,
      totalSpent: currentTotal,
      transactionCount: currentTransactions.length,
      averageTransaction:
        currentTransactions.length === 0 ? 0 : currentTotal / currentTransactions.length,
      topCategory,
      comparedToPrevious: {
        spentChange: percentageChange(currentTotal, previousTotal),
        transactionChange: percentageChange(
          currentTransactions.length,
          previousTransactions.length,
        ),
      },
    });
  }),
  http.get(getApiUrl("customers/:customerId/spending/categories"), ({ request }) => {
    const url = new URL(request.url);
    const period = getPeriod(url.searchParams.get("period"));
    const filteredTransactions = filterByDate(transactions, url, period);
    const total = totalAmount(filteredTransactions);
    const { start, end } = getDateBounds(url, period);
    const categories = categoryDetails.map((category) => {
      const matching = filteredTransactions.filter(
        (transaction) => transaction.category === category.name,
      );
      const amount = totalAmount(matching);
      return {
        ...category,
        amount,
        percentage: total === 0 ? 0 : Number(((amount / total) * 100).toFixed(1)),
        transactionCount: matching.length,
      };
    });
    return HttpResponse.json({
      dateRange: {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      },
      totalAmount: total,
      categories,
    });
  }),
  http.get(getApiUrl("customers/:customerId/spending/trends"), ({ request }) => {
    const url = new URL(request.url);
    const requestedMonths = Number(url.searchParams.get("months") ?? "12");
    const months = Number.isFinite(requestedMonths)
      ? Math.min(24, Math.max(1, Math.floor(requestedMonths)))
      : 12;
    const trendRows = [];
    for (let monthOffset = Math.min(months, 12) - 1; monthOffset >= 0; monthOffset -= 1) {
      const date = new Date(
        Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - monthOffset, 1),
      );
      const month = `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      const monthTransactions = transactions.filter((transaction) =>
        transaction.date.startsWith(month),
      );
      const totalSpent = totalAmount(monthTransactions);
      trendRows.push({
        month,
        totalSpent,
        transactionCount: monthTransactions.length,
        averageTransaction:
          monthTransactions.length === 0 ? 0 : totalSpent / monthTransactions.length,
      });
    }
    return HttpResponse.json({ trends: trendRows });
  }),
  http.get(getApiUrl("customers/:customerId/transactions"), ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const filteredTransactions = filterByOptionalDate(transactions, url).filter(
      (transaction) => !category || transaction.category === category,
    );
    const sortBy = getSortBy(url.searchParams.get("sortBy"));
    const limitValue = Number(url.searchParams.get("limit") ?? "20");
    const offsetValue = Number(url.searchParams.get("offset") ?? "0");
    const limit = Number.isFinite(limitValue)
      ? Math.min(100, Math.max(1, Math.floor(limitValue)))
      : 20;
    const offset = Number.isFinite(offsetValue) ? Math.max(0, Math.floor(offsetValue)) : 0;
    const sortedTransactions = sortTransactions(filteredTransactions, sortBy);
    const page = sortedTransactions.slice(offset, offset + limit);
    return HttpResponse.json({
      transactions: page,
      pagination: {
        total: filteredTransactions.length,
        limit,
        offset,
        hasMore: offset + page.length < filteredTransactions.length,
      },
    });
  }),
  http.get(getApiUrl("customers/:customerId/goals"), () => HttpResponse.json(spendingGoals)),
  http.get(getApiUrl("customers/:customerId/filters"), () => HttpResponse.json(availableFilters)),
];
