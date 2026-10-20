import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithQuery } from "../../test/renderWithQuery";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("changes preset and custom dates and explains an invalid custom range", async () => {
    const user = userEvent.setup();
    const onPeriodChange = vi.fn();
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();
    const properties = {
      period: "30d" as const,
      startDate: "",
      endDate: "",
      invalidRange: false,
      onPeriodChange,
      onStartDateChange,
      onEndDateChange,
      onClearDates: vi.fn(),
    };
    renderWithQuery(<FilterBar {...properties} />);

    await screen.findByRole("option", { name: "Last 7 days" });
    await user.selectOptions(screen.getByLabelText("Preset period"), "7d");
    expect(onPeriodChange).toHaveBeenCalledWith("7d");

    fireEvent.change(screen.getByLabelText("Custom start date"), {
      target: { value: "2024-02-10" },
    });
    fireEvent.change(screen.getByLabelText("Custom end date"), {
      target: { value: "2024-02-01" },
    });
    expect(onStartDateChange).toHaveBeenCalledWith("2024-02-10");
    expect(onEndDateChange).toHaveBeenCalledWith("2024-02-01");

    renderWithQuery(
      <FilterBar {...properties} startDate="2024-02-10" endDate="2024-02-01" invalidRange />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The start date must be on or before the end date.",
    );
  });

  it("clears custom dates when the preset period changes", async () => {
    const user = userEvent.setup();
    const onPeriodChange = vi.fn();
    const onClearDates = vi.fn();
    const { container } = renderWithQuery(
      <FilterBar
        period="30d"
        startDate="2024-02-01"
        endDate="2024-02-10"
        invalidRange={false}
        onPeriodChange={onPeriodChange}
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onClearDates={onClearDates}
      />,
    );

    const view = within(container);
    await view.findByRole("option", { name: "Last 7 days" });
    await user.selectOptions(view.getByLabelText("Preset period"), "7d");
    expect(onPeriodChange).toHaveBeenCalledWith("7d");
    expect(onClearDates).toHaveBeenCalledTimes(1);
  });
});
