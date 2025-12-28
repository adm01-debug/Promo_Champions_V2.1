// Melhoria 110 - Analytics (Vercel/Plausible)
import { Analytics } from '@vercel/analytics/react';

export const AnalyticsProvider = ({ children }) => {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
};
