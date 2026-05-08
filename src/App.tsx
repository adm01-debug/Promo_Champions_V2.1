import { useEffect } from "react";
import { UI } from "@/config/constants";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { DashboardThemeProvider } from "@/contexts/DashboardThemeContext";
import { PageErrorBoundary } from "@/components/errors/PageErrorBoundary";
import { XPToastProvider } from "@/components/gamification/XPToast";
import { CommandPalette } from "@/components/command/CommandPalette";
import { KeyboardShortcutsProvider } from "@/components/keyboard/KeyboardShortcutsProvider";
import { AppRoutes } from "@/routes/AppRoutes";
import { LGPDConsentBanner } from "@/components/compliance/LGPDConsentBanner";
import { initErrorTracking } from "@/lib/errorTracking";

// Initialize error tracking on app load
initErrorTracking();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: UI.STALE_TIME_MS,
      gcTime: UI.GC_TIME_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      refetchInterval: false,
      networkMode: "offlineFirst",
    },
  },
});

const App = () => {

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          <PageErrorBoundary>
            <XPToastProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <KeyboardShortcutsProvider>
                  <AuthProvider>
                    <I18nProvider>
                      <CommandPalette />
                      <AppRoutes />
                      <LGPDConsentBanner />
                    </I18nProvider>
                  </AuthProvider>
                </KeyboardShortcutsProvider>
              </BrowserRouter>
            </XPToastProvider>
          </PageErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
