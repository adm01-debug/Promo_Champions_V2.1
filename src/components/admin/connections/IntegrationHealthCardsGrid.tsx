import { useMemo } from "react";
import { useIntegrationConnections } from "@/hooks/admin/useIntegrationConnections";
import { useCredentialsSource } from "./CredentialsSourceFilterContext";
import { IntegrationHealthCard } from "./IntegrationHealthCard";
import { Skeleton } from "@/components/ui/skeleton";

export function IntegrationHealthCardsGrid() {
  const { source } = useCredentialsSource();
  const { data: conns = [], isLoading } = useIntegrationConnections();

  const filtered = useMemo(
    () => (source === "all" ? conns : conns.filter((c) => c.source === source)),
    [conns, source]
  );

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
        Nenhuma conexão para esta origem.
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
