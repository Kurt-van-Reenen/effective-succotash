// Keeps currency, date, and percentage display consistent across the dashboard.
const dateFormatter = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const percentFormatter = new Intl.NumberFormat("en-ZA", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amount);
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

export function formatPercentage(percentage: number): string {
  return `${percentFormatter.format(percentage)}%`;
}

export function formatMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-ZA", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year ?? 2000, (monthNumber ?? 1) - 1, 1)));
}
