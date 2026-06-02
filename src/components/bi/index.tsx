import * as React from "react";

export { BIFilterBar } from "./BIFilterBar";
export { BIMetricCard } from "./BIMetricCard";
export { BIProjectionCard } from "./BIProjectionCard";
export { BIClientList } from "./BIClientList";
export { BICloserCharts } from "./BICloserCharts";
export { BICloserHeader } from "./BICloserHeader";
export { BISDRCharts } from "./BISDRCharts";
export { BIVendedorCharts } from "./BIVendedorCharts";
export { BISalesInsights } from "./BISalesInsights";
export { BIProductCard } from "./BIProductCard";
export { BITopClientsSection } from "./BITopClientsSection";
export { BIVendasMacro } from "./BIVendasMacro";
export { BIGestorTeamSection } from "./BIGestorTeamSection";

// Stub components for legacy imports — render children grid wrapper
export const BIMetricsGrid: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className ?? ""}`}>{children}</div>
);

export const BIComparisonCard: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-lg border border-border/40 bg-card p-4">
    {title ? <h3 className="text-sm font-semibold mb-2">{title}</h3> : null}
    {children}
  </div>
);

export const BIPurchaseHistory: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg border border-border/40 bg-card p-4">{children}</div>
);
