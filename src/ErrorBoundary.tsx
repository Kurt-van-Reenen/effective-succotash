// Catches render errors below it so one failure shows a recoverable message instead of a blank page.
import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled dashboard error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error" role="alert">
          <strong>Something went wrong while showing your spending insights.</strong>
          <span>Reload the page to try again.</span>
          <button
            className="app-error-button"
            type="button"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
