import { http, HttpResponse } from "msw";
import { getApiUrl } from "../api/url";
import type { AccountsResponse } from "../api/types";
import { placeholderAccounts } from "./data/accounts";

export const handlers = [
  http.get(getApiUrl("accounts"), () =>
    HttpResponse.json<AccountsResponse>({
      accounts: placeholderAccounts,
    }),
  ),
];
