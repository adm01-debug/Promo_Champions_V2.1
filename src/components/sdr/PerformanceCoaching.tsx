import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function PerformanceCoaching() {
  const strengths = [
    "Alta taxa de conversão em leads quentes (92%)",
    "Consistência no volume de ligações diárias",
    "Excelente tempo de resposta inicial (< 5min)"
  ];

  const improvements = [
    "Aumentar taxa de agendamento em leads 'mornos'",
    "Utilizar mais scripts de contorno de objeção 'Preço'",
    "Melhorar o follow-up após 48h de inatividade"
  ];

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
