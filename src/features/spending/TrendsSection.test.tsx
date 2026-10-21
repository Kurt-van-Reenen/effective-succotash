import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import { server } from "../../test/server";
import { renderWithQuery } from "../../test/renderWithQuery";
import { formatMonth } from "./format";
import { TrendsSection } from "./TrendsSection";

describe("TrendsSection", () => {
  it("requests the selected month count and lists each month in the data table", async () => {
    const requestedMonths: string[] = [];
    server.use(
      http.get(getApiUrl("customers/:customerId/spending/trends"), ({ request }) => {
        requestedMonths.push(new URL(request.url).searchParams.get("months") ?? "");
        return HttpResponse.json({
          trends: [
            { month: "2024-01", totalSpent: 1200, transactionCount: 4, averageTransaction: 300 },
            {
              month: "2024-02",
              totalSpent: 980.5,
              transactionCount: 3,
              averageTransaction: 326.83,
            },
          ],
        });
      }),
    );

    const user = userEvent.setup();
    const { findByRole, getByLabelText } = renderWithQuery(<TrendsSection currency="ZAR" />);

    const table = await findByRole("table", { name: "Monthly spending totals" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(within(table).getByRole("rowheader", { name: formatMonth("2024-02") })).toBeVisible();
    expect(requestedMonths).toEqual(["6"]);

    await user.selectOptions(getByLabelText("Months shown"), "12");

    await findByRole("img", { name: "Bar chart of spending totals for 12 months" });
    expect(requestedMonths).toContain("12");
  });

  it("explains when there is no monthly data", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/spending/trends"), () =>
        HttpResponse.json({ trends: [] }),
      ),
    );

    const { findByText } = renderWithQuery(<TrendsSection currency="ZAR" />);

    expect(await findByText("No monthly spending data is available.")).toBeInTheDocument();
  });
});
