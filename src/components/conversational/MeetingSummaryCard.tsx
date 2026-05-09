import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, CheckCircle2, ChevronRight } from "lucide-react";
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

  // Simple logic to extract key points if they start with - or * or are at the beginning
  const paragraphs = summary.split("\n").filter(p => p.trim());
  const mainSummary = paragraphs[0];
  const bulletPoints = paragraphs.slice(1).filter(p => p.trim().startsWith("-") || p.trim().startsWith("*") || p.length < 150);

  return (
    <Card variant="primary" className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3 bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/20 text-primary">
              <Brain className="size-4" />
            </div>
            Inteligência de Reunião
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${meta.className} font-medium`}>
              {meta.emoji} {meta.label}
            </Badge>
            {summarizedAt && (
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                IA • {format(new Date(summarizedAt), "dd MMM HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
          <p className="font-medium text-base text-card-foreground/90">
            {mainSummary}
          </p>
          
          {bulletPoints.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="size-3 text-primary" />
                Destaques da Conversa
              </h4>
              {bulletPoints.map((point, i) => (
                <div key={i} className="flex gap-2 items-start text-sm bg-muted/30 p-2 rounded-md border border-border/50">
                  <ChevronRight className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{point.replace(/^[-*]\s*/, "")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {keyTopics && keyTopics.length > 0 && (
          <div className="flex items-start gap-2 flex-wrap pt-3 border-t border-primary/10">
            <Sparkles className="size-3.5 text-primary mt-1 shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {keyTopics.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] py-0 px-2 font-medium bg-primary/5 hover:bg-primary/10 transition-colors border-primary/10">
                  #{t}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
