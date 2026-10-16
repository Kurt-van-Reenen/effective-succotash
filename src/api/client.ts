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

  if (!(response.headers.get("content-type") ?? "").includes("json")) {
    throw new Error(
      `Expected JSON from ${url} but received ${response.headers.get("content-type") ?? "an unknown content type"}. Reload the page if the mock API stopped responding.`,
    );
  }

  const responseBody: unknown = await response.json();
  const result = schema.safeParse(responseBody);

  if (!result.success) {
    throw new Error(`Invalid API response from ${url}: ${result.error.message}`);
  }

  return result.data;
}
