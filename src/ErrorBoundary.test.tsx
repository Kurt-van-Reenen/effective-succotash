import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function BrokenSection(): never {
  throw new Error("Render failed");
}

describe("ErrorBoundary", () => {
  it("replaces a crashed tree with a recoverable message", () => {
    // React and the boundary both log the caught error; keep the test output clean.
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { getByRole } = render(
      <ErrorBoundary>
        <BrokenSection />
      </ErrorBoundary>,
    );

    expect(getByRole("alert")).toHaveTextContent(
      "Something went wrong while showing your spending insights.",
    );
    expect(getByRole("button", { name: "Reload page" })).toBeInTheDocument();
  });
});
