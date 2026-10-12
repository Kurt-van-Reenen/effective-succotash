import { useEffect, useState } from "react";
import type { Account } from "../../api/types";
import { StatusMessage } from "../../components/StatusMessage";
import { getAccounts } from "./api";

type AccountsState =
  | { status: "loading" }
  | { status: "success"; accounts: Account[] }
  | { status: "error"; message: string };

export function AccountsPage() {
  const [state, setState] = useState<AccountsState>({ status: "loading" });
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    void getAccounts()
      .then((accounts) => {
        if (isCurrentRequest) {
          setState({ status: "success", accounts });
        }
      })
      .catch((error: unknown) => {
        if (isCurrentRequest) {
          const message = error instanceof Error ? error.message : "An unexpected error occurred.";
          setState({ status: "error", message });
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [requestNumber]);

  return (
    <section className="accounts-section" aria-labelledby="accounts-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 id="accounts-heading">Accounts</h1>
          <p className="section-description">A clear view of the people in your workspace.</p>
        </div>
        {state.status === "success" && (
          <p className="account-count">
            {state.accounts.length} {state.accounts.length === 1 ? "account" : "accounts"}
          </p>
        )}
      </div>

      {state.status === "loading" && (
        <StatusMessage
          status="status"
          title="Loading accounts"
          message="Please wait while your accounts are loaded."
        />
      )}

      {state.status === "error" && (
        <StatusMessage status="alert" title="Accounts could not be loaded" message={state.message}>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setRequestNumber((currentRequest) => currentRequest + 1);
            }}
          >
            Try again
          </button>
        </StatusMessage>
      )}

      {state.status === "success" && state.accounts.length === 0 && (
        <StatusMessage
          status="status"
          title="No accounts yet"
          message="Accounts will appear here when they are available."
        />
      )}

      {state.status === "success" && state.accounts.length > 0 && (
        <ul className="account-list" aria-label="Account list">
          {state.accounts.map((account) => (
            <li key={account.id}>
              <article className="account-card">
                <div className="avatar" aria-hidden="true">
                  {account.name.slice(0, 1).toLocaleUpperCase()}
                </div>
                <div className="account-details">
                  <h2>{account.name}</h2>
                  <a href={`mailto:${account.email}`}>{account.email}</a>
                </div>
                <span className="account-status">Active</span>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
