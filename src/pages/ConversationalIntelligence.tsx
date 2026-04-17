import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Mic, Sparkles, MessageSquare, Target, AlertCircle, TrendingUp, Lightbulb, Trash2, FileText } from "lucide-react";
import { useCallRecordings, useCallInsight, useCreateRecordingWithAnalysis, useDeleteRecording } from "@/hooks/conversational/useCallRecordings";
import { CallRecordingUploader } from "@/components/conversational/CallRecordingUploader";
import { CallRecordingPlayer } from "@/components/conversational/CallRecordingPlayer";
import { Helmet } from "react-helmet-async";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const SENTIMENT_COLORS: Record<string, string> = {
  very_positive: "text-status-success",
  positive: "text-status-success",
  neutral: "text-muted-foreground",
  negative: "text-status-warning",
  very_negative: "text-destructive",
};

const SENTIMENT_LABELS: Record<string, string> = {
  very_positive: "Muito positivo",
  positive: "Positivo",
  neutral: "Neutro",
  negative: "Negativo",
  very_negative: "Muito negativo",
};

export default function ConversationalIntelligence() {
  const { data: recordings, isLoading } = useCallRecordings();
  const create = useCreateRecordingWithAnalysis();
  const del = useDeleteRecording();
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const { data: insight } = useCallInsight(selected ?? undefined);

  const handleAnalyze = () => {
    if (!title.trim() || !transcript.trim()) return;
    create.mutate(
      { title, transcript_text: transcript, duration_seconds: Math.round(transcript.split(/\s+/).length / 2.5) },
      {
        onSuccess: () => {
          setTitle("");
          setTranscript("");
        },
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Conversational Intelligence | Promo Champions</title>
        <meta name="description" content="Análise inteligente de calls de vendas com IA — sentimento, objeções, coaching." />
      </Helmet>

      <div className="container max-w-7xl py-6 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Conversational Intelligence
            </h1>
            <p className="text-sm text-muted-foreground">Transcreva, analise e melhore suas calls de vendas com IA</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Nova análise */}
          <Card className="glass border-border/40 lg:col-span-1 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" /> Nova análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Título da call</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Discovery Acme Ltda" className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Transcrição (cole aqui)</Label>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Vendedor: Bom dia! Como posso ajudar?&#10;Cliente: Estou interessado em..."
                  className="min-h-[200px] text-xs font-mono resize-none"
                />
                <p className="text-[10px] text-muted-foreground">{transcript.split(/\s+/).filter(Boolean).length} palavras</p>
              </div>
              <Button
                variant="glow"
                className="w-full gap-2"
                onClick={handleAnalyze}
                disabled={create.isPending || !title.trim() || !transcript.trim()}
              >
                <Sparkles className="h-4 w-4" />
                {create.isPending ? "Analisando..." : "Analisar com IA"}
              </Button>
            </CardContent>
          </Card>

          {/* Coluna 2: Lista */}
          <Card className="glass border-border/40 lg:col-span-1 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Histórico ({recordings?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-3">
                {isLoading && <Skeleton className="h-20 w-full" />}
                {!isLoading && (!recordings || recordings.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhuma call analisada ainda.</p>
                )}
                <div className="space-y-2">
                  {recordings?.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selected === r.id ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(r.recorded_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant={r.status === "ready" ? "secondary" : "outline"} className="text-[9px] shrink-0">
                          {r.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Coluna 3: Insights */}
          <Card className="glass border-border/40 lg:col-span-1">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Insights
              </CardTitle>
              {selected && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del.mutate(selected)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selected && <p className="text-xs text-muted-foreground text-center py-8">Selecione uma call para ver os insights.</p>}
              {selected && !insight && <Skeleton className="h-40 w-full" />}
              {insight && (
                <ScrollArea className="h-[500px] pr-3">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sentimento</p>
                      <p className={`text-lg font-semibold ${SENTIMENT_COLORS[insight.sentiment_label ?? "neutral"]}`}>
                        {SENTIMENT_LABELS[insight.sentiment_label ?? "neutral"]} ({insight.sentiment_score?.toFixed(2)})
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Talk Ratio</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Vendedor</span>
                          <span className="tabular-nums">{insight.talk_ratio_salesperson?.toFixed(0)}%</span>
                        </div>
                        <Progress value={insight.talk_ratio_salesperson ?? 0} className="h-1.5" />
                        <div className="flex justify-between text-xs pt-1">
                          <span>Cliente</span>
                          <span className="tabular-nums">{insight.talk_ratio_client?.toFixed(0)}%</span>
                        </div>
                        <Progress value={insight.talk_ratio_client ?? 0} className="h-1.5" />
                      </div>
                    </div>

                    {insight.summary && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Resumo
                        </p>
                        <p className="text-xs leading-relaxed">{insight.summary}</p>
                      </div>
                    )}

                    {insight.topics?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tópicos</p>
                        <div className="flex flex-wrap gap-1">
                          {insight.topics.map((t, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insight.objections?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-status-warning" /> Objeções
                        </p>
                        <ul className="text-xs space-y-1 list-disc list-inside text-status-warning">
                          {insight.objections.map((o, i) => <li key={i}>{o}</li>)}
                        </ul>
                      </div>
                    )}

                    {insight.next_steps?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Target className="h-3 w-3 text-primary" /> Próximos passos
                        </p>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          {insight.next_steps.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}

                    {insight.coaching_tips?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Lightbulb className="h-3 w-3 text-status-warning" /> Coaching
                        </p>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          {insight.coaching_tips.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
