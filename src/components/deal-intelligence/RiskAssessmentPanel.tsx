import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Activity, MessageSquare, TrendingDown, TrendingUp, Info, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealRiskMeter } from "./DealRiskMeter";
import { useDealHealthBatch } from "@/hooks/deal-intelligence/useDealHealth";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function RiskAssessmentPanel() {
  const { data: deals, isLoading } = useDealHealthBatch({ tiers: ["critical", "at_risk"] });

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {deals?.slice(0, 6).map((deal: any) => (
        <Card key={deal.id} className="glass border-border/40 hover:border-primary/40 transition-all duration-300 card-elevated">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-semibold truncate max-w-[150px]">
                  {deal.sales?.client_name || "Cliente Desconhecido"}
                </CardTitle>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                  {deal.sales?.product_name || "Produto"}
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-1.5 rounded-full bg-destructive/10 text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Risco crítico detectado pela IA</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <DealRiskMeter score={deal.health_score} label="Probabilidade de Churn/Perda" size="md" />
            
            <div className="space-y-2 pt-2 border-t border-border/30">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Fatores de Risco</p>
              
              <div className="grid grid-cols-2 gap-2">
                <RiskFactor 
                  icon={Hourglass} 
                  label="Tempo no Estágio" 
                  value={`${deal.days_in_stage || 0} dias`} 
                  status={deal.days_in_stage > 15 ? "risk" : "ok"} 
                />
                <RiskFactor 
                  icon={Activity} 
                  label="Inatividade" 
                  value="12 dias" 
                  status="warning" 
                />
                <RiskFactor 
                  icon={TrendingDown} 
                  label="Engajamento" 
                  value="-24%" 
                  status="risk" 
                />
                <RiskFactor 
                  icon={TrendingUp} 
                  label="Concorrência" 
                  value="Citada" 
                  status="risk" 
                />
              </div>
            </div>

            <div className="mt-2 p-2 rounded bg-muted/30 border border-border/20">
              <p className="text-[10px] leading-relaxed italic text-muted-foreground">
                <span className="font-bold text-primary not-italic">Insight IA:</span> {deal.ai_recommendation?.substring(0, 80)}...
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {(!deals || deals.length === 0) && (
        <div className="col-span-full py-12 text-center glass rounded-xl border border-dashed border-border/50">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
          <p className="text-sm text-muted-foreground">Nenhum deal com risco crítico no momento. Continue assim!</p>
        </div>
      )}
    </div>
  );
}

function RiskFactor({ icon: Icon, label, value, status }: { icon: any, label: string, value: string, status: "risk" | "ok" | "warning" }) {
  const statusColors = {
    risk: "text-red-500",
    warning: "text-yellow-500",
    ok: "text-green-500"
  };

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-md bg-secondary/30 border border-border/20">
      <Icon className={cn("h-3 w-3", statusColors[status])} />
      <div className="min-w-0">
        <p className="text-[9px] text-muted-foreground leading-none">{label}</p>
        <p className="text-[10px] font-bold truncate leading-tight">{value}</p>
      </div>
    </div>
  );
}
