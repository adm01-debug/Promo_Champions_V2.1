import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const STAGES = [
  { key: "lead", label: "Leads", color: "bg-primary" },
  { key: "qualified", label: "Qualificados", color: "bg-secondary" },
  { key: "proposal", label: "Proposta", color: "bg-accent" },
  { key: "closed", label: "Fechados", color: "bg-success" },
];

const STATUS_MAP: Record<string, string> = {
  lead: "lead",
  qualified: "qualified",
  proposal: "proposal",
  closed: "closed",
  // Portuguese variants
  novo: "lead",
  qualificado: "qualified",
  proposta: "proposal",
  "negociação": "proposal",
  negociacao: "proposal",
  ganho: "closed",
  completed: "closed",
  won: "closed",
};

export const FunnelChart = () => {
  const { data: funnelData, isLoading } = useQuery({
    queryKey: ["funnel-chart"],
    queryFn: async () => {
      const { data: sales } = await supabase
        .from("sales")
        .select("status")
        .not("status", "in", '("lost","perdido")');

      if (!sales || sales.length === 0) return null;

      const counts: Record<string, number> = { lead: 0, qualified: 0, proposal: 0, closed: 0 };
      
      sales.forEach(s => {
        const mapped = STATUS_MAP[s.status.toLowerCase()] || "lead";
        counts[mapped]++;
      });

      const total = sales.length;
      return STAGES.map(stage => ({
        ...stage,
        count: counts[stage.key],
        percentage: total > 0 ? Math.round((counts[stage.key] / total) * 100) : 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          Funil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-6 w-full rounded-full" />)
        ) : !funnelData ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Registre vendas para ver o funil
          </p>
        ) : (
          funnelData.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium tabular-nums">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
