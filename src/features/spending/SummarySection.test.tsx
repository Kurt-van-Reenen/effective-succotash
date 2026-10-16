import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import { server } from "../../test/server";
import { renderWithQuery } from "../../test/renderWithQuery";
import { SummarySection } from "./SummarySection";

describe("SummarySection", () => {
  it("shows summary cards with text and icons for previous-period changes", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/spending/summary"), () =>
        HttpResponse.json({
          period: "30d",
          totalSpent: 4250.75,
          transactionCount: 47,
          averageTransaction: 90.44,
          topCategory: "Groceries",
          comparedToPrevious: { spentChange: 12.5, transactionChange: -3.2 },
        }),
      ),
    );

    const { findByText, getByText, getByRole } = renderWithQuery(
      <SummarySection period="30d" currency="ZAR" />,
    );

    expect(await findByText("Groceries")).toBeInTheDocument();
    expect(getByText("Transactions")).toBeInTheDocument();
    expect(getByText(/Higher 12.5% vs previous period/)).toBeInTheDocument();
    expect(getByText(/Lower 3.2% vs previous period/)).toBeInTheDocument();
    expect(getByRole("heading", { name: "Spending summary" })).toBeInTheDocument();
  });
});
