import { describe, expect, it } from "vitest";
import { formatDate, formatMoney, formatMonth, formatPercentage } from "./format";

describe("spending formatters", () => {
  it("formats currency using the ZAR currency style", () => {
    expect(formatMoney(1234.5, "ZAR")).toMatch(/R.*1.*234,50/);
  });

  it("formats date-only values in a stable readable form", () => {
    expect(formatDate("2024-01-15")).toBe("15 Jan 2024");
  });

  it("formats percentages and month labels readably", () => {
    expect(formatPercentage(12.56)).toBe("12,6%");
    expect(formatMonth("2024-01")).toBe("Jan 2024");
  });
});
