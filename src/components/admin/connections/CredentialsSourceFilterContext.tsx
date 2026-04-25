import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CredentialsSource = "all" | "db" | "env" | "secret";

interface Ctx {
  source: CredentialsSource;
  setSource: (s: CredentialsSource) => void;
}

const CredentialsSourceContext = createContext<Ctx | null>(null);

export function CredentialsSourceFilterProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<CredentialsSource>("all");
  const value = useMemo(() => ({ source, setSource }), [source]);
  return <CredentialsSourceContext.Provider value={value}>{children}</CredentialsSourceContext.Provider>;
}

export function useCredentialsSource() {
  const ctx = useContext(CredentialsSourceContext);
  if (!ctx) throw new Error("useCredentialsSource must be used inside CredentialsSourceFilterProvider");
  return ctx;
}
