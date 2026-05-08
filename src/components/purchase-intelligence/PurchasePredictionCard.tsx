import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  CalendarPlus, 
  FileText, 
  CheckCircle2,
  Zap,
  ChevronRight,
  MousePointerClick
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePurchaseIntelligence } from "@/hooks/purchase-intelligence/usePurchaseIntelligence";
import {
  CONTACT_WINDOW_LABELS,
  formatBRL,
  formatDatePt,
  riskColor,
  riskLabel,
} from "./purchaseIntelligenceHelpers";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  clientId?: string;
}

export function PurchasePredictionCard({ clientId }: Props) {
  const { data, isLoading, isFetching } = usePurchaseIntelligence(clientId, true);

  if (!clientId) {
    return (
      <Card className="h-full border-dashed border-2 flex items-center justify-center bg-muted/20">
        <CardContent className="py-20 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <MousePointerClick className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Selecione um cliente para ativar<br />a análise preditiva de IA.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <Skeleton className="h-[600px] rounded-2xl w-full" />;
  if (!data) return null;

  const ai = data.ai_prediction;
  const risk = ai?.churn_risk_score ?? 0;
  
  // Calculate cycle progress (simplified example)
  const cycleDays = data.avg_cycle_days || 30;
  const daysSinceLast = data.days_since_last_purchase || 0;
  const cycleProgress = Math.min(100, (daysSinceLast / cycleDays) * 100);
  const isOverdue = daysSinceLast > cycleDays;

  return (
    <Card className="border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl h-full flex flex-col overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground/90">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Brain className="h-5 w-5 text-primary animate-pulse" />
            </div>
            Inteligência Preditiva
          </CardTitle>
          <AnimatePresence>
            {isFetching && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5 border border-primary/20"
              >
                <Sparkles className="h-3 w-3 animate-pulse text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">Sincronizando IA</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Core Stats Grid with Neon Accents */}
        <div className="grid grid-cols-2 gap-3">
          <Stat 
            label="Volume Total" 
            value={String(data.total_purchases)} 
            icon={<Zap className="h-3 w-3" />}
            className="bg-primary/5 border-primary/10"
          />
          <Stat 
            label="Ticket Médio" 
            value={formatBRL(data.avg_ticket)} 
            icon={<TrendingUp className="h-3 w-3" />}
          />
        </div>

        {/* Lifecycle Tracker - Visual Progress */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ciclo de Compra</span>
              <div className="text-sm font-medium">
                Última: <span className="font-bold">{daysSinceLast} dias atrás</span>
              </div>
            </div>
            <Badge variant={isOverdue ? "destructive" : "secondary"} className="h-fit">
              {isOverdue ? "Atrasado" : `Média: ${cycleDays}d`}
            </Badge>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={cn(
                  "text-[10px] font-semibold inline-block py-1 px-2 uppercase rounded-full",
                  isOverdue ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"
                )}>
                  Status de Janela
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold inline-block text-primary">
                  {cycleProgress.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2.5 mb-1 text-xs flex rounded-full bg-muted border border-border/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${cycleProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500",
                  isOverdue ? "bg-destructive" : "bg-gradient-to-r from-primary/60 to-primary"
                )}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2 italic">
              {isOverdue 
                ? "O cliente excedeu a janela média de recompra. Risco elevado."
                : `Aproximadamente ${Math.max(0, cycleDays - daysSinceLast)} dias para a próxima janela.`}
            </p>
          </div>
        </div>

        {/* AI Intelligence Sector */}
        <AnimatePresence mode="wait">
          {ai ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 relative overflow-hidden group/card shadow-[0_0_20px_rgba(139,92,246,0.05)] hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
                    <TrendingUp className="h-16 w-16 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2 uppercase tracking-tight">
                    <Sparkles className="h-3.5 w-3.5" /> Próxima Compra
                  </div>
                  <div className="text-xl font-black text-foreground tracking-tight group-hover/card:text-primary transition-colors">{formatDatePt(ai.predicted_next_purchase_date)}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">{formatBRL(ai.predicted_amount)}</span>
                    <Badge variant="outline" className="text-[9px] border-primary/20 text-primary bg-primary/10 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                      {(ai.confidence * 100).toFixed(0)}% CONFIDENCE
                    </Badge>
                  </div>
                </div>

                <div 
                  className="rounded-xl border-2 p-4 relative overflow-hidden group"
                  style={{ borderColor: `${riskColor(risk)}44`, backgroundColor: `${riskColor(risk)}11` }}
                >
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertTriangle className="h-16 w-16" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold mb-2 uppercase tracking-tight" style={{ color: riskColor(risk) }}>
                    <AlertTriangle className="h-3.5 w-3.5" /> Churn Risk
                  </div>
                  <div className="text-xl font-black tracking-tight" style={{ color: riskColor(risk) }}>
                    {risk}/100 · {riskLabel(risk)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {ai.risk_reasons[0] || "Sem alertas graves no momento."}
                  </div>
                </div>
              </div>

              {/* Insights and Strategic Actions */}
              <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      Insight Estratégico <Badge variant="outline" className="text-[10px] h-4 py-0">{CONTACT_WINDOW_LABELS[ai.best_contact_window]}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 italic">
                      "{ai.pattern_insight}"
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    Ação Recomendada <Zap className="h-3 w-3 fill-primary" />
                  </div>
                  <p className="text-base font-bold text-foreground mb-5 leading-tight">
                    {ai.recommended_action}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button size="sm" className="w-full gap-2 font-bold shadow-lg shadow-primary/20">
                      <CalendarPlus className="h-4 w-4" /> Agendar
                    </Button>
                    <Button size="sm" variant="outline" className="w-full gap-2 font-bold border-primary/20 hover:bg-primary/5">
                      <FileText className="h-4 w-4" /> Proposta
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : data.ai_error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border-2 border-warning/20 bg-warning/5 p-6 text-center space-y-3"
            >
              <AlertTriangle className="mx-auto h-8 w-8 text-warning opacity-60" />
              <p className="text-sm font-bold text-warning leading-tight">
                {data.ai_error === "rate_limited"
                  ? "Limite de Inteligência atingido. Aguarde 60 segundos."
                  : data.ai_error === "credits_required"
                  ? "Créditos de IA insuficientes para este workspace."
                  : "Análise IA temporariamente fora de serviço."}
              </p>
              <Button variant="outline" size="sm" className="text-xs font-bold border-warning/20 text-warning hover:bg-warning/10">
                Tentar Recarregar
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-6 border border-dashed rounded-xl border-border/60">
              <Clock className="mx-auto h-6 w-6 text-muted-foreground opacity-30 mb-2" />
              <div className="text-xs font-medium text-muted-foreground">
                Média de cadência estima próxima compra para:
              </div>
              <div className="text-lg font-black text-foreground mt-1">
                {formatDatePt(data.predicted_next_purchase_date)}
              </div>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
      
      <div className="p-4 bg-muted/30 border-t border-border/50 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
            +9
          </div>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
          Share de Carteira: <span className="text-primary font-black">{data.share_with_me_pct.toFixed(0)}%</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value, icon, className }: { label: string; value: string; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card/80 p-3.5 transition-all hover:border-primary/30 group", className)}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
        {icon && <span className="text-primary/70">{icon}</span>}
        {label}
      </div>
      <div className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{value}</div>
    </div>
  );
}
