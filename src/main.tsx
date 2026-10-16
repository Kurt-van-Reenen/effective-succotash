import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element is missing.");
}

const root = createRoot(rootElement);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      // The mock service worker can be stopped by the browser while the tab is
      // in the background; refetching on focus would then hit the dev server's HTML fallback.
      refetchOnWindowFocus: import.meta.env.VITE_ENABLE_MOCKS !== "true",
    },
  },
});

async function startApplication(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKS === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
      onUnhandledFrame: "bypass",
    });
  }

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
}

void startApplication();
