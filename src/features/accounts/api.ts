import { getJson } from "../../api/client";
import { AccountsResponseSchema } from "../../api/types";

export async function getAccounts() {
  const response = await getJson("accounts", AccountsResponseSchema);

  return response.accounts;
}
