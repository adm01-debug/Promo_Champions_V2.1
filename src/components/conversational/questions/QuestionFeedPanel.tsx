import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Trophy, TrendingDown, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuestionAnalysisFeed } from "@/hooks/conversational/useQuestionAnalysis";
import { healthBadgeVariant, healthLabel } from "./questionHelpers";

interface Props {
  onSelect?: (recordingId: string) => void;
}

export const QuestionFeedPanel = ({ onSelect }: Props) => {
  const { data, isLoading } = useQuestionAnalysisFeed(50);

  const { top, bottom } = useMemo(() => {
    const items = (data ?? []).filter((d) => d.total_questions > 0);
    const sorted = [...items].sort((a, b) => b.quality_score - a.quality_score);
    return { top: sorted.slice(0, 5), bottom: sorted.slice(-5).reverse() };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Qualidade de perguntas — feed
        </CardTitle>
        <CardDescription>Top performers e oportunidades de coaching nas últimas calls analisadas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : (top.length === 0 && bottom.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma análise de perguntas disponível ainda. Transcreva calls para alimentar este feed.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <Column
              icon={<Trophy className="h-4 w-4 text-success" />}
              title="Top 5 (melhor score)"
              items={top}
              onSelect={onSelect}
            />
            <Column
              icon={<TrendingDown className="h-4 w-4 text-destructive" />}
              title="Bottom 5 (oportunidade de coaching)"
              items={bottom}
              onSelect={onSelect}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ColProps {
  icon: React.ReactNode;
  title: string;
  items: ReturnType<typeof useQuestionAnalysisFeed>["data"] extends infer T ? (T extends Array<infer U> ? U[] : never) : never;
  onSelect?: (id: string) => void;
}

const Column = ({ icon, title, items, onSelect }: ColProps) => (
  <div>
    <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
      {icon}
      {title}
    </h4>
    {items.length === 0 ? (
      <p className="text-xs text-muted-foreground">Sem dados.</p>
    ) : (
      <div className="space-y-1.5">
        {items.map((it) => {
          const rec = it.call_recordings;
          const variant = healthBadgeVariant(it.health);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => rec && onSelect?.(rec.id)}
              className="w-full text-left border rounded-md p-2 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{rec?.title ?? "Call"}</span>
                <StatusBadge
                  status={variant === "high" ? "success" : variant}
                  label={`${Math.round(it.quality_score)} · ${healthLabel(it.health)}`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                <span>
                  {it.total_questions} perg · {it.discovery_questions} disc · {it.impact_questions} imp
                </span>
                {rec && <span>{format(new Date(rec.recorded_at), "dd MMM", { locale: ptBR })}</span>}
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
);
