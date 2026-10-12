import { fireEvent, render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import type { AccountsResponse } from "../../api/types";
import { server } from "../../test/server";
import { AccountsPage } from "./AccountsPage";

describe("AccountsPage", () => {
  it("shows accounts returned by the API", async () => {
    render(<AccountsPage />);

    expect(await screen.findByRole("heading", { name: "Alex Morgan" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Jordan Lee" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "alex.morgan@example.test" })).toHaveAttribute(
      "href",
      "mailto:alex.morgan@example.test",
    );
  });

  it("shows a helpful error and allows another request after a failure", async () => {
    server.use(
      http.get(getApiUrl("accounts"), () =>
        HttpResponse.json({ message: "Service unavailable" }, { status: 503 }),
      ),
    );

    render(<AccountsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("503");

    server.use(
      http.get(getApiUrl("accounts"), () =>
        HttpResponse.json<AccountsResponse>({
          accounts: [{ id: "account-004", name: "Riley Chen", email: "riley@example.test" }],
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { name: "Riley Chen" })).toBeInTheDocument();
  });

  it("shows an empty state when the API returns no accounts", async () => {
    server.use(
      http.get(getApiUrl("accounts"), () => HttpResponse.json<AccountsResponse>({ accounts: [] })),
    );

    render(<AccountsPage />);

    expect(await screen.findByRole("status", { name: "No accounts yet" })).toBeInTheDocument();
  });

  it("reports an invalid API response instead of rendering malformed data", async () => {
    server.use(
      http.get(getApiUrl("accounts"), () =>
        HttpResponse.json({ accounts: [{ id: "missing-fields" }] }),
      ),
    );

    render(<AccountsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid API response");
  });
});
