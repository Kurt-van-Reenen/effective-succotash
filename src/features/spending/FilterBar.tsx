// Lets customers choose a preset or optional custom date range.
import type { Period } from "../../api/types";
import { useAvailableFilters } from "./hooks";
import { QueryFeedback } from "./QueryFeedback";
import styles from "./Dashboard.module.css";

type FilterBarProps = {
  period: Period;
  startDate: string;
  endDate: string;
  invalidRange: boolean;
  onPeriodChange: (period: Period) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearDates: () => void;
};

export function FilterBar({
  period,
  startDate,
  endDate,
  invalidRange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onClearDates,
}: FilterBarProps) {
  const filters = useAvailableFilters();

  return (
    <section className={styles.filterSection} aria-labelledby="filters-heading">
      <div className={styles.sectionTitle}>
        <div>
          <h2 id="filters-heading">Date range</h2>
        </div>
      </div>
      <QueryFeedback
        title="Date presets"
        loading={filters.isLoading}
        error={filters.error}
        empty={
          !filters.isLoading &&
          !filters.error &&
          (!filters.data || filters.data.dateRangePresets.length === 0)
        }
        emptyMessage="Date presets are not available."
        retry={() => void filters.refetch()}
      />
      <div className={styles.filterControls}>
        <label className={styles.field}>
          <span>Preset period</span>
          <select
            aria-label="Preset period"
            value={period}
            onChange={(event) => {
              const selectedPeriod = filters.data?.dateRangePresets.find(
                (preset) => preset.value === event.target.value,
              );
              if (selectedPeriod) {
                onPeriodChange(selectedPeriod.value);
                onClearDates();
              }
            }}
          >
            {(filters.data?.dateRangePresets ?? []).map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Custom start date</span>
          <input
            aria-label="Custom start date"
            type="date"
            value={startDate}
            onChange={(event) => {
              onStartDateChange(event.target.value);
            }}
          />
        </label>
        <label className={styles.field}>
          <span>Custom end date</span>
          <input
            aria-label="Custom end date"
            type="date"
            value={endDate}
            onChange={(event) => {
              onEndDateChange(event.target.value);
            }}
          />
        </label>
        {(startDate || endDate) && (
          <button
            className={styles.buttonSecondary}
            type="button"
            onClick={() => {
              onClearDates();
            }}
          >
            Clear custom dates
          </button>
        )}
      </div>
      {invalidRange && (
        <p className={styles.validationMessage} role="alert">
          The start date must be on or before the end date.
        </p>
      )}
      {(startDate || endDate) && !invalidRange && (
        <p className={styles.filterNote}>
          Custom dates filter categories and transactions. Summary cards use the selected preset.
        </p>
      )}
    </section>
  );
}
