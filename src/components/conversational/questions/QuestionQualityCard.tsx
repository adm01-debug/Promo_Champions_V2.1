import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, HelpCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useAnalyzeQuestionQuality,
  useCallQuestions,
  useQuestionAnalysis,
} from "@/hooks/conversational/useQuestionAnalysis";
import { QuestionMixDonut } from "./QuestionMixDonut";
import { QuestionDepthChart } from "./QuestionDepthChart";
import { QuestionsList } from "./QuestionsList";
import { healthBadgeVariant, healthLabel } from "./questionHelpers";

interface Props {
  recordingId: string;
}

export const QuestionQualityCard = ({ recordingId }: Props) => {
  const { data: analysis, isLoading } = useQuestionAnalysis(recordingId);
  const { data: questions } = useCallQuestions(recordingId);
  const analyze = useAnalyzeQuestionQuality();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Qualidade das perguntas
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => analyze.mutate(recordingId)}
            disabled={analyze.isPending}
            className="gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${analyze.isPending ? "animate-spin" : ""}`} />
            {analysis ? "Recalcular" : "Analisar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : !analysis ? (
          <div className="text-center text-sm text-muted-foreground py-6 border border-dashed rounded">
            <Sparkles className="h-5 w-5 mx-auto mb-1 opacity-60" />
            Análise ainda não executada.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Score" value={`${Math.round(analysis.quality_score)}`} suffix="/100" />
              <Stat label="Perguntas" value={String(analysis.total_questions)} />
              <Stat label="Densidade" value={analysis.question_density.toFixed(1)} suffix="/min" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Saúde da conversa</span>
              <StatusBadge status={healthBadgeVariant(analysis.health) === "high" ? "success" : healthBadgeVariant(analysis.health)} label={healthLabel(analysis.health)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mix de perguntas</p>
                <QuestionMixDonut analysis={analysis} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profundidade</p>
                <QuestionDepthChart questions={questions ?? []} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Mini label="Discovery" value={analysis.discovery_questions} />
              <Mini label="Impacto" value={analysis.impact_questions} />
              <Mini label="Indutivas" value={analysis.leading_questions} negative />
            </div>
            <QuestionsList questions={questions ?? []} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Stat = ({ label, value, suffix }: { label: string; value: string; suffix?: string }) => (
  <div className="border rounded-md p-2 text-center">
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold tabular-nums">
      {value}
      {suffix && <span className="text-xs text-muted-foreground ml-0.5">{suffix}</span>}
    </p>
  </div>
);

const Mini = ({ label, value, negative }: { label: string; value: number; negative?: boolean }) => (
  <div className="flex items-center justify-between bg-muted/40 rounded px-2 py-1">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-medium tabular-nums ${negative && value > 0 ? "text-destructive" : ""}`}>{value}</span>
  </div>
);
