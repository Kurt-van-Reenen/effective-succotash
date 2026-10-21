import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getApiUrl } from "../../api/url";
import { server } from "../../test/server";
import { renderWithQuery } from "../../test/renderWithQuery";
import { CustomerHeader } from "./CustomerHeader";

describe("CustomerHeader", () => {
  it("shows the customer's name, email, and account type", async () => {
    const { findByRole, getByText } = renderWithQuery(<CustomerHeader />);

    expect(await findByRole("heading", { level: 1, name: "John Doe" })).toBeInTheDocument();
    expect(getByText("john.doe@email.com")).toBeInTheDocument();
    expect(getByText("premium account")).toBeInTheDocument();
  });

  it("offers a retry without exposing technical details when the profile fails", async () => {
    server.use(
      http.get(getApiUrl("customers/:customerId/profile"), () =>
        HttpResponse.json({ message: "Internal error" }, { status: 500 }),
      ),
    );

    const { findByRole } = renderWithQuery(<CustomerHeader />);

    const alert = await findByRole("alert");
    expect(alert).toHaveTextContent("Customer profile could not be loaded.");
    expect(alert).not.toHaveTextContent("500");
    expect(await findByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
