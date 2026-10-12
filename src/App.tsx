import { AccountsPage } from "./features/accounts/AccountsPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Effective Succotash home">
          <span className="brand-mark" aria-hidden="true">
            ES
          </span>
          <span>Effective Succotash</span>
        </a>
        <p className="environment-label">
          {import.meta.env.VITE_ENABLE_MOCKS === "true" ? "Demo workspace" : "Workspace"}
        </p>
      </header>
      <main className="main-content">
        <AccountsPage />
      </main>
      <footer className="site-footer">A thoughtfully simple starting point.</footer>
    </div>
  );
}
