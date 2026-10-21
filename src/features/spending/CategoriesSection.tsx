// Renders sorted category spending as a doughnut chart and text legend.
import { Pie, PieChart, ResponsiveContainer, Tooltip, type PieLabelRenderProps } from "recharts";
import type { Period } from "../../api/types";
import { CategoryIcon } from "./Icons";
import { formatMoney, formatPercentage } from "./format";
import { useSpendingCategories } from "./hooks";
import { QueryFeedback } from "./QueryFeedback";
import { joinClasses } from "./joinClasses";
import styles from "./Dashboard.module.css";

// Slices below this share are too narrow to fit a readable label.
const MIN_LABELLED_PERCENTAGE = 5;
const RADIAN = Math.PI / 180;

// Picks dark or light text so slice labels stay readable on any category color.
function getContrastingTextColor(hex: string): string {
  const linearChannel = (start: number) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * linearChannel(1) + 0.7152 * linearChannel(3) + 0.0722 * linearChannel(5);
  return luminance > 0.4 ? "#0a2160" : "#ffffff";
}

function renderSliceLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  payload,
}: PieLabelRenderProps) {
  const { percentage, color } = payload as { percentage: number; color: string };
  if (percentage < MIN_LABELLED_PERCENTAGE) return null;

  const radius = (innerRadius + outerRadius) / 2;
  const angle = -(midAngle ?? 0) * RADIAN;

  return (
    <text
      x={cx + radius * Math.cos(angle)}
      y={cy + radius * Math.sin(angle)}
      fill={getContrastingTextColor(color)}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
      aria-hidden="true"
    >
      {formatPercentage(percentage)}
    </text>
  );
}

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
  const totalSpent = formatMoney(categories.data?.totalAmount ?? 0, currency);

  return (
    <section
      className={joinClasses(styles.section, styles.categorySection)}
      aria-labelledby="categories-heading"
    >
      <div className={styles.sectionTitle}>
        <div>
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
            aria-label={`Doughnut chart of spending by category, totalling ${totalSpent}. Category names, amounts, and percentages are listed in the legend.`}
          >
            <div className={styles.chartCenter} aria-hidden="true">
              <span className={styles.chartCenterLabel}>Total spent</span>
              <span className={styles.chartCenterValue}>{totalSpent}</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sortedCategories.map((category) => ({
                    ...category,
                    fill: category.color,
                  }))}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={108}
                  paddingAngle={2}
                  stroke="none"
                  label={renderSliceLabel}
                  labelLine={false}
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
