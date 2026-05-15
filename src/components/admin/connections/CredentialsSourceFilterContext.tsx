import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CredentialsSource = "all" | "db" | "env" | "secret";
export type HealthStatusFilter = "all" | "healthy" | "warning" | "failing";

interface Ctx {
  source: CredentialsSource;
  setSource: (s: CredentialsSource) => void;
  healthStatus: HealthStatusFilter;
  setHealthStatus: (s: HealthStatusFilter) => void;
}

const CredentialsSourceContext = createContext<Ctx | null>(null);

const SOURCE_KEY = "integration-health:source-filter";
const STATUS_KEY = "integration-health:status-filter";

const VALID_SOURCES: CredentialsSource[] = ["all", "db", "env", "secret"];
const VALID_STATUSES: HealthStatusFilter[] = ["all", "healthy", "warning", "failing"];

function readSource(): CredentialsSource {
  try {
    const v = localStorage.getItem(SOURCE_KEY);
    return v && (VALID_SOURCES as string[]).includes(v) ? (v as CredentialsSource) : "all";
  } catch {
    return "all";
  }
}

function readStatus(): HealthStatusFilter {
  try {
    const v = localStorage.getItem(STATUS_KEY);
    return v && (VALID_STATUSES as string[]).includes(v) ? (v as HealthStatusFilter) : "all";
  } catch {
    return "all";
  }
}

export function CredentialsSourceFilterProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<CredentialsSource>(() => readSource());
  const [healthStatus, setHealthStatus] = useState<HealthStatusFilter>(() => readStatus());

  useEffect(() => {
    try {
      localStorage.setItem(SOURCE_KEY, source);
    } catch {
      // noop
    }
  }, [source]);

  useEffect(() => {
    try {
      localStorage.setItem(STATUS_KEY, healthStatus);
    } catch {
      // noop
    }
  }, [healthStatus]);

  const value = useMemo(
    () => ({ source, setSource, healthStatus, setHealthStatus }),
    [source, healthStatus],
  );
  return <CredentialsSourceContext.Provider value={value}>{children}</CredentialsSourceContext.Provider>;
}

/**
 * Hook to use the credentials source filter context.
 */
export const useCredentialsSource = () => {
  const ctx = useContext(CredentialsSourceContext);
  if (!ctx) throw new Error("useCredentialsSource must be used inside CredentialsSourceFilterProvider");
  return ctx;
};

