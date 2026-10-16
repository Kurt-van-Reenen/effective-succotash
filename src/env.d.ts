/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_MOCKS: "true" | "false";
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CUSTOMER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
