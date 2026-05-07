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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
    >
      <span className="text-xs text-muted-foreground">{kpi.label}</span>
      <span className="text-sm font-semibold tabular-nums">{formatted}</span>
    </motion.div>
  );
});

export const KPIGrid = React.memo(function KPIGrid() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          KPIs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {defaultKpis.map((kpi, index) => (
          <KPIRow key={kpi.label} kpi={kpi} index={index} />
        ))}
      </CardContent>
    </Card>
  );
});
