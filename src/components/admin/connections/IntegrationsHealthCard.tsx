import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Activity, AlertTriangle, Loader2 } from "lucide-react";
import { useIntegrationConnections, useIntegrationHealth } from "@/hooks/admin/useIntegrationConnections";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCredentialsSource } from "./CredentialsSourceFilterContext";

export function IntegrationsHealthCard() {
  const { data: conns = [], isLoading: loadingConns } = useIntegrationConnections();
  const { data: checks = [], isLoading: loadingChecks } = useIntegrationHealth();
  const { setHealthStatus, healthStatus } = useCredentialsSource();

  const isLoading = loadingConns || loadingChecks;

  const stats = useMemo(() => {
    const total = conns.length;
    const enabled = conns.filter((c) => c.enabled).length;
    // last status per connection
    const last = new Map<string, string>();
    for (const ch of checks) {
      const cid = (ch as { connection_id: string }).connection_id;
      if (!last.has(cid)) last.set(cid, (ch as { status: string }).status);
    }
    let ok = 0, fail = 0, untested = 0;
    for (const c of conns) {
      const s = last.get(c.id);
      if (!s) untested++;
      else if (s === "success") ok++;
      else fail++;
    }
    return { total, enabled, ok, fail, untested };
  }, [conns, checks]);

  const items = [
    { label: "Conexões", value: stats.total, icon: Activity, color: "text-primary", filter: "all" as const },
    { label: "Ativas", value: stats.enabled, icon: CheckCircle2, color: "text-success", filter: "all" as const },
    { label: "OK", value: stats.ok, icon: CheckCircle2, color: "text-success", filter: "healthy" as const },
    { label: "Falhando", value: stats.fail, icon: XCircle, color: "text-destructive", filter: "failing" as const },
    { label: "Pendentes", value: stats.untested, icon: AlertTriangle, color: "text-warning", filter: "warning" as const },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
      {items.map((it) => (
        <Card key={it.label} className="glass border-border/40">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/40">
              <it.icon className={`h-4 w-4 ${it.color}`} />
            </div>
            <div>
              <div className="text-2xl font-display font-bold">{it.value}</div>
              <div className="text-xs text-muted-foreground">{it.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
