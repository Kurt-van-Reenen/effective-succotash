import { z } from "zod";

const HexColorSchema = z.string().regex(/^#[\da-f]{6}$/i, "Expected a six-digit hex color.");

const PeriodSchema = z.enum(["7d", "30d", "90d", "1y"]);
const SortBySchema = z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]);

const CategorySchema = z.object({
  name: z.string().min(1),
  color: HexColorSchema,
  icon: z.string().min(1),
});

export const CustomerProfileSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  joinDate: z.iso.date(),
  accountType: z.string().min(1),
  totalSpent: z.number().nonnegative(),
  currency: z.string().length(3),
});

export const SpendingSummarySchema = z.object({
  period: PeriodSchema,
  totalSpent: z.number().nonnegative(),
  transactionCount: z.number().int().nonnegative(),
  averageTransaction: z.number().nonnegative(),
  topCategory: z.string(),
  comparedToPrevious: z.object({
    spentChange: z.number(),
    transactionChange: z.number(),
  }),
});

export const SpendingCategoriesSchema = z.object({
  dateRange: z.object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
  }),
  totalAmount: z.number().nonnegative(),
  categories: z.array(
    CategorySchema.extend({
      amount: z.number().nonnegative(),
      percentage: z.number().nonnegative(),
      transactionCount: z.number().int().nonnegative(),
    }),
  ),
});

export const SpendingTrendsSchema = z.object({
  trends: z.array(
    z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      totalSpent: z.number().nonnegative(),
      transactionCount: z.number().int().nonnegative(),
      averageTransaction: z.number().nonnegative(),
    }),
  ),
});

export const TransactionsResponseSchema = z.object({
  transactions: z.array(
    z.object({
      id: z.string().min(1),
      date: z.iso.datetime({ offset: true }),
      merchant: z.string().min(1),
      category: z.string().min(1),
      amount: z.number().nonnegative(),
      description: z.string(),
      paymentMethod: z.string().min(1),
      icon: z.string().min(1),
      categoryColor: HexColorSchema,
    }),
  ),
  pagination: z.object({
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  }),
});

export const SpendingGoalsSchema = z.object({
  goals: z.array(
    z.object({
      id: z.string().min(1),
      category: z.string().min(1),
      monthlyBudget: z.number().nonnegative(),
      currentSpent: z.number().nonnegative(),
      percentageUsed: z.number().nonnegative(),
      daysRemaining: z.number().int().nonnegative(),
      status: z.string(),
    }),
  ),
});

export const AvailableFiltersSchema = z.object({
  categories: z.array(CategorySchema),
  dateRangePresets: z.array(
    z.object({
      label: z.string().min(1),
      value: PeriodSchema,
    }),
  ),
});

export type Period = z.infer<typeof PeriodSchema>;
export type SortBy = z.infer<typeof SortBySchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;
export type SpendingSummary = z.infer<typeof SpendingSummarySchema>;
export type SpendingCategories = z.infer<typeof SpendingCategoriesSchema>;
export type SpendingTrends = z.infer<typeof SpendingTrendsSchema>;
export type TransactionsResponse = z.infer<typeof TransactionsResponseSchema>;
export type SpendingGoals = z.infer<typeof SpendingGoalsSchema>;
export type AvailableFilters = z.infer<typeof AvailableFiltersSchema>;
