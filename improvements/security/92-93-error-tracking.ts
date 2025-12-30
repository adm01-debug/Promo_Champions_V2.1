// Melhorias 92-93 - Error Tracking & Logging
class ErrorTracker {
  private errors: Array<{ timestamp: number; error: Error; context?: any }> = [];

  capture(error: Error, context?: any) {
    this.errors.push({ timestamp: Date.now(), error, context });
    console.error('[ErrorTracker]', error, context);
    
    // Send to backend/Sentry
    if (import.meta.env.PROD) {
      this.sendToBackend({ error: error.message, stack: error.stack, context });
    }
  }

  private async sendToBackend(payload: any) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error('Failed to send error to backend', e);
    }
  }

  getErrors() {
    return this.errors;
  }
}

export const errorTracker = new ErrorTracker();

// Global error handler
window.addEventListener('error', (event) => {
  errorTracker.capture(event.error, { type: 'unhandled' });
});

window.addEventListener('unhandledrejection', (event) => {
  errorTracker.capture(new Error(event.reason), { type: 'promise-rejection' });
});
