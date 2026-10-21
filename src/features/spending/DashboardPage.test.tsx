import { fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    const alert = await findByRole("alert");
    expect(alert).toHaveTextContent("Spending summary could not be loaded.");
    expect(alert).not.toHaveTextContent("503");
    expect(await findByRole("heading", { name: "Spending goals" })).toBeInTheDocument();
    expect(await findByRole("heading", { name: "Recent Transactions" })).toBeInTheDocument();
    expect((await findAllByText("Groceries")).length).toBeGreaterThan(0);
  });

  it("clears the custom dates when the preset period changes", async () => {
    const user = userEvent.setup();
    const { container } = renderWithQuery(<DashboardPage />);
    const view = within(container);

    await view.findByRole("option", { name: "Last 7 days" });
    const startDate = view.getByLabelText("Custom start date");
    const endDate = view.getByLabelText("Custom end date");
    fireEvent.change(startDate, { target: { value: "2024-02-01" } });
    fireEvent.change(endDate, { target: { value: "2024-02-10" } });
    expect(startDate).toHaveValue("2024-02-01");
    expect(endDate).toHaveValue("2024-02-10");

    await user.selectOptions(view.getByLabelText("Preset period"), "7d");

    expect(view.getByLabelText("Preset period")).toHaveValue("7d");
    expect(startDate).toHaveValue("");
    expect(endDate).toHaveValue("");
    expect(view.queryByRole("button", { name: "Clear custom dates" })).not.toBeInTheDocument();
  });
});
