import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";

interface KPIItem {
  label: string;
  value: number;
  format: "currency" | "days" | "number";
}

const defaultKpis: KPIItem[] = [
  { label: "Ticket Médio", value: 2450, format: "currency" },
  { label: "Ciclo de Venda", value: 18, format: "days" },
  { label: "Leads Ativos", value: 127, format: "number" },
];

const KPIRow = React.memo(function KPIRow({ kpi, index }: { kpi: KPIItem; index: number }) {
  const animated = useCountUp(kpi.value, 1000 + index * 200);
  
  const formatted = (() => {
    switch (kpi.format) {
      case "currency":
        return `R$ ${animated.toLocaleString("pt-BR")}`;
      case "days":
        return `${animated} dias`;
      default:
        return animated.toLocaleString("pt-BR");
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col gap-1 p-4 rounded-xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-md transition-all group"
    >
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">{kpi.label}</span>
      <span className="text-xl font-black tabular-nums tracking-tight">{formatted}</span>
    </motion.div>
  );
});

export const KPIGrid = React.memo(function KPIGrid() {
  return (
    <Card className="h-full border-none bg-gradient-to-br from-primary/5 via-transparent to-accent/5 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          Métricas de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {defaultKpis.map((kpi, index) => (
          <KPIRow key={kpi.label} kpi={kpi} index={index} />
        ))}
      </CardContent>
    </Card>
  );
});
