import { createContext } from "react";
import { type CredentialsSource, type HealthStatusFilter } from "./CredentialsSourceFilterContext";

interface Ctx {
  source: CredentialsSource;
  setSource: (s: CredentialsSource) => void;
  healthStatus: HealthStatusFilter;
  setHealthStatus: (s: HealthStatusFilter) => void;
}

export const CredentialsSourceContext = createContext<Ctx | null>(null);
