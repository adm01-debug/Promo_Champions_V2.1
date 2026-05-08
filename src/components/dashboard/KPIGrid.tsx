import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";

interface KPIItem {
  label: string;
  value: number;
  format: "currency" | "days" | "number";
  id: string;
}

const defaultKpis: KPIItem[] = [
  { id: "ticket", label: "Average Ticket", value: 2450, format: "currency" },
  { id: "cycle", label: "Sales Cycle", value: 18, format: "days" },
  { id: "leads", label: "Active Leads", value: 127, format: "number" },
];

const KPIRow = React.memo(function KPIRow({ kpi, index }: { kpi: KPIItem; index: number }) {
  const animated = useCountUp(kpi.value, 1000 + index * 200);
  
  const formatted = (() => {
    switch (kpi.format) {
      case "currency":
        return `R$ ${animated.toLocaleString("pt-BR")}`;
      case "days":
        return `${animated}d`;
      default:
        return animated.toLocaleString("pt-BR");
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex flex-col gap-1 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.06] transition-all group overflow-hidden"
    >
      <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors z-10">{kpi.label}</span>
      <span className="text-2xl font-display font-black tabular-nums tracking-tighter z-10">{formatted}</span>
      
      {/* Visual activity indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-30 transition-opacity">
        <Activity className="h-8 w-8 text-primary" />
      </div>

      {/* Micro decoration */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
});

export const KPIGrid = React.memo(function KPIGrid() {
  return (
    <Card className="h-full relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <BarChart3 className="h-3.5 w-3.5" />
          </div>
          System Metrics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        {defaultKpis.map((kpi, index) => (
          <KPIRow key={kpi.id} kpi={kpi} index={index} />
        ))}
      </CardContent>

      {/* Background ambient glow */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />
    </Card>
  );
});