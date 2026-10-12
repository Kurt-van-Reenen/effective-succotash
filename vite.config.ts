import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "VITE_");
  const enableMocks = environment.VITE_ENABLE_MOCKS ?? "true";
  const apiBaseUrl = environment.VITE_API_BASE_URL ?? "/api";

  if (enableMocks !== "true" && enableMocks !== "false") {
    throw new Error('VITE_ENABLE_MOCKS must be either "true" or "false".');
  }

  return {
    define: {
      "import.meta.env.VITE_ENABLE_MOCKS": JSON.stringify(enableMocks),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiBaseUrl),
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
