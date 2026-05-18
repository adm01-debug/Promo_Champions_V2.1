import { UI } from "@/config/constants";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerComponent, toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { motion, MotionConfig } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { DashboardThemeProvider } from "@/contexts/DashboardThemeContext";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { XPToastProvider } from "@/components/gamification/XPToast";
import { CommandPalette } from "@/components/command/CommandPalette";
import { KeyboardShortcutsProvider } from "@/components/keyboard/KeyboardShortcutsProvider";
import { AppRoutes } from "@/routes/AppRoutes";

import { RouteProgressBar } from "@/components/navigation/RouteProgressBar";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { DevOnly } from "@/components/auth/DevOnly";
import { initErrorTracking, captureException } from "@/lib/errorTracking";

// Initialize error tracking on app load
initErrorTracking();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 401s or 403s
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
      refetchInterval: false,
      networkMode: "offlineFirst",
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Only retry idempotent-looking network errors or 5xx
        const status = error?.status;
        const message = error?.message?.toLowerCase() || "";
        const isNetworkError = message.includes("network") || message.includes("fetch") || message.includes("timeout");
        const isServerError = status >= 500 && status <= 599;
        
        if (failureCount < 2 && (isNetworkError || isServerError)) {
          return true;
        }
        return false;
      },
      onError: (error: any) => {
        captureException(error, "GlobalMutationError");
        
        // Don't toast for cancelled or auth errors (handled by auth logic)
        if (error?.status === 401 || error?.status === 403 || error?.name === "AbortError") {
          return;
        }

        const message = error?.message || "Ocorreu um erro ao processar sua solicitação.";
        toast.error("Erro na operação", {
          description: message,
          duration: 5000,
        });
      },
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MotionConfig transition={{ type: "spring", stiffness: 300, damping: 30, restDelta: 0.001 }}>
            <TooltipProvider delayDuration={0}>
              <GlobalErrorBoundary>
                <XPToastProvider>
                  <Toaster />
                  <SonnerComponent 
                    position="top-right" 
                    closeButton 
                    richColors 
                    expand={false}
                    theme="dark"
                  />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <KeyboardShortcutsProvider>
                      <AuthProvider>
                        <I18nProvider>
                          <DashboardThemeProvider>
                            <CommandPalette />
                            <RouteProgressBar />
                            <AppRoutes />
                            <DevOnly><PerformanceMonitor /></DevOnly>
                            
                          </DashboardThemeProvider>
                        </I18nProvider>
                      </AuthProvider>
                    </KeyboardShortcutsProvider>
                  </BrowserRouter>
                </XPToastProvider>
              </GlobalErrorBoundary>
            </TooltipProvider>
          </MotionConfig>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
};

export default App;