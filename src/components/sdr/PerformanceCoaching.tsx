import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useSDRMetrics } from "@/hooks/useSDRMetrics";

export function PerformanceCoaching() {
  const { data: metrics } = useSDRMetrics("month");

  const generateInsights = () => {
    if (!metrics) return { strengths: [], improvements: [] };

    const schedulingRate = metrics.current.schedulingRate;
    const leads = metrics.current.totalLeads;
    const qualified = metrics.current.qualifiedLeads;

    const strengths = [];
    const improvements = [];

    if (schedulingRate > 20) {
      strengths.push(`Alta taxa de agendamento (${schedulingRate.toFixed(1)}%)`);
    } else {
      improvements.push(`Aumentar taxa de agendamento (atualmente ${schedulingRate.toFixed(1)}%)`);
    }

    if (leads > 100) {
      strengths.push(`Ótimo volume de novos leads (${leads})`);
    } else {
      improvements.push("Aumentar volume de prospecção diária");
    }

    if (qualified / leads > 0.5) {
      strengths.push("Excelente qualidade de filtros (ICP Match)");
    } else {
      improvements.push("Refinar critérios de qualificação (MQL → SQL)");
    }

    // Default fallbacks if empty
    if (strengths.length === 0) strengths.push("Consistência no volume de atividades");
    if (improvements.length === 0) improvements.push("Explorar novos canais de prospecção (LinkedIn)");

    return { strengths, improvements };
  };

  const { strengths, improvements } = generateInsights();

  return (
    <Card className="glass border-primary/20 overflow-hidden h-full">
      <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            Coaching de Performance
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            AI Mentor
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
          {/* Strengths */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Pontos Fortes</h4>
            </div>
            <ul className="space-y-3">
              {strengths.map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-xs text-foreground/80"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-5 space-y-4 bg-warning/5">
            <div className="flex items-center gap-2 text-warning">
              <Lightbulb className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Oportunidades</h4>
            </div>
            <ul className="space-y-3">
              {improvements.map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-xs text-foreground/80"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-primary/10 border-t border-primary/20">
          <p className="text-[11px] font-medium text-primary flex items-center gap-2">
            <Zap className="h-3.5 w-3.5" />
            Dica do dia: "Personalize os primeiros 30 segundos do pitch usando o Insight de Ouro do CRM."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
