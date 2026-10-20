// Provides filterable, sortable transactions with cursor-free load-more paging.
import { useState } from "react";
import { ArrowDown } from "lucide-react";
import type { SortBy } from "../../api/types";
import { CategoryIcon } from "./Icons";
import { formatDate, formatMoney } from "./format";
import { useAvailableFilters, useTransactions } from "./hooks";
import { QueryFeedback } from "./QueryFeedback";
import { joinClasses } from "./joinClasses";
import styles from "./Dashboard.module.css";

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "amount_desc", label: "Highest amount" },
  { value: "amount_asc", label: "Lowest amount" },
];

type TransactionsSectionProps = {
  startDate: string;
  endDate: string;
  invalidRange: boolean;
  currency: string;
};

export function TransactionsSection({
  startDate,
  endDate,
  invalidRange,
  currency,
}: TransactionsSectionProps) {
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const filters = useAvailableFilters();
  const result = useTransactions(
    sortBy,
    category,
    paymentMethod,
    startDate || undefined,
    endDate || undefined,
    !invalidRange,
  );
  const entries = result.data?.pages.flatMap((page) => page.transactions) ?? [];
  const firstPageError = result.isError && entries.length === 0 ? result.error : null;

  return (
    <section
      className={joinClasses(styles.section, styles.transactionsSection)}
      aria-labelledby="transactions-heading"
    >
      <div className={styles.sectionTitle}>
        <div>
          <h2 id="transactions-heading">Recent Transactions</h2>
        </div>
      </div>
      <div className={styles.transactionControls}>
        <label className={styles.field}>
          <span>Filter by category</span>
          <select
            aria-label="Filter transactions by category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
            }}
          >
            <option value="">All categories</option>
            {(filters.data?.categories ?? []).map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Filter by type</span>
          <select
            aria-label="Filter transactions by type"
            value={paymentMethod}
            onChange={(event) => {
              setPaymentMethod(event.target.value);
            }}
          >
            <option value="">All types</option>
            {(filters.data?.paymentMethods ?? []).map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Sort transactions</span>
          <select
            aria-label="Sort transactions"
            value={sortBy}
            onChange={(event) => {
              const selected = sortOptions.find((option) => option.value === event.target.value);
              if (selected) {
                setSortBy(selected.value);
              }
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <QueryFeedback
        title="Transactions"
        loading={!invalidRange && result.isLoading}
        error={invalidRange ? null : firstPageError}
        empty={invalidRange || (!result.isLoading && !firstPageError && entries.length === 0)}
        emptyMessage={
          invalidRange
            ? "Correct the date range to see transactions."
            : "No transactions match these filters."
        }
        retry={() => void result.refetch()}
      />
      {entries.length > 0 && (
        <>
          <div className={styles.transactionTableWrap}>
            <table className={styles.transactionTable}>
              <caption className={styles.visuallyHidden}>Customer transactions</caption>
              <thead>
                <tr>
                  <th scope="col">Merchant</th>
                  <th scope="col">Category</th>
                  <th scope="col">Date</th>
                  <th scope="col">Payment method</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <strong>{transaction.merchant}</strong>
                      <span className={styles.transactionDescription}>
                        {transaction.description}
                      </span>
                    </td>
                    <td>
                      <span className={styles.transactionCategory}>
                        <CategoryIcon name={transaction.icon} />
                        {transaction.category}
                      </span>
                    </td>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td className={styles.amountCell}>
                      {formatMoney(transaction.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.transactionCards}>
            {entries.map((transaction) => (
              <article className={styles.transactionCard} key={transaction.id}>
                <div className={styles.transactionCardHeader}>
                  <div>
                    <h3>{transaction.merchant}</h3>
                    <p>{transaction.description}</p>
                  </div>
                  <strong>{formatMoney(transaction.amount, currency)}</strong>
                </div>
                <div className={styles.transactionCardDetails}>
                  <span className={styles.transactionCategory}>
                    <CategoryIcon name={transaction.icon} />
                    {transaction.category}
                  </span>
                  <span>{formatDate(transaction.date)}</span>
                  <span>{transaction.paymentMethod}</span>
                </div>
              </article>
            ))}
          </div>
          {result.hasNextPage && (
            <button
              className={joinClasses(styles.buttonPrimary, styles.loadMoreButton)}
              type="button"
              onClick={() => void result.fetchNextPage()}
              disabled={result.isFetchingNextPage}
            >
              {result.isFetchingNextPage ? (
                "Loading more..."
              ) : (
                <>
                  <ArrowDown aria-hidden="true" size={17} />
                  Load more transactions
                </>
              )}
            </button>
          )}
          {result.isFetchNextPageError && (
            <div className={styles.inlineError} role="alert">
              <span>More transactions could not be loaded.</span>
              <button
                className={styles.buttonSecondary}
                type="button"
                onClick={() => void result.fetchNextPage()}
              >
                Try again
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
