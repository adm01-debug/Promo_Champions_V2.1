import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, Flame, Thermometer, Snowflake, Clock, Package, Sparkles, Loader2, Linkedin, Building2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeadEnrichment } from "@/hooks/useLeadEnrichment";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function RecentProspects() {
  const { mutate: enrich } = useLeadEnrichment();
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  const { data: prospects, refetch } = useQuery({
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

  const handleEnrich = (id: string, clientName: string) => {
    setEnrichingId(id);
    enrich({ leadId: id, companyName: clientName }, {
      onSuccess: () => {
        setEnrichingId(null);
        refetch();
      },
      onError: () => setEnrichingId(null)
    });
  };

  const getTemperature = (score: number) => {
    if (score >= 75) return { label: "Quente", color: "text-status-error", bgColor: "bg-status-error/10", borderColor: "border-status-error/30", icon: Flame, glowClass: "hover-glow-error" };
    if (score >= 50) return { label: "Morno", color: "text-status-warning", bgColor: "bg-status-warning/10", borderColor: "border-status-warning/30", icon: Thermometer, glowClass: "hover-glow" };
    return { label: "Frio", color: "text-status-info", bgColor: "bg-status-info/10", borderColor: "border-status-info/30", icon: Snowflake, glowClass: "" };
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
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Prospects Recentes</span>
          </CardTitle>
          {prospects && prospects.length > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shadow-sm">
              {prospects.length} prospects
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-2">
            {prospects?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
                <div className="p-4 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 mb-3 shadow-lg">
                  <Users className="h-10 w-10 opacity-50 animate-pulse" />
                </div>
                <p className="text-sm font-display font-medium gradient-text">Nenhum prospect encontrado</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Novos leads aparecerão aqui</p>
              </div>
            )}
            {prospects?.map((prospect, index) => {
              const temp = getTemperature(prospect.score);
              const TempIcon = temp.icon;
              const enrichment = (prospect as any).enrichment_data;
              const isEnrichingCurrent = enrichingId === prospect.id;
              
              return (
                <div 
                  key={prospect.id}
                  className={cn(
                    "flex flex-col gap-2 p-3 rounded-xl glass border hover-lift transition-all group animate-fade-in",
                    temp.borderColor,
                    temp.glowClass
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-lg shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg",
                      temp.bgColor,
                      temp.color
                    )}>
                      <TempIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-medium truncate group-hover:text-primary transition-colors">
                        {prospect.client_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Package className="h-3 w-3 text-muted-foreground/60" />
                        <p className="text-[10px] text-muted-foreground truncate group-hover:text-foreground/70 transition-colors">
                          {prospect.product_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1.5">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEnrich(prospect.id, prospect.client_name);
                                }}
                                disabled={isEnrichingCurrent}
                              >
                                {isEnrichingCurrent ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                ) : (
                                  <Sparkles className="h-3 w-3 text-primary" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-[10px]">Enriquecer Lead com AI</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] transition-all group-hover:scale-105 shadow-sm",
                            getStatusColor(prospect.status)
                          )}
                        >
                          {getStatusLabel(prospect.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 justify-end text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        <span>
                          {formatDistanceToNow(new Date(prospect.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enriched Data Bar */}
                  {enrichment && Object.keys(enrichment).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/30">
                      {enrichment.linkedin_url && (
                        <a href={enrichment.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                          <Linkedin className="h-2.5 w-2.5" /> LinkedIn
                        </a>
                      )}
                      {enrichment.company_size && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Building2 className="h-2.5 w-2.5" /> {enrichment.company_size} emp.
                        </span>
                      )}
                      {enrichment.industry && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Globe className="h-2.5 w-2.5" /> {enrichment.industry}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
