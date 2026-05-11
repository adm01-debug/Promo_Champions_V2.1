import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, RefreshCcw, Loader2 } from "lucide-react";
import {
  useConversationMetrics,
  useAnalyzeConversationMetrics,
} from "@/hooks/conversational/useConversationMetrics";
import { TalkRatioDonut } from "./TalkRatioDonut";
import { PaceGauge } from "./PaceGauge";
import { EngagementBreakdown } from "./EngagementBreakdown";
import { healthBadgeVariant, healthLabel } from "./metricsHelpers";

interface Props { recordingId: string; }

export function ConversationMetricsCard({ recordingId }: Props) {
  const { data, isLoading } = useConversationMetrics(recordingId);
  const analyze = useAnalyzeConversationMetrics();

  return (
    <Card className="glass border-primary/20 bg-primary/5 shadow-lg shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Métricas conversacionais
          {data && (
            <Badge variant={healthBadgeVariant(data.health)} className="ml-1">
              {healthLabel(data.health)}
            </Badge>
          )}
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => analyze.mutate(recordingId)}
          disabled={analyze.isPending}
        >
          {analyze.isPending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCcw className="h-3.5 w-3.5" />}
          {data ? "Recalcular" : "Calcular"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-44" />
        ) : !data ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Métricas ainda não calculadas para esta gravação.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">Talk Ratio</div>
                <TalkRatioDonut
                  seller={data.seller_talk_ratio}
                  client={data.client_talk_ratio}
                  silence={data.silence_ratio}
                />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">Cadência (vendedor)</div>
                <PaceGauge wpm={data.seller_words_per_minute} paceScore={data.pace_score} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">Engajamento</div>
                <div className="text-xs text-muted-foreground">
                  Score: <span className="font-semibold text-foreground">{Math.round(data.engagement_score)}</span>/100
                </div>
              </div>
              <EngagementBreakdown metrics={data} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
