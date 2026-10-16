// Coordinates the dashboard filters and places its seven sections in order.
import { useState } from "react";
import type { Period } from "../../api/types";
import { CategoriesSection } from "./CategoriesSection";
import { CustomerHeader } from "./CustomerHeader";
import { FilterBar } from "./FilterBar";
import { GoalsSection } from "./GoalsSection";
import { SummarySection } from "./SummarySection";
import { TransactionsSection } from "./TransactionsSection";
import { TrendsSection } from "./TrendsSection";
import { useCustomerProfile } from "./hooks";
import styles from "./Dashboard.module.css";

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const profile = useCustomerProfile();
  const currency = profile.data?.currency ?? "ZAR";
  const invalidRange = startDate !== "" && endDate !== "" && startDate > endDate;

  return (
    <main className={styles.dashboardGrid}>
      <CustomerHeader />
      <FilterBar
        period={period}
        startDate={startDate}
        endDate={endDate}
        invalidRange={invalidRange}
        onPeriodChange={setPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearDates={() => {
          setStartDate("");
          setEndDate("");
        }}
      />
      <SummarySection period={period} currency={currency} />
      <CategoriesSection
        period={period}
        startDate={startDate}
        endDate={endDate}
        invalidRange={invalidRange}
        currency={currency}
      />
      <TrendsSection currency={currency} />
      <GoalsSection currency={currency} />
      <TransactionsSection
        startDate={startDate}
        endDate={endDate}
        invalidRange={invalidRange}
        currency={currency}
      />
    </main>
  );
}
