import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sparkles } from "lucide-react";
import {
  useAnalyzeStageConversion,
  useStageBottlenecks,
  useStageConversion,
} from "@/hooks/deal-intelligence/useStageConversion";
import { ConversionFunnelChart } from "./ConversionFunnelChart";
import { StageBottleneckCard } from "./StageBottleneckCard";

export function ConversionOptimizerPanel() {
  const { data: metrics, isLoading: lm } = useStageConversion();
  const { data: insights, isLoading: li } = useStageBottlenecks();
  const analyze = useAnalyzeStageConversion();

  const isLoading = lm || li;
  const hasData = (metrics?.length ?? 0) > 0 || (insights?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Otimizador de Conversão
          </h2>
          <p className="text-sm text-muted-foreground">
            Gargalos do funil com recomendações de IA por estágio
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => analyze.mutate({ days: 90 })}
          disabled={analyze.isPending}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${analyze.isPending ? "animate-spin" : ""}`} />
          Recalcular
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        </div>
      ) : !hasData ? (
        <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border/50 rounded-xl">
          Sem análise disponível. Clique em <strong>Recalcular</strong> para gerar insights de conversão.
        </div>
      ) : (
        <>
          <ConversionFunnelChart metrics={metrics ?? []} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(insights ?? []).map((ins) => (
              <StageBottleneckCard key={ins.id} insight={ins} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
