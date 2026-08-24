import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { installStaleAssetRecovery, recoverFromStaleAssetError } from "@/lib/staleAssetRecovery";
import { installSwAutoUpdate } from "@/lib/swUpdater";

installStaleAssetRecovery();
installSwAutoUpdate();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const bootstrapApp = async (): Promise<void> => {
  const [{ default: App }, { reportWebVitals }] = await Promise.all([
    import("./App"),
    import("@/lib/webVitals"),
  ]);

  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Report Core Web Vitals (CLS, INP, LCP, FCP, TTFB)
  reportWebVitals();
};

void bootstrapApp().catch(error => {
  void recoverFromStaleAssetError(error);
});
