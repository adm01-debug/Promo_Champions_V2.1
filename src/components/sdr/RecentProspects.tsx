import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, Flame, Thermometer, Snowflake } from "lucide-react";

export function RecentProspects() {
  const { data: prospects } = useQuery({
    queryKey: ["recent-prospects"],
    queryFn: async () => {
      const { data: sales } = await supabase
        .from("sales")
        .select("*")
        .in("status", ["lead", "qualified"])
        .order("created_at", { ascending: false })
        .limit(6);

      const saleIds = sales?.map(s => s.id) || [];
      
      const { data: scores } = await supabase
        .from("lead_scores")
        .select("sale_id, score")
        .in("sale_id", saleIds);

      const scoreMap = new Map(scores?.map(s => [s.sale_id, s.score]));

      return sales?.map(sale => ({
        ...sale,
        score: scoreMap.get(sale.id) || 0
      }));
    },
  });

  const getTemperature = (score: number) => {
    if (score >= 75) return { label: "Quente", color: "text-status-error", icon: Flame };
    if (score >= 50) return { label: "Morno", color: "text-status-warning", icon: Thermometer };
    return { label: "Frio", color: "text-status-info", icon: Snowflake };
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "lead": return "Lead";
      case "qualified": return "Qualificado";
      default: return status;
    }
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Prospects Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {prospects?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhum prospect encontrado
          </p>
        )}
        {prospects?.map(prospect => {
          const temp = getTemperature(prospect.score);
          const TempIcon = temp.icon;
          
          return (
            <div 
              key={prospect.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className={`p-1.5 rounded-lg bg-muted/50 ${temp.color}`}>
                <TempIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{prospect.client_name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {prospect.product_name}
                </p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="outline" className="text-[10px]">
                  {getStatusLabel(prospect.status)}
                </Badge>
                <p className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(prospect.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
