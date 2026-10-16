import { within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import { server } from "../../test/server";
import { renderWithQuery } from "../../test/renderWithQuery";
import { CategoriesSection } from "./CategoriesSection";

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
});
