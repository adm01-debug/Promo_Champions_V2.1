import { createContext } from "react";

export type CredentialsSource = "all" | "db" | "env" | "secret";
export type HealthStatusFilter = "all" | "healthy" | "warning" | "failing";

interface Ctx {
  source: CredentialsSource;
  setSource: (s: CredentialsSource) => void;
  healthStatus: HealthStatusFilter;
  setHealthStatus: (s: HealthStatusFilter) => void;
}

export const CredentialsSourceContext = createContext<Ctx | null>(null);
