if (typeof window !== 'undefined') {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  // Strip console.log in production (keep warn/error for debugging)
  if (import.meta.env.PROD) {
    console.log = (...args: unknown[]) => {
      // Only suppress generic logs, keep warnings
    };
  }

  // Global error boundary for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    // Prevent default crash behavior
    event.preventDefault();
  });

  // Global error boundary for uncaught errors
  window.addEventListener('error', (event) => {
    console.error('[Uncaught Error]', event.error);
  });
}
