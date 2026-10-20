// Renders sorted category spending as a doughnut chart and text legend.
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Period } from "../../api/types";
import { CategoryIcon } from "./Icons";
import { formatMoney, formatPercentage } from "./format";
import { useSpendingCategories } from "./hooks";
import { QueryFeedback } from "./QueryFeedback";
import { joinClasses } from "./joinClasses";
import styles from "./Dashboard.module.css";

type CategoriesSectionProps = {
  period: Period;
  startDate: string;
  endDate: string;
  invalidRange: boolean;
  currency: string;
};

export function CategoriesSection({
  period,
  startDate,
  endDate,
  invalidRange,
  currency,
}: CategoriesSectionProps) {
  const categories = useSpendingCategories(
    period,
    startDate || undefined,
    endDate || undefined,
    !invalidRange,
  );
  const sortedCategories = (categories.data?.categories ?? [])
    .filter((category) => category.amount > 0)
    .sort((first, second) => second.amount - first.amount);

  return (
    <section
      className={joinClasses(styles.section, styles.categorySection)}
      aria-labelledby="categories-heading"
    >
      <div className={styles.sectionTitle}>
        <div>
          <p className={styles.eyebrow}>Where it goes</p>
          <h2 id="categories-heading">Spending by category</h2>
        </div>
      </div>
      <QueryFeedback
        title="Category spending"
        loading={!invalidRange && categories.isLoading}
        error={invalidRange ? null : categories.error}
        empty={
          invalidRange ||
          (!categories.isLoading && !categories.error && sortedCategories.length === 0)
        }
        emptyMessage={
          invalidRange
            ? "Correct the date range to see category spending."
            : "No category spending for this period."
        }
        retry={() => void categories.refetch()}
      />
      {!invalidRange && sortedCategories.length > 0 && (
        <div className={styles.categoryLayout}>
          <div
            className={styles.chartWrap}
            role="img"
            aria-label="Doughnut chart of spending by category. Category names, amounts, and percentages are listed in the legend."
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sortedCategories.map((category) => ({
                    ...category,
                    fill: category.color,
                  }))}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={105}
                  paddingAngle={2}
                  stroke="none"
                />
                <Tooltip formatter={(value) => formatMoney(Number(value), currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul
            className={styles.categoryLegend}
            aria-label="Category spending amounts and percentages"
          >
            {sortedCategories.map((category) => (
              <li className={styles.categoryLegendItem} key={category.name}>
                <span
                  className={styles.categoryIcon}
                  style={
                    { "--category-color": category.color } as React.CSSProperties & {
                      "--category-color": string;
                    }
                  }
                  aria-hidden="true"
                >
                  <CategoryIcon name={category.icon} />
                </span>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryAmount}>
                  {formatMoney(category.amount, currency)}
                </span>
                <span className={styles.categoryPercentage}>
                  {formatPercentage(category.percentage)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
