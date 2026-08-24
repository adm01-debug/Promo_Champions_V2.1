import { FC, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, Activity, AlertTriangle, AlertCircle } from "lucide-react";
import type { HealthTier } from "@/hooks/deal-intelligence/useDealHealth";
import { cn } from "@/lib/utils";

interface Props {
  rows: Array<{ tier: HealthTier; health_score: number }>;
}

const TIER_META: Record<HealthTier, { label: string; icon: typeof Heart; classes: string }> = {
  healthy:  { label: "Saudáveis", icon: Heart,         classes: "text-status-success border-status-success/30 bg-status-success/10" },
  watch:    { label: "Atenção",   icon: Activity,      classes: "text-info border-info/30 bg-info/10" },
  at_risk:  { label: "Em Risco",  icon: AlertTriangle, classes: "text-status-warning border-status-warning/30 bg-status-warning/10" },
  critical: { label: "Críticos",  icon: AlertCircle,   classes: "text-destructive border-destructive/30 bg-destructive/10" },
};

export const HealthKpiCards: FC<Props> = ({ rows }) => {
  const stats = useMemo(() => {
    const counts: Record<HealthTier, number> = { healthy: 0, watch: 0, at_risk: 0, critical: 0 };
    rows.forEach((r) => { counts[r.tier] = (counts[r.tier] || 0) + 1; });
    return counts;
  }, [rows]);

  const tiers: HealthTier[] = ["healthy", "watch", "at_risk", "critical"];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiers.map((t, i) => {
        const meta = TIER_META[t];
        const Icon = meta.icon;
        return (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card variant="elevated" className={cn("glass border", meta.classes.split(" ").filter(c => c.startsWith("border")).join(" "))}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{meta.label}</p>
                    <p className="text-3xl font-display font-bold tabular-nums">{stats[t]}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-xl", meta.classes)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
