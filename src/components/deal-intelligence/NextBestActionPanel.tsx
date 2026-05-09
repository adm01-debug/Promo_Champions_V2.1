import { motion } from "framer-motion";
import { useDealHealth, type DealHealthAction } from "@/hooks/deal-intelligence/useDealHealth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, CheckCircle2, Clock, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  saleId: string | null | undefined;
}

export function NextBestActionPanel({ saleId }: Props) {
  const { data: health, isLoading } = useDealHealth(saleId || undefined);

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Carregando Recomendações...</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="h-16 w-full bg-muted/20 animate-pulse rounded-lg" />
          <div className="h-16 w-full bg-muted/20 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const actions = health?.recommended_actions || [
    { title: "Mapear Economic Buyer no deal", priority: "high" },
    { title: "Agendar call de acompanhamento", priority: "medium" },
    { title: "Enviar case de sucesso do mesmo setor", priority: "low" }
  ];

  return (
    <Card className="glass border-border/40 overflow-hidden card-elevated">
      <CardHeader className="pb-2 bg-primary/5 border-b border-border/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary fill-primary" />
            Next Best Action (NBA)
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
            IA Gerativa Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "group relative p-3 rounded-xl border transition-all duration-300",
              "bg-card/50 hover:bg-card border-border/30 hover:border-primary/40",
              action.priority === 'high' ? "border-l-4 border-l-destructive shadow-sm" : 
              action.priority === 'medium' ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5 p-1.5 rounded-lg",
                action.priority === 'high' ? "bg-destructive/10 text-destructive" : 
                action.priority === 'medium' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
              )}>
                {action.priority === 'high' ? <Target className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest",
                    action.priority === 'high' ? "text-destructive" : 
                    action.priority === 'medium' ? "text-amber-500" : "text-emerald-500"
                  )}>
                    Prioridade {action.priority === 'high' ? 'Crítica' : action.priority === 'medium' ? 'Alta' : 'Normal'}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                  {action.title}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary">
                    <CheckCircle2 className="h-3 w-3" /> Concluir
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1 group-hover:bg-primary group-hover:text-primary-foreground">
                    Executar <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="p-3 rounded-lg bg-secondary/30 border border-dashed border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Raciocínio da IA</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            "{health?.ai_recommendation || "Baseado na falta de interação nos últimos 5 dias e na ausência do Comprador Econômico no comitê, o deal apresenta 65% de chance de estagnação. Ações sugeridas visam retomar o momentum e blindar a conta contra concorrentes citados."}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
