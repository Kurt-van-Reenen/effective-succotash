// Provides one cached query hook for each customer spending endpoint.
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Period, SortBy } from "../../api/types";
import {
  getAvailableFilters,
  getCustomerProfile,
  getSpendingCategories,
  getSpendingGoals,
  getSpendingSummary,
  getSpendingTrends,
  getTransactions,
} from "./api";

const transactionPageSize = 10;

export function useCustomerProfile() {
  return useQuery({
    queryKey: ["customer", "profile"],
    queryFn: getCustomerProfile,
  });
}

export function useSpendingSummary(period: Period) {
  return useQuery({
    queryKey: ["spending", "summary", period],
    queryFn: () => getSpendingSummary(period),
  });
}

export function useSpendingCategories(
  period: Period,
  startDate?: string,
  endDate?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["spending", "categories", period, startDate, endDate],
    queryFn: () => getSpendingCategories(period, startDate, endDate),
    enabled,
  });
}

export function useSpendingTrends(months: number) {
  return useQuery({
    queryKey: ["spending", "trends", months],
    queryFn: () => getSpendingTrends(months),
  });
}

export function useTransactions(
  sortBy: SortBy,
  category: string,
  startDate?: string,
  endDate?: string,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ["transactions", sortBy, category, startDate, endDate],
    queryFn: ({ pageParam }) =>
      getTransactions(transactionPageSize, pageParam, sortBy, category, startDate, endDate),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) {
        return undefined;
      }
      return lastPage.pagination.offset + lastPage.pagination.limit;
    },
    enabled,
  });
}

export function useSpendingGoals() {
  return useQuery({
    queryKey: ["spending", "goals"],
    queryFn: getSpendingGoals,
  });
}

export function useAvailableFilters() {
  return useQuery({
    queryKey: ["spending", "filters"],
    queryFn: getAvailableFilters,
  });
}
