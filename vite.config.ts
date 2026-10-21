import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "VITE_");
  const enableMocks = environment.VITE_ENABLE_MOCKS ?? "true";
  const apiBaseUrl = environment.VITE_API_BASE_URL ?? "/api";
  const customerId = environment.VITE_CUSTOMER_ID || "12345";
  const assetBaseUrl = environment.VITE_ASSET_BASE_URL || "/";

  if (enableMocks !== "true" && enableMocks !== "false") {
    throw new Error('VITE_ENABLE_MOCKS must be either "true" or "false".');
  }

  if (!assetBaseUrl.startsWith("/") && !assetBaseUrl.startsWith("https://")) {
    throw new Error('VITE_ASSET_BASE_URL must be a path starting with "/" or an https:// URL.');
  }

  return {
    // Prefixes every bundled asset URL, so a CDN can serve /assets/* while index.html stays on this origin.
    base: assetBaseUrl.endsWith("/") ? assetBaseUrl : `${assetBaseUrl}/`,
    define: {
      "import.meta.env.VITE_ENABLE_MOCKS": JSON.stringify(enableMocks),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiBaseUrl),
      "import.meta.env.VITE_CUSTOMER_ID": JSON.stringify(customerId),
    },
    publicDir: enableMocks === "false" ? false : "public",
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: ["src/test/setup.ts"],
      clearMocks: true,
      restoreMocks: true,
    },
  };
});
