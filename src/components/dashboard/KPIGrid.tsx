import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";

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
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{kpi.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-black text-white tabular-nums tracking-tighter">{formatted}</span>
        <ChevronRight className="h-3 w-3 text-white/10 group-hover:text-white/40 transition-colors" />
      </div>
    </motion.div>
  );
});

export const KPIGrid = React.memo(function KPIGrid() {
  return (
    <Card className="border-none bg-transparent shadow-none group">
      <CardHeader className="pb-6 pt-0 px-0">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info/10 ring-1 ring-info/20">
            <BarChart3 className="h-4 w-4 text-info" />
          </div>
          Quantum KPIs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {defaultKpis.map((kpi, index) => (
          <KPIRow key={kpi.label} kpi={kpi} index={index} />
        ))}
      </CardContent>
    </Card>
  );
});
