// Melhoria 111 - Monitoring Alerts
export const setupAlerts = () => {
  // Configure Sentry alerts
  const alerts = [
    { type: 'error-rate', threshold: 0.01, channel: 'slack' },
    { type: 'response-time', threshold: 3000, channel: 'email' },
    { type: 'crash-free-rate', threshold: 0.99, channel: 'slack' },
  ];

  // Supabase metrics alerts
  const dbAlerts = [
    { metric: 'cpu_usage', threshold: 80, interval: '5m' },
    { metric: 'connections', threshold: 90, interval: '5m' },
  ];

  return { alerts, dbAlerts };
};
