import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, UserCheck, Activity, Target } from "lucide-react";
import { motion } from "framer-motion";

export function LeadScoreBreakdown({ leadName = "Acme Corp", score = 85 }) {
  const factors = [
    { label: "Fit do Perfil (ICP)", value: 90, icon: UserCheck, color: "bg-primary" },
    { label: "Engajamento Recente", value: 75, icon: Activity, color: "bg-success" },
    { label: "Intenção de Compra", value: 85, icon: Target, color: "bg-warning" },
  ];

  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Análise de Score: {leadName}
          </CardTitle>
          <div className="flex items-center gap-2">
             <span className="text-lg font-black text-primary">{score}</span>
             <Badge className="bg-primary/20 text-primary border-primary/30">QUENTE</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {factors.map((factor, i) => (
          <motion.div 
            key={factor.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-1.5"
          >
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <factor.icon className="h-3 w-3" />
                {factor.label}
              </div>
              <span>{factor.value}%</span>
            </div>
            <Progress value={factor.value} className={`h-1.5 ${factor.color}`} />
          </motion.div>
        ))}
        
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            "Este lead demonstra alto interesse no módulo de automação. Recomenda-se focar o pitch na redução de custos operacionais."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
