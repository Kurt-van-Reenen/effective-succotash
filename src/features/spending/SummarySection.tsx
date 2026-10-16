// Displays four key spending metrics and their previous-period comparisons.
import { TrendingDown, TrendingUp } from "lucide-react";
import type { Period } from "../../api/types";
import { formatMoney, formatPercentage } from "./format";
import { useSpendingSummary } from "./hooks";
import { QueryFeedback } from "./QueryFeedback";
import styles from "./Dashboard.module.css";

type SummarySectionProps = {
  period: Period;
  currency: string;
};

function Comparison({ percentage, label }: { percentage: number; label: string }) {
  const increased = percentage > 0;
  const Icon = increased ? TrendingUp : TrendingDown;
  const direction = increased ? "Higher" : percentage < 0 ? "Lower" : "Unchanged";
  return (
    <span className={styles.comparison}>
      {percentage !== 0 && <Icon aria-hidden="true" size={16} />}
      {direction} {formatPercentage(Math.abs(percentage))} {label}
    </span>
  );
}

export function SummarySection({ period, currency }: SummarySectionProps) {
  const summary = useSpendingSummary(period);

  return (
    <section className={styles.section} aria-labelledby="summary-heading">
      <div className={styles.sectionTitle}>
        <div>
          <p className={styles.eyebrow}>At a glance</p>
          <h2 id="summary-heading">Spending summary</h2>
        </div>
      </div>
      <QueryFeedback
        title="Spending summary"
        loading={summary.isLoading}
        error={summary.error}
        empty={!summary.isLoading && !summary.error && !summary.data}
        emptyMessage="No summary is available for this period."
        retry={() => void summary.refetch()}
      />
      {summary.data && (
        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span className={styles.metricLabel}>Total spent</span>
            <strong>{formatMoney(summary.data.totalSpent, currency)}</strong>
            <Comparison
              percentage={summary.data.comparedToPrevious.spentChange}
              label="vs previous period"
            />
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.metricLabel}>Transactions</span>
            <strong>{summary.data.transactionCount}</strong>
            <Comparison
              percentage={summary.data.comparedToPrevious.transactionChange}
              label="vs previous period"
            />
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.metricLabel}>Average transaction</span>
            <strong>{formatMoney(summary.data.averageTransaction, currency)}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.metricLabel}>Top category</span>
            <strong>{summary.data.topCategory || "No spending"}</strong>
          </article>
        </div>
      )}
    </section>
  );
}
