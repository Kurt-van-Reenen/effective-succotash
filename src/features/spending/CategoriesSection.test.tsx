import { within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import { server } from "../../test/server";
import { renderWithQuery } from "../../test/renderWithQuery";
import { CategoriesSection } from "./CategoriesSection";
import { formatMoney } from "./format";

describe("CategoriesSection", () => {
  it("sorts categories by amount from highest to lowest", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/spending/categories"), () =>
        HttpResponse.json({
          dateRange: { startDate: "2024-01-01", endDate: "2024-01-31" },
          totalAmount: 100,
          categories: [
            {
              name: "Smaller",
              amount: 20,
              percentage: 20,
              transactionCount: 2,
              color: "#4ECDC4",
              icon: "film",
            },
            {
              name: "Largest",
              amount: 80,
              percentage: 80,
              transactionCount: 4,
              color: "#FF6B6B",
              icon: "shopping-cart",
            },
          ],
        }),
      ),
    );

    const { findByRole } = renderWithQuery(
      <CategoriesSection
        period="30d"
        startDate=""
        endDate=""
        invalidRange={false}
        currency="ZAR"
      />,
    );
    const legend = await findByRole("list", { name: "Category spending amounts and percentages" });
    const items = within(legend).getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("Largest");
    expect(items[1]).toHaveTextContent("Smaller");
  });

  it("shows the total spent in the centre of the chart", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/spending/categories"), () =>
        HttpResponse.json({
          dateRange: { startDate: "2024-01-01", endDate: "2024-01-31" },
          totalAmount: 1250.5,
          categories: [
            {
              name: "Groceries",
              amount: 1250.5,
              percentage: 100,
              transactionCount: 3,
              color: "#FF6B6B",
              icon: "shopping-cart",
            },
          ],
        }),
      ),
    );

    const { container } = renderWithQuery(
      <CategoriesSection
        period="30d"
        startDate=""
        endDate=""
        invalidRange={false}
        currency="ZAR"
      />,
    );
    const label = await within(container).findByText("Total spent");

    expect(label.nextElementSibling?.textContent).toBe(formatMoney(1250.5, "ZAR"));
  });
});
