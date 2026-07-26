import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerComponent, toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
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

// Global mutation error handler — Sentry + toast
// Registrado aqui (App.tsx) para ter acesso a captureException e toast.
// Nao pode ir em queryClient.ts porque sao imports de App-level.
queryClient.setDefaultOptions({
  mutations: {
    onError: error => {
      captureException(error, 'GlobalMutationError');
      const err = error as { status?: number; name?: string; message?: string };
      if (err?.status === 401 || err?.status === 403 || err?.name === 'AbortError') return;
      const message = err?.message || 'Ocorreu um erro ao processar sua solicitação.';
      toast.error('Erro na operação', { description: message, duration: 5000 });
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
