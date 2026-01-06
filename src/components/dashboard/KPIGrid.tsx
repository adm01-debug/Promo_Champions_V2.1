import { Receipt, Percent, Clock, RotateCcw, CreditCard, Wallet, LucideIcon } from "lucide-react";
import { useDetailedKPIs } from "@/hooks/useDashboardKPIs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const iconMap: Record<string, LucideIcon> = {
  Receipt,
  Percent,
  Clock,
  RotateCcw,
  CreditCard,
  Wallet,
};

interface KPIGridProps {
  compact?: boolean;
}

export const KPIGrid = ({ compact = false }: KPIGridProps) => {
  const { data: kpis, isLoading } = useDetailedKPIs();

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40">
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-border/40">
      <div className="mb-6">
        <h3 className="text-lg font-semibold gradient-text">KPIs Principais</h3>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Comparativo com mês anterior</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {kpis?.map((kpi) => {
          const isPositive = kpi.change > 0;
          const Icon = iconMap[kpi.icon] || Receipt;

          return (
            <Tooltip key={kpi.title}>
              <TooltipTrigger asChild>
                <motion.div 
                  className="p-4 rounded-xl bg-muted/20 border border-border/30 group cursor-help"
                  whileHover={{ 
                    scale: 1.03,
                    y: -2,
                    boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.2)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.title}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-bold">{kpi.value}</span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        isPositive ? "text-status-success bg-status-success/10" : "text-status-error bg-status-error/10"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {kpi.change}%
                    </span>
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="glass border-border/40">
                <div className="text-xs">
                  <p className="text-muted-foreground">vs. mês anterior</p>
                  <p className="font-medium gradient-text">Anterior: {kpi.previousValue}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
