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
    if (score >= 75) return { label: "Quente", color: "text-status-error", bgColor: "bg-status-error/10", icon: Flame };
    if (score >= 50) return { label: "Morno", color: "text-status-warning", bgColor: "bg-status-warning/10", icon: Thermometer };
    return { label: "Frio", color: "text-status-info", bgColor: "bg-status-info/10", icon: Snowflake };
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "lead": return "Lead";
      case "qualified": return "Qualificado";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lead": return "bg-status-info/10 text-status-info border-status-info/30";
      case "qualified": return "bg-status-success/10 text-status-success border-status-success/30";
      default: return "";
    }
  };

  return (
    <Card className="glass dark:border-glow card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text">Prospects Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {prospects?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl">
            <div className="p-4 rounded-full bg-muted/20 mb-3">
              <Users className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm">Nenhum prospect encontrado</p>
          </div>
        )}
        {prospects?.map((prospect, index) => {
          const temp = getTemperature(prospect.score);
          const TempIcon = temp.icon;
          
          return (
            <div 
              key={prospect.id}
              className="flex items-center gap-3 p-3 rounded-xl glass hover-lift transition-all group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-2 rounded-lg ${temp.bgColor} ${temp.color} group-hover:scale-110 transition-transform`}>
                <TempIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {prospect.client_name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {prospect.product_name}
                </p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="outline" className={`text-[10px] ${getStatusColor(prospect.status)}`}>
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
