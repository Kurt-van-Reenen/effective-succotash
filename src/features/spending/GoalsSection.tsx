// Shows budget progress and an understandable status for each spending goal.
import { formatMoney, formatPercentage } from "./format";
import { useSpendingGoals } from "./hooks";
import { QueryFeedback } from "./QueryFeedback";
import { joinClasses } from "./joinClasses";
import styles from "./Dashboard.module.css";

type GoalsSectionProps = {
  currency: string;
};

type GoalStatusStyle = "positive" | "warning" | "negative" | "neutral";

function getGoalStatus(status: string): { label: string; style: GoalStatusStyle } {
  if (status === "on_track") {
    return { label: "On track", style: "positive" };
  }
  if (status === "warning") {
    return { label: "Near budget", style: "warning" };
  }
  if (status === "over_budget") {
    return { label: "Over budget", style: "negative" };
  }
  return { label: "Status unavailable", style: "neutral" };
}

export function GoalsSection({ currency }: GoalsSectionProps) {
  const goals = useSpendingGoals();

  return (
    <section
      className={joinClasses(styles.section, styles.goalsSection)}
      aria-labelledby="goals-heading"
    >
      <div className={styles.sectionTitle}>
        <div>
          <h2 id="goals-heading">Spending goals</h2>
        </div>
      </div>
      <QueryFeedback
        title="Spending goals"
        loading={goals.isLoading}
        error={goals.error}
        empty={!goals.isLoading && !goals.error && goals.data?.goals.length === 0}
        emptyMessage="No spending goals have been set."
        retry={() => void goals.refetch()}
      />
      {goals.data && goals.data.goals.length > 0 && (
        <div className={styles.goalList}>
          {goals.data.goals.map((goal) => {
            const status = getGoalStatus(goal.status);
            const progress = Math.min(100, goal.percentageUsed);
            return (
              <article className={styles.goalCard} key={goal.id}>
                <div className={styles.goalHeader}>
                  <h3>{goal.category}</h3>
                  <span className={styles.statusBadge} data-status={status.style}>
                    {status.label}
                  </span>
                </div>
                <div className={styles.goalNumbers}>
                  <span>{formatMoney(goal.currentSpent, currency)} spent</span>
                  <span>of {formatMoney(goal.monthlyBudget, currency)}</span>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressBar}
                    role="progressbar"
                    aria-label={`${goal.category} budget used`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    style={{ width: `${String(progress)}%` }}
                  />
                </div>
                <div className={styles.goalFooter}>
                  <span>{formatPercentage(goal.percentageUsed)} used</span>
                  <span>{goal.daysRemaining} days remaining</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
