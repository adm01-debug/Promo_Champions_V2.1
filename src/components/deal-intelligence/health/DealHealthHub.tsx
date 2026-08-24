import { FC } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sparkles } from "lucide-react";
import { useDealHealthBatch, useRecalculateDealHealth, type HealthTier } from "@/hooks/deal-intelligence/useDealHealth";
import { HealthKpiCards } from "./HealthKpiCards";
import { HealthDistributionChart } from "./HealthDistributionChart";
import { CriticalDealsTable } from "./CriticalDealsTable";

interface BatchRow {
  id: string;
  sale_id: string;
  health_score: number;
  tier: HealthTier;
  days_in_stage: number | null;
  ai_recommendation: string | null;
  sales?: {
    id: string;
    client_name: string | null;
    product_name: string | null;
    amount: number | null;
    status: string | null;
    salesperson_id: string | null;
  } | null;
}

export const DealHealthHub: FC = () => {
  const { data, isLoading } = useDealHealthBatch();
  const recalc = useRecalculateDealHealth();

  const rows = (data || []) as unknown as BatchRow[];
  const avgScore = rows.length
    ? Math.round(rows.reduce((acc, r) => acc + r.health_score, 0) / rows.length)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-section-title font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Saúde do Pipeline
          </h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} deals analisados · Score médio <span className="font-semibold text-foreground tabular-nums">{avgScore}/100</span>
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => recalc.mutate({ batch: true })}
          disabled={recalc.isPending}
          className="gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${recalc.isPending ? "animate-spin" : ""}`} />
          Recalcular Tudo
        </Button>
      </div>

      <HealthKpiCards rows={rows} />

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <HealthDistributionChart rows={rows} />
        <CriticalDealsTable rows={rows} />
      </div>
    </motion.div>
  );
};
