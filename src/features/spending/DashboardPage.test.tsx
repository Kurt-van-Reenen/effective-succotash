import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import { server } from "../../test/server";
import { renderWithQuery } from "../../test/renderWithQuery";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("keeps the other sections available when one endpoint fails", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/spending/summary"), () =>
        HttpResponse.json({ message: "Temporarily unavailable" }, { status: 503 }),
      ),
    );

    const { findAllByText, findByRole } = renderWithQuery(<DashboardPage />);

    expect(await findByRole("heading", { name: "John Doe" })).toBeInTheDocument();
    expect(await findByRole("alert")).toHaveTextContent("503");
    expect(await findByRole("heading", { name: "Spending goals" })).toBeInTheDocument();
    expect(await findByRole("heading", { name: "Transactions" })).toBeInTheDocument();
    expect((await findAllByText("Groceries")).length).toBeGreaterThan(0);
  });
});
