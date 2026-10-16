import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import { server } from "../../test/server";
import { renderWithQuery } from "../../test/renderWithQuery";
import { GoalsSection } from "./GoalsSection";

describe("GoalsSection", () => {
  it("renders budget progress and gives unknown statuses a neutral label", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/goals"), () =>
        HttpResponse.json({
          goals: [
            {
              id: "goal_unknown",
              category: "Travel",
              monthlyBudget: 1000,
              currentSpent: 1250,
              percentageUsed: 125,
              daysRemaining: 4,
              status: "new_status",
            },
          ],
        }),
      ),
    );

    const { findByText, getByRole, getByText } = renderWithQuery(<GoalsSection currency="ZAR" />);

    expect(await findByText("Travel")).toBeInTheDocument();
    expect(getByText("Status unavailable")).toBeInTheDocument();
    expect(getByText("125% used")).toBeInTheDocument();
    expect(getByRole("progressbar", { name: "Travel budget used" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});
