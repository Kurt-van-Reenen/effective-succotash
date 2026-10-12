import { z } from "zod";

export const AccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
});

export const AccountsResponseSchema = z.object({
  accounts: z.array(AccountSchema),
});

export type Account = z.infer<typeof AccountSchema>;
export type AccountsResponse = z.infer<typeof AccountsResponseSchema>;
