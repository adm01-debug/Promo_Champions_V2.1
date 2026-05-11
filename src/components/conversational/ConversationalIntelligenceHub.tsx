import { useState, useMemo } from "react";
import { useConversationalIntelligence } from "@/hooks/useConversationalIntelligence";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Headphones, Search, Mic, MessageSquare, TrendingUp, Clock, AlertTriangle, Sparkles, Brain, Zap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RecordingSummaryDrawer, useRecordingSummaryDrawer } from "./RecordingSummaryDrawer";
import { CallLibrarySearch } from "./CallLibrarySearch";
import { CompetitorsAdminDialog } from "./CompetitorsAdminDialog";
import { ConversationMetricsFeed } from "./metrics/ConversationMetricsFeed";
import { QuestionFeedPanel } from "./questions/QuestionFeedPanel";
import { ObjectionLibraryPanel } from "./objections/ObjectionLibraryPanel";
import { CoachingLeaderboardPanel } from "./coaching/CoachingLeaderboardPanel";
import { LiveIntelligenceFeed } from "./LiveIntelligenceFeed";

const sentimentColor = (label: string | null) => {
  if (label === "positive") return "bg-success/10 text-success border-success/30";
  if (label === "negative") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground";
};

export const ConversationalIntelligenceHub = () => {
  const [horizon, setHorizon] = useState(30);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useConversationalIntelligence(horizon);
  const drawer = useRecordingSummaryDrawer();

  const filteredRecordings = useMemo(() => {
    if (!data) return [];
    return data.recordings.filter(
      (r) =>
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.summary?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-page-title font-bold flex items-center gap-2">
            <Headphones className="size-7 text-primary" />
            Conversational Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights de IA sobre suas chamadas: sentimento, talk ratio, objeções e próximos passos
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompetitorsAdminDialog />
          <Tabs value={String(horizon)} onValueChange={(v) => setHorizon(Number(v))}>
            <TabsList>
              <TabsTrigger value="7">7 dias</TabsTrigger>
              <TabsTrigger value="30">30 dias</TabsTrigger>
              <TabsTrigger value="90">90 dias</TabsTrigger>
              <TabsTrigger value="live" className="text-primary font-bold">
                <Zap className="size-3 mr-1 animate-pulse" /> LIVE
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard icon={Mic} label="Chamadas" value={data.kpis.total_calls} hint={`${data.kpis.coverage_percent}% analisadas pela IA`} trend="+12%" />
            <KPICard icon={Clock} label="Tempo total" value={`${data.kpis.total_duration_minutes}m`} hint={`Média ${data.kpis.avg_duration_minutes}m / call`} trend="-5%" />
            <KPICard icon={TrendingUp} label="Sentimento médio" value={data.kpis.avg_sentiment.toFixed(2)} hint="Escala -1 a +1" trend="+0.05" />
            <KPICard icon={MessageSquare} label="Talk ratio (vendedor)" value={`${Math.round(data.kpis.avg_talk_ratio_salesperson * 100)}%`} hint={`${data.kpis.avg_questions_per_call} perguntas / call`} trend="Ideal" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Distribuição de sentimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["positive", "neutral", "negative"] as const).map((k) => {
                  const v = data.sentiment_distribution[k];
                  const total =
                    data.sentiment_distribution.positive +
                    data.sentiment_distribution.neutral +
                    data.sentiment_distribution.negative;
                  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{k === "positive" ? "Positivo" : k === "negative" ? "Negativo" : "Neutro"}</span>
                        <span className="text-muted-foreground">{v} ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="size-4 text-warning" />
                  Top objeções
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.top_objections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma objeção registrada.</p>
                ) : (
                  data.top_objections.map((o) => (
                    <div key={o.label} className="flex justify-between items-center text-sm">
                      <span className="truncate">{o.label}</span>
                      <Badge variant="secondary">{o.count}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top tópicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.top_topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum tópico identificado.</p>
                ) : (
                  data.top_topics.map((t) => (
                    <div key={t.label} className="flex justify-between items-center text-sm">
                      <span className="truncate">{t.label}</span>
                      <Badge variant="outline">{t.count}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {horizon === 0 || String(horizon) === 'live' ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                   <Card className="h-[600px] flex flex-col items-center justify-center border-dashed">
                      <Headphones className="size-16 opacity-10 mb-4 animate-bounce" />
                      <p className="text-sm font-medium">Sincronizando áudio em tempo real...</p>
                      <p className="text-xs text-muted-foreground mt-1">Conecte o discador Twilio ou Zoom para iniciar</p>
                   </Card>
                </div>
                <div className="space-y-4">
                   <LiveIntelligenceFeed />
                   <CoachingLeaderboardPanel />
                </div>
             </div>
          ) : (
            <>
              <ConversationMetricsFeed />
              <QuestionFeedPanel onSelect={drawer.open} />
              <ObjectionLibraryPanel onSelect={drawer.open} />
              <CoachingLeaderboardPanel />
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de chamadas (Full-text Search)</CardTitle>
              <CardDescription>
                Busca semântica nos transcripts — encontre objeções, concorrentes e tópicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallLibrarySearch onSelectRecording={drawer.open} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Todas as chamadas</CardTitle>
                  <CardDescription>Filtro rápido por título ou resumo</CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar chamadas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRecordings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Headphones className="size-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma chamada encontrada no período.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRecordings.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => drawer.open(r.id)}
                      className="w-full text-left border border-border rounded-lg p-4 hover:bg-muted/40 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{r.title}</h3>
                            {r.sentiment_label && (
                              <Badge variant="outline" className={sentimentColor(r.sentiment_label)}>
                                {r.sentiment_label}
                              </Badge>
                            )}
                            {!r.has_insights && (
                              <Badge variant="outline" className="text-xs">Sem análise IA</Badge>
                            )}
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Brain className="size-3" /> Ver resumo
                            </Badge>
                          </div>
                          {r.summary && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.summary}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span>{format(new Date(r.recorded_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            <span>{Math.round(r.duration_seconds / 60)}min</span>
                            {r.questions_asked != null && <span>{r.questions_asked} perguntas</span>}
                            {r.objections_count > 0 && <span className="text-warning">{r.objections_count} objeções</span>}
                            {r.next_steps_count > 0 && <span className="text-success">{r.next_steps_count} próximos passos</span>}
                          </div>
                        </div>
                        {r.talk_ratio_salesperson != null && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Talk ratio</p>
                            <p className="text-sm font-semibold">
                              {Math.round(r.talk_ratio_salesperson * 100)}% / {Math.round((r.talk_ratio_client ?? 0) * 100)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
      <RecordingSummaryDrawer recordingId={drawer.openId} onClose={drawer.close} />
    </div>
  );
};

const KPICard = ({
  icon: Icon,
  label,
  value,
  hint,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
}) => (
  <Card className="glass border-border/40 hover:border-primary/30 transition-all duration-300 group">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">{value}</p>
            {trend && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                trend.includes('+') ? 'bg-success/10 text-success' : 
                trend.includes('-') ? 'bg-destructive/10 text-destructive' : 
                'bg-primary/10 text-primary'
              }`}>
                {trend}
              </span>
            )}
          </div>
          {hint && <p className="text-[10px] text-muted-foreground font-medium">{hint}</p>}
        </div>
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-sm shadow-primary/20">
          <Icon className="size-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);
