// Alerts Configuration
interface Alert {
  type: 'error' | 'warning' | 'info';
  message: string;
  threshold?: number;
}

const alerts: Alert[] = [
  { type: 'error', message: 'High error rate', threshold: 10 },
  { type: 'warning', message: 'Slow response time', threshold: 2000 },
  { type: 'info', message: 'Low user activity', threshold: 100 }
];

export async function sendAlert(alert: Alert) {
  if (import.meta.env.PROD) {
    // Send to Slack
    await fetch(import.meta.env.VITE_SLACK_WEBHOOK, {
      method: 'POST',
      body: JSON.stringify({
        text: `[${alert.type.toUpperCase()}] ${alert.message}`
      })
    });
  }
}

export function checkAlerts(metrics: Record<string, number>) {
  alerts.forEach(alert => {
    if (alert.threshold && metrics[alert.message] > alert.threshold) {
      sendAlert(alert);
    }
  });
}
