import capitecLogo from "./assets/capitec-logo.svg";
import { ErrorBoundary } from "./ErrorBoundary";
import { DashboardPage } from "./features/spending/DashboardPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Customer Spending Insights home">
          <span className="brand-mark" aria-hidden="true">
            CS
          </span>
          <span>Customer Spending Insights</span>
        </a>
        <img className="partner-logo" src={capitecLogo} alt="Capitec" />
      </header>
      <div className="main-content">
        <ErrorBoundary>
          <DashboardPage />
        </ErrorBoundary>
      </div>
    </div>
  );
}
