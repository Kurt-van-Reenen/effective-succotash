import { z } from "zod";
import { getApiUrl } from "./url";

export async function getJson<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const url = getApiUrl(path);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${String(response.status)} ${response.statusText}`.trim(),
    );
  }

  const responseBody: unknown = await response.json();
  const result = schema.safeParse(responseBody);

  if (!result.success) {
    throw new Error(`Invalid API response from ${url}: ${result.error.message}`);
  }

  return result.data;
}
