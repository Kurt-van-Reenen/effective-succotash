import { DashboardPage } from "./features/spending/DashboardPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Customer Spending Insights home">
          <span className="brand-mark" aria-hidden="true">
            CS
          </span>
          <span>Customer insights</span>
        </a>
        <p className="environment-label">
          {import.meta.env.VITE_ENABLE_MOCKS === "true" ? "Sample data" : "Live data"}
        </p>
      </header>
      <div className="main-content">
        <DashboardPage />
      </div>
    </div>
  );
}
