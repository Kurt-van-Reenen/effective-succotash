const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getApiUrl(path: string): string {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}
