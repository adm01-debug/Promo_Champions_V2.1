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
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover/title:scale-110 group-hover/title:shadow-primary/40">
            <Users className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Prospects Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {prospects?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
            <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-3 shadow-inner animate-pulse">
              <Users className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm font-display font-medium gradient-text">Nenhum prospect encontrado</p>
          </div>
        )}
        {prospects?.map((prospect, index) => {
          const temp = getTemperature(prospect.score);
          const TempIcon = temp.icon;
          
          return (
            <div 
              key={prospect.id}
              className="flex items-center gap-3 p-3 rounded-xl glass border border-border/30 hover-lift transition-all duration-300 group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-2 rounded-lg ${temp.bgColor} ${temp.color} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <TempIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-medium truncate group-hover:text-primary transition-colors duration-300">
                  {prospect.client_name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate transition-colors group-hover:text-foreground/70">
                  {prospect.product_name}
                </p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="outline" className={`text-[10px] transition-all duration-300 group-hover:scale-105 ${getStatusColor(prospect.status)}`}>
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
