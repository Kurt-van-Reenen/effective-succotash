// Compares monthly spending totals in an accessible bar chart and data table.
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, formatMonth } from "./format";
import { useSpendingTrends } from "./hooks";
import { QueryFeedback } from "./QueryFeedback";
import { joinClasses } from "./joinClasses";
import styles from "./Dashboard.module.css";

type TrendsSectionProps = {
  currency: string;
};

export function TrendsSection({ currency }: TrendsSectionProps) {
  const [months, setMonths] = useState(6);
  const trends = useSpendingTrends(months);

  return (
    <section
      className={joinClasses(styles.section, styles.trendSection)}
      aria-labelledby="trends-heading"
    >
      <div className={styles.sectionTitle}>
        <div>
          <p className={styles.eyebrow}>Over time</p>
          <h2 id="trends-heading">Monthly trends</h2>
        </div>
        <label className={styles.compactField}>
          <span>Months shown</span>
          <select
            aria-label="Months shown"
            value={months}
            onChange={(event) => {
              setMonths(Number(event.target.value));
            }}
          >
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
            <option value={24}>24 months</option>
          </select>
        </label>
      </div>
      <QueryFeedback
        title="Monthly trends"
        loading={trends.isLoading}
        error={trends.error}
        empty={!trends.isLoading && !trends.error && trends.data?.trends.length === 0}
        emptyMessage="No monthly spending data is available."
        retry={() => void trends.refetch()}
      />
      {trends.data && trends.data.trends.length > 0 && (
        <>
          <div
            className={styles.trendChart}
            role="img"
            aria-label={`Bar chart of spending totals for ${String(months)} months`}
          >
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={trends.data.trends}
                margin={{ top: 10, right: 8, left: 2, bottom: 4 }}
              >
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                />
                <YAxis
                  width={72}
                  tickFormatter={(amount: number) =>
                    new Intl.NumberFormat("en-ZA", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(amount)
                  }
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={(month) => (typeof month === "string" ? formatMonth(month) : "")}
                  formatter={(amount) => formatMoney(Number(amount), currency)}
                />
                <Bar
                  dataKey="totalSpent"
                  name="Total spent"
                  fill="var(--color-primary)"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className={styles.visuallyHidden}>
            <caption>Monthly spending totals</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Total spent</th>
                <th scope="col">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {trends.data.trends.map((trend) => (
                <tr key={trend.month}>
                  <th scope="row">{formatMonth(trend.month)}</th>
                  <td>{formatMoney(trend.totalSpent, currency)}</td>
                  <td>{trend.transactionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
