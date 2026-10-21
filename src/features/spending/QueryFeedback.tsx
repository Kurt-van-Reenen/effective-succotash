// Renders consistent loading, error, retry, and empty states for one section.
import { useEffect, type ReactNode } from "react";
import { joinClasses } from "./joinClasses";
import styles from "./Dashboard.module.css";

type QueryFeedbackProps = {
  title: string;
  loading: boolean;
  error: Error | null;
  empty: boolean;
  emptyMessage: string;
  retry: () => void;
  children?: ReactNode;
};

export function QueryFeedback({
  title,
  loading,
  error,
  empty,
  emptyMessage,
  retry,
  children,
}: QueryFeedbackProps) {
  // Technical details (URLs, status codes, schema errors) go to the console, not the customer.
  useEffect(() => {
    if (error) {
      console.error(`${title} request failed`, error);
    }
  }, [error, title]);

  if (loading) {
    return (
      <div className={styles.feedback} role="status">
        <span className={styles.spinner} aria-hidden="true" />
        <span>Loading {title.toLocaleLowerCase()}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={joinClasses(styles.feedback, styles.feedbackError)} role="alert">
        <strong>{title} could not be loaded.</strong>
        <span>Please try again. If the problem continues, reload the page.</span>
        <button className={styles.buttonSecondary} type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  if (empty) {
    return (
      <div className={styles.feedback} role="status">
        <span>{emptyMessage}</span>
        {children}
      </div>
    );
  }

  return null;
}
