import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusMessage } from "./StatusMessage";

describe("StatusMessage", () => {
  it("announces its title and message as a status", () => {
    render(
      <StatusMessage
        status="status"
        title="Loading accounts"
        message="Please wait while your accounts are loaded."
      />,
    );

    expect(screen.getByRole("status", { name: "Loading accounts" })).toHaveTextContent(
      "Please wait while your accounts are loaded.",
    );
  });
});
