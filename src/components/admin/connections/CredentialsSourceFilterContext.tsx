import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CredentialsSource = "all" | "db" | "env" | "secret";
export type HealthStatusFilter = "all" | "healthy" | "warning" | "failing";

interface Ctx {
  source: CredentialsSource;
  setSource: (s: CredentialsSource) => void;
  healthStatus: HealthStatusFilter;
  setHealthStatus: (s: HealthStatusFilter) => void;
}

const CredentialsSourceContext = createContext<Ctx | null>(null);

export function CredentialsSourceFilterProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<CredentialsSource>("all");
  const [healthStatus, setHealthStatus] = useState<HealthStatusFilter>("all");
  const value = useMemo(
    () => ({ source, setSource, healthStatus, setHealthStatus }),
    [source, healthStatus],
  );
  return <CredentialsSourceContext.Provider value={value}>{children}</CredentialsSourceContext.Provider>;
}

export function useCredentialsSource() {
  const ctx = useContext(CredentialsSourceContext);
  if (!ctx) throw new Error("useCredentialsSource must be used inside CredentialsSourceFilterProvider");
  return ctx;
}
