import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { transactions } from "../../mocks/data/spending";
import { renderWithQuery } from "../../test/renderWithQuery";
import { TransactionsSection } from "./TransactionsSection";

function getVisibleTransactionRows() {
  const table = screen.getByRole("table", { name: "Customer transactions" });
  return within(table).getAllByRole("row").slice(1);
}

describe("TransactionsSection", () => {
  it("filters by category, changes sorting, and loads another page", async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <TransactionsSection startDate="" endDate="" invalidRange={false} currency="ZAR" />,
    );

    expect(await screen.findByRole("table", { name: "Customer transactions" })).toBeInTheDocument();
    expect(getVisibleTransactionRows()).toHaveLength(10);

    await user.selectOptions(screen.getByLabelText("Filter transactions by category"), "Groceries");
    const groceryRows = await screen.findAllByText("Groceries");
    expect(groceryRows.length).toBeGreaterThan(0);
    expect(getVisibleTransactionRows()).toHaveLength(10);

    await user.selectOptions(screen.getByLabelText("Sort transactions"), "amount_asc");
    const sortedRows = getVisibleTransactionRows();
    const smallestGrocery = transactions
      .filter((transaction) => transaction.category === "Groceries")
      .sort((first, second) => first.amount - second.amount)[0];
    expect(sortedRows[0]).toHaveTextContent(smallestGrocery?.merchant ?? "");

    await user.selectOptions(screen.getByLabelText("Filter transactions by category"), "");
    expect(
      await screen.findByRole("button", { name: "Load more transactions" }),
    ).toBeInTheDocument();
    expect(getVisibleTransactionRows()).toHaveLength(10);
    await user.click(screen.getByRole("button", { name: "Load more transactions" }));
    await waitFor(() => {
      expect(getVisibleTransactionRows()).toHaveLength(20);
    });
  });

  it("filters by transaction type", async () => {
    const user = userEvent.setup();
    const view = within(
      renderWithQuery(
        <TransactionsSection startDate="" endDate="" invalidRange={false} currency="ZAR" />,
      ).container,
    );

    const typeFilter = view.getByLabelText("Filter transactions by type");
    await view.findByRole("option", { name: "Debit Card" });
    await user.selectOptions(typeFilter, "Debit Card");

    await waitFor(() => {
      const table = view.getByRole("table", { name: "Customer transactions" });
      const rows = within(table).getAllByRole("row").slice(1);
      expect(rows).toHaveLength(10);
      for (const row of rows) {
        expect(row).toHaveTextContent("Debit Card");
        expect(row).not.toHaveTextContent("Credit Card");
      }
    });
  });
});
