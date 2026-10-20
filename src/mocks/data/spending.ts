// Holds replaceable, API-shaped sample data for the spending insights endpoints.
import type {
  AvailableFilters,
  CustomerProfile,
  SpendingGoals,
  TransactionsResponse,
} from "../../api/types";

export const customerProfile: CustomerProfile = {
  customerId: "12345",
  name: "John Doe",
  email: "john.doe@email.com",
  joinDate: "2023-01-15",
  accountType: "premium",
  totalSpent: 15420.5,
  currency: "ZAR",
};

export const categoryDetails = [
  { name: "Groceries", color: "#FF6B6B", icon: "shopping-cart" },
  { name: "Entertainment", color: "#4ECDC4", icon: "film" },
  { name: "Transportation", color: "#45B7D1", icon: "car" },
  { name: "Dining", color: "#F7DC6F", icon: "utensils" },
  { name: "Shopping", color: "#BB8FCE", icon: "shopping-bag" },
  { name: "Utilities", color: "#85C1E9", icon: "zap" },
] satisfies AvailableFilters["categories"];

const merchantNames: Record<string, string[]> = {
  Groceries: ["Pick n Pay", "Checkers", "Woolworths Food"],
  Entertainment: ["Netflix", "Ster-Kinekor", "Spotify"],
  Transportation: ["Shell", "Uber", "Engen"],
  Dining: ["Nando's", "vida e caffè", "Ocean Basket"],
  Shopping: ["Mr Price", "Takealot", "Edgars"],
  Utilities: ["Eskom", "City Power", "Vodacom"],
};

const mockTransactions: TransactionsResponse["transactions"] = [];

for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
  for (let transactionIndex = 0; transactionIndex < 5; transactionIndex += 1) {
    const category = categoryDetails[(monthIndex + transactionIndex) % categoryDetails.length];
    if (!category) {
      continue;
    }
    const transactionNumber = monthIndex * 5 + transactionIndex;
    const transactionDate = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth() - (11 - monthIndex),
        5 + transactionIndex,
        10 + transactionIndex,
        15,
      ),
    );
    const merchants = merchantNames[category.name] ?? ["Local merchant"];
    const merchant = merchants[transactionNumber % merchants.length];
    if (!merchant) {
      continue;
    }
    mockTransactions.push({
      id: `txn_${String(transactionNumber + 1).padStart(6, "0")}`,
      date: transactionDate.toISOString(),
      merchant,
      category: category.name,
      amount: Number((45 + ((monthIndex * 137 + transactionIndex * 83) % 550) / 10).toFixed(2)),
      description: `${category.name} purchase`,
      paymentMethod: transactionNumber % 2 === 0 ? "Credit Card" : "Debit Card",
      icon: category.icon,
      categoryColor: category.color,
    });
  }
}

export const transactions = mockTransactions;

export const spendingGoals: SpendingGoals = {
  goals: [
    {
      id: "goal_001",
      category: "Entertainment",
      monthlyBudget: 1000,
      currentSpent: 650.3,
      percentageUsed: 65.03,
      daysRemaining: 12,
      status: "on_track",
    },
    {
      id: "goal_002",
      category: "Groceries",
      monthlyBudget: 1500,
      currentSpent: 1450.8,
      percentageUsed: 96.72,
      daysRemaining: 12,
      status: "warning",
    },
    {
      id: "goal_003",
      category: "Shopping",
      monthlyBudget: 1200,
      currentSpent: 430.25,
      percentageUsed: 35.85,
      daysRemaining: 12,
      status: "on_track",
    },
  ],
};

export const availableFilters: AvailableFilters = {
  categories: categoryDetails,
  paymentMethods: [...new Set(mockTransactions.map((transaction) => transaction.paymentMethod))],
  dateRangePresets: [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
    { label: "Last year", value: "1y" },
  ],
};
