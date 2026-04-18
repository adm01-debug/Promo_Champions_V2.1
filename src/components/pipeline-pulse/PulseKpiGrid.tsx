import { FC, memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { formatKpi, type PulseKpi } from "./pulseHelpers";

interface Props {
  kpis: PulseKpi[];
}

const KpiCard: FC<{ kpi: PulseKpi; index: number }> = memo(({ kpi, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
  >
    <Card variant="elevated">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{kpi.label}</p>
        <p className="font-display text-2xl font-bold">{formatKpi(kpi)}</p>
        {kpi.hint && <p className="text-xs text-muted-foreground mt-1">{kpi.hint}</p>}
      </CardContent>
    </Card>
  </motion.div>
));
KpiCard.displayName = "KpiCard";

export const PulseKpiGrid: FC<Props> = ({ kpis }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
    {kpis.map((k, i) => (
      <KpiCard key={k.label} kpi={k} index={i} />
    ))}
  </div>
);
