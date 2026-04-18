import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Gauge } from "lucide-react";
import { useLeadAssignment } from "@/hooks/useLeadAssignment";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { capacityHealth } from "./routingHelpers";

export function CapacityDashboard() {
  const { salespeople } = useLeadAssignment();

  const { data: openCounts, isLoading } = useQuery({
    queryKey: ["lead-routing-open-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("salesperson_id")
        .in("status", ["lead", "qualified", "proposal", "negotiation"]);
      if (error) throw error;
      const map = new Map<string, number>();
      data?.forEach((r) => {
        if (r.salesperson_id) map.set(r.salesperson_id, (map.get(r.salesperson_id) || 0) + 1);
      });
      return map;
    },
    staleTime: 30000,
  });

  const MAX = 25;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <Gauge className="h-4 w-4 text-primary" />
          Capacidade do Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !salespeople.length ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {salespeople.map((sp) => {
              const current = openCounts?.get(sp.id) || 0;
              const h = capacityHealth(current, MAX);
              return (
                <div key={sp.id} className="rounded-lg border bg-card/50 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium truncate">{sp.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${h.tone}`}>{h.label}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${h.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{current} deals abertos</span>
                      <span>Cap. {MAX}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
