import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerComponent, toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { DashboardThemeProvider } from '@/contexts/DashboardThemeContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { GlobalErrorBoundary } from '@/components/shared/GlobalErrorBoundary';
import { XPToastProvider } from '@/components/gamification/XPToast';
import { CommandPalette } from '@/components/command/CommandPalette';
import { KeyboardShortcutsProvider } from '@/components/keyboard/KeyboardShortcutsProvider';
import { AppRoutes } from '@/routes/AppRoutes';

import { RouteProgressBar } from '@/components/navigation/RouteProgressBar';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { DevOnly } from '@/components/auth/DevOnly';
import { initErrorTracking, captureException } from '@/lib/errorTracking';

// Initialize error tracking on app load
initErrorTracking();

interface AppQueryError {
  status?: number;
  message?: string;
  name?: string;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const err = error as AppQueryError;
        // Don't retry on 401s or 403s
        if (err?.status === 401 || err?.status === 403) return false;
        return failureCount < 2;
      },
      refetchInterval: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: (failureCount, error) => {
        const err = error as AppQueryError;
        // Only retry idempotent-looking network errors or 5xx
        const status = err?.status;
        const message = err?.message?.toLowerCase() || '';
        const isNetworkError =
          message.includes('network') ||
          message.includes('fetch') ||
          message.includes('timeout');
        const isServerError = status !== undefined && status >= 500 && status <= 599;

        if (failureCount < 2 && (isNetworkError || isServerError)) {
          return true;
        }
        return false;
      },
      onError: error => {
        captureException(error, 'GlobalMutationError');

        const err = error as AppQueryError;
        // Don't toast for cancelled or auth errors (handled by auth logic)
        if (err?.status === 401 || err?.status === 403 || err?.name === 'AbortError') {
          return;
        }

        const message = err?.message || 'Ocorreu um erro ao processar sua solicitação.';
        toast.error('Erro na operação', {
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
          <MotionConfig
            transition={{ type: 'spring', stiffness: 300, damping: 30, restDelta: 0.001 }}
          >
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
                  <BrowserRouter
                    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
                  >
                    <KeyboardShortcutsProvider>
                      <AuthProvider>
                        <I18nProvider>
                          <DashboardThemeProvider>
                            <AudioProvider>
                              <CommandPalette />
                              <RouteProgressBar />
                              <AppRoutes />
                              <DevOnly>
                                <PerformanceMonitor />
                              </DevOnly>
                            </AudioProvider>
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
