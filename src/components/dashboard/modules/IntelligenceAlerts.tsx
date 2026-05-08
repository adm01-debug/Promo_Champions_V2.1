import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, AlertCircle, ArrowUpRight, Target, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    id: 1,
    title: "Oportunidade de Upsell Iminente",
    description: "5 clientes VIP atingiram 85% do ciclo de vida do produto atual.",
    priority: "high",
    impact: "+R$ 45.000",
    category: "Retenção"
  },
  {
    id: 2,
    title: "Anomalia Detectada: Ciclo de Compra",
    description: "Aumento repentino no tempo de decisão na categoria 'Eletrônicos'.",
    priority: "medium",
    impact: "-12% Conversão",
    category: "Análise"
  },
  {
    id: 3,
    title: "Lead 'Hot' Identificado",
    description: "Empresa XPTO realizou 12 interações nas últimas 2 horas.",
    priority: "high",
    impact: "Lead Scoring: 98",
    category: "Vendas"
  }
];

export const IntelligenceAlerts = React.memo(() => {
  return (
    <Card className="h-full border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden group">
      <CardHeader className="pb-2 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <BrainCircuit className="h-3.5 w-3.5" />
            </div>
            Intelligence Hub Alerts
          </CardTitle>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 animate-pulse">
            Live Updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all group/item overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                      alert.priority === "high" ? "bg-destructive/20 text-destructive border border-destructive/30" : "bg-warning/20 text-warning border border-warning/30"
                    )}>
                      {alert.category}
                    </span>
                    <h4 className="text-xs font-bold text-foreground/90">{alert.title}</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-primary font-bold">
                      <Zap className="h-3 w-3" />
                      IMPACTO: {alert.impact}
                    </div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/20 hover:text-primary transition-all">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Progress indicator decoration */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-[2px]",
                alert.priority === "high" ? "bg-destructive" : "bg-warning"
              )} />
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

// Helper for cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
