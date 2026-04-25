import { useMemo } from "react";
import { useIntegrationConnections, useIntegrationHealth } from "@/hooks/admin/useIntegrationConnections";
import { useCredentialsSource } from "./CredentialsSourceFilterContext";
import { IntegrationHealthCard } from "./IntegrationHealthCard";
import { Skeleton } from "@/components/ui/skeleton";

export function IntegrationHealthCardsGrid() {
  const { source, healthStatus } = useCredentialsSource();
  const { data: conns = [], isLoading } = useIntegrationConnections();
  const { data: checks = [] } = useIntegrationHealth(undefined, 500);

  const lastStatusByConn = useMemo(() => {
    const map = new Map<string, string>();
    for (const ch of checks) {
      if (!map.has(ch.connection_id)) map.set(ch.connection_id, ch.status);
    }
    return map;
  }, [checks]);

  const filtered = useMemo(() => {
    return conns.filter((c) => {
      if (source !== "all" && c.source !== source) return false;
      if (healthStatus === "all") return true;
      const last = lastStatusByConn.get(c.id);
      // warning = disabled OR never tested
      if (healthStatus === "warning") return !c.enabled || !last;
      if (!c.enabled) return false;
      if (healthStatus === "healthy") return last === "success";
      if (healthStatus === "failing") return !!last && last !== "success";
      return true;
    });
  }, [conns, source, healthStatus, lastStatusByConn]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[220px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (conns.length === 0) return null;

  if (filtered.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-xl">
        Nenhuma conexão para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((c) => (
        <IntegrationHealthCard key={c.id} connection={c} />
      ))}
    </div>
  );
}
