import { FC } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { usePipelinePulse } from "@/hooks/pipeline-pulse/usePipelinePulse";
import { PulseScoreHeader } from "./PulseScoreHeader";
import { PulseKpiGrid } from "./PulseKpiGrid";
import { CriticalAlertsFeed } from "./CriticalAlertsFeed";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { ModuleDrillCards } from "./ModuleDrillCards";

interface Props {
  onNavigateTab?: (tab: string) => void;
}

export const PipelinePulseHub: FC<Props> = ({ onNavigateTab }) => {
  const { data, isLoading, error } = usePipelinePulse();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card variant="destructive">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium">Erro ao carregar Pulso do Pipeline</p>
            <p className="text-sm text-muted-foreground">{(error as Error)?.message ?? "Tente novamente"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <PulseScoreHeader
        pulseScore={data.pulse_score}
        status={data.status}
        generatedAt={data.generated_at}
      />
      <PulseKpiGrid kpis={data.kpis} />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <CriticalAlertsFeed alerts={data.alerts} />
        <QuickActionsPanel />
      </div>
      <ModuleDrillCards onNavigate={(tab) => onNavigateTab?.(tab)} />
    </motion.div>
  );
};
