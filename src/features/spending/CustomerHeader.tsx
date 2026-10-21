// Shows the customer's name, email, and account type.
import { useCustomerProfile } from "./hooks";
import { QueryFeedback } from "./QueryFeedback";
import styles from "./Dashboard.module.css";

export function CustomerHeader() {
  const profile = useCustomerProfile();

  return (
    <section className={styles.customerHeader} aria-labelledby="customer-heading">
      <div className={styles.brandShapes} aria-hidden="true">
        <span className={styles.shapeSky} />
        <span className={styles.shapePill} />
        <span className={styles.shapeRed} />
      </div>
      <QueryFeedback
        title="Customer profile"
        loading={profile.isLoading}
        error={profile.error}
        empty={!profile.isLoading && !profile.error && !profile.data}
        emptyMessage="Customer profile is not available."
        retry={() => void profile.refetch()}
      />
      {profile.data && (
        <div className={styles.customerHeaderContent}>
          <div className={styles.customerIdentity}>
            <h1 id="customer-heading">{profile.data.name}</h1>
            <p className={styles.customerEmail}>{profile.data.email}</p>
          </div>
          <div className={styles.customerDetails}>
            <span className={styles.accountType}>{profile.data.accountType} account</span>
          </div>
        </div>
      )}
    </section>
  );
}
