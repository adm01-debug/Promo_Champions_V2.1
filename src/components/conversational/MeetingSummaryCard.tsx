import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain } from "lucide-react";
import { sentimentMeta, type Sentiment } from "./meetingSummaryHelpers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  summary: string | null;
  sentiment: string | null;
  keyTopics: string[] | null;
  summarizedAt: string | null;
}

export const MeetingSummaryCard = ({ summary, sentiment, keyTopics, summarizedAt }: Props) => {
  if (!summary) return null;
  const meta = sentimentMeta[(sentiment as Sentiment) ?? "neutral"] ?? sentimentMeta.neutral;

  return (
    <Card variant="primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="size-4 text-primary" />
            Resumo executivo da reunião
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={meta.className}>
              {meta.emoji} {meta.label}
            </Badge>
            {summarizedAt && (
              <span className="text-xs text-muted-foreground">
                Gerado {format(new Date(summarizedAt), "dd/MM HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line leading-relaxed">
          {summary}
        </div>
        {keyTopics && keyTopics.length > 0 && (
          <div className="flex items-start gap-2 flex-wrap pt-2 border-t border-border/50">
            <Sparkles className="size-4 text-primary mt-1 shrink-0" />
            {keyTopics.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
