import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { getRouter } from "./router";
import "./styles.css";

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("PWA: New content available, auto-updating...");
  },
  onOfflineReady() {
    console.log("PWA: App is ready to work offline.");
  },
});

const router = getRouter();
const queryClient = (router.options.context as any).queryClient;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
