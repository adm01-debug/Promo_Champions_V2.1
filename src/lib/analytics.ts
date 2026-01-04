// Analytics Configuration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: any;
  }
}

export function initAnalytics() {
  if (import.meta.env.PROD) {
    // Google Analytics
    const GA_ID = import.meta.env.VITE_GA_ID;
    if (GA_ID) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);

      window.gtag = function() {
        (window as any).dataLayer.push(arguments);
      };
      window.gtag('config', GA_ID);
    }
  }
}

export function trackEvent(name: string, props?: Record<string, any>) {
  if (window.gtag) {
    window.gtag('event', name, props);
  }
}

export function trackPageView(path: string) {
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: path
    });
  }
}
