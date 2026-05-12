import { useState, useMemo } from "react";
import { useConversationalIntelligence } from "@/hooks/useConversationalIntelligence";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { NeuralSoundwave } from "./NeuralSoundwave";
import { NeuralSentimentTimeline } from "./NeuralSentimentTimeline";

const sentimentColor = (label: string | null) => {
  if (label === "positive") return "bg-success/10 text-success border-success/30";
  if (label === "negative") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground";
};

export const ConversationalIntelligenceHub = () => {
  const [horizon, setHorizon] = useState<number | "live">(30);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useConversationalIntelligence(horizon === "live" ? 0 : horizon);
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
    <div className="space-y-12 relative pb-20">
      {/* Background Neural Matrix Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-info/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header Premium 10/10 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner group hover:scale-110 transition-transform">
              <Headphones className="size-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black tracking-[0.2em] uppercase py-0.5 px-2">
                  Neural Audio Analysis
                </Badge>
                {horizon === "live" && (
                  <div className="flex items-center gap-1.5 text-[10px] text-destructive font-black tracking-wider animate-pulse">
                    <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-ping" />
                    STREAMING LIVE
                  </div>
                )}
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-black font-sora tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent sm:text-6xl">
            Conversational <span className="text-primary/80">Intelligence</span>
          </h1>
          <p className="text-base text-muted-foreground/80 max-w-2xl font-medium leading-relaxed">
            Decifre cada palavra, tom e hesitação. Nossa IA neural processa milhões de parâmetros para transformar diálogos em fechamentos inevitáveis.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <CompetitorsAdminDialog />
          <div className="w-px h-8 bg-white/10 mx-1" />
          <Tabs value={String(horizon)} onValueChange={(v) => setHorizon(v === 'live' ? 'live' : Number(v))} className="bg-transparent">
            <TabsList className="bg-white/5 border-none p-1">
              <TabsTrigger value="7" className="text-xs font-black px-4">7D</TabsTrigger>
              <TabsTrigger value="30" className="text-xs font-black px-4">30D</TabsTrigger>
              <TabsTrigger value="90" className="text-xs font-black px-4">90D</TabsTrigger>
              <TabsTrigger value="live" className="text-xs font-black px-5 bg-destructive/10 text-destructive data-[state=active]:bg-destructive data-[state=active]:text-white transition-all gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                LIVE
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <KPICard icon={Mic} label="Mapeamento de Voz" value={data.kpis.total_calls} hint={`${data.kpis.coverage_percent}% coverage`} trend="+12%" accent="text-primary" />
            <KPICard icon={Clock} label="Tempo de Exposição" value={`${data.kpis.total_duration_minutes}m`} hint={`Média ${data.kpis.avg_duration_minutes}m / call`} trend="-5%" accent="text-info" />
            <KPICard icon={TrendingUp} label="Neural Sentiment" value={data.kpis.avg_sentiment.toFixed(2)} hint="Escala de Empatia (-1 a +1)" trend="+0.05" accent="text-success" />
            <KPICard icon={MessageSquare} label="Ratio de Persuasão" value={`${Math.round(data.kpis.avg_talk_ratio_salesperson * 100)}%`} hint={`${data.kpis.avg_questions_per_call} Q/call`} trend="Ideal" accent="text-warning" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card className="glass border-white/5 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain className="size-24" />
              </div>
              <CardHeader className="pb-6 border-b border-white/5 bg-white/5">
                <CardTitle className="text-base font-black uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="size-4 text-primary animate-pulse" />
                  Distribuição de Sentimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-8">
                {(["positive", "neutral", "negative"] as const).map((k) => {
                  const v = data.sentiment_distribution[k];
                  const total =
                    data.sentiment_distribution.positive +
                    data.sentiment_distribution.neutral +
                    data.sentiment_distribution.negative;
                  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  const color = k === "positive" ? "bg-success" : k === "negative" ? "bg-destructive" : "bg-muted-foreground";
                  
                  return (
                    <div key={k} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="flex items-center gap-1.5">
                          <div className={cn("h-1.5 w-1.5 rounded-full", color)} />
                          {k === "positive" ? "Positivo" : k === "negative" ? "Negativo" : "Neutro"}
                        </span>
                        <span className="text-muted-foreground">{v} unidades ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className={cn("h-full rounded-full", color)} 
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass border-white/5 shadow-2xl overflow-hidden group">
              <CardHeader className="pb-6 border-b border-white/5 bg-warning/5">
                <CardTitle className="text-base font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="size-4 text-warning" />
                  Barreiras de Fechamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {data.top_objections.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-10">Nenhuma barreira crítica registrada.</p>
                ) : (
                  data.top_objections.map((o) => (
                    <div key={o.label} className="flex justify-between items-center p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all group/item">
                      <span className="text-xs font-bold group-hover/item:text-warning transition-colors">{o.label}</span>
                      <Badge className="bg-warning/20 text-warning border-none font-black text-[10px]">{o.count} ocorrências</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="glass border-white/5 shadow-2xl overflow-hidden group">
              <CardHeader className="pb-6 border-b border-white/5 bg-primary/5">
                <CardTitle className="text-base font-black uppercase tracking-widest flex items-center gap-2">
                  <Brain className="size-4 text-primary" />
                  Clusters de Interesse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {data.top_topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-10">Processando tópicos neurais...</p>
                ) : (
                  data.top_topics.map((t) => (
                    <div key={t.label} className="flex justify-between items-center p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all group/item">
                      <span className="text-xs font-bold group-hover/item:text-primary transition-colors">{t.label}</span>
                      <Badge variant="outline" className="border-primary/20 text-primary font-black text-[10px]">{t.count} citações</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {horizon === 'live' ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                   <Card className="h-[650px] flex flex-col items-center justify-center border border-primary/20 bg-slate-950/60 relative overflow-hidden group shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
                      {/* Deep Neural Visual Effects */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent)]" />
                      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
                      
                      <div className="relative z-10 flex flex-col items-center text-center px-10">
                        <div className="mb-10 relative">
                          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                          <NeuralSoundwave active={true} color="bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                        </div>
                        
                        <div className="mt-8 space-y-4">
                          <div className="flex items-center justify-center gap-3">
                            <Badge className="bg-primary text-primary-foreground border-none animate-pulse font-black text-xs px-5 py-1.5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">NEURAL LINK ACTIVE</Badge>
                            <span className="text-xs font-black text-primary tabular-nums tracking-widest bg-primary/10 px-3 py-1 rounded-md border border-primary/20">00:12:45</span>
                          </div>
                          
                          <h3 className="text-4xl font-black font-sora tracking-tighter uppercase italic text-white">Neural <span className="text-primary">Coaching</span> Copilot</h3>
                          <p className="text-sm text-muted-foreground max-w-md leading-relaxed font-medium">
                            Escaneando ondas sonoras via Twilio Bridge. Nossa rede neural está processando intenções e injetando battlecards estratégicos em tempo real.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 w-full max-w-3xl">
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left backdrop-blur-md relative group/box shadow-2xl"
                          >
                            <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-primary transition-all duration-500" />
                            <p className="text-[10px] font-black uppercase text-primary mb-2 tracking-widest flex items-center gap-2">
                               <Sparkles className="size-3 animate-pulse" /> IA Sugestão: Próxima Resposta
                            </p>
                            <p className="text-sm font-bold italic text-white leading-relaxed">
                              "Entendo a preocupação com o CAPEX. Podemos estruturar o contrato como OPEX via nossa parceria de leasing para facilitar a aprovação imediata."
                            </p>
                            <div className="mt-3 flex gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] uppercase font-black">Contexto: CAPEX/Budget</Badge>
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] uppercase font-black">Prob. Sucesso: 88%</Badge>
                            </div>
                          </motion.div>

                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left backdrop-blur-md relative group/box shadow-2xl"
                          >
                            <div className="absolute top-0 right-0 w-1 h-0 group-hover:h-full bg-warning transition-all duration-500" />
                            <p className="text-[10px] font-black uppercase text-warning mb-2 tracking-widest flex items-center gap-2">
                               <Zap className="size-3" /> Battlecard: ROI vs Enterprise
                            </p>
                            <p className="text-xs font-medium text-white/90 leading-relaxed mb-3">
                              Destaque que nossa implementação leva 15 dias vs 6 meses do concorrente mencionado. O custo de oportunidade da demora supera o desconto oferecido por eles.
                            </p>
                            <Button size="sm" variant="outline" className="h-6 text-[9px] font-black uppercase tracking-widest border-warning/20 text-warning hover:bg-warning/10">
                              Ver Talking Points
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Floating Particles */}
                      <div className="absolute bottom-10 left-10 h-1 w-1 bg-primary rounded-full animate-ping" />
                      <div className="absolute top-20 right-20 h-1.5 w-1.5 bg-primary rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                   </Card>
                </div>
                <div className="space-y-6">
                   <div className="relative">
                      <div className="absolute -top-4 -left-4 p-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
                      <LiveIntelligenceFeed />
                   </div>
                   <CoachingLeaderboardPanel />
                </div>
             </div>
          ) : (
            <>
              {data.recordings.length > 0 && (
                <NeuralSentimentTimeline recordingId={data.recordings[0].id} />
              )}
              <ConversationMetricsFeed />
              <QuestionFeedPanel onSelect={drawer.open} />
              <ObjectionLibraryPanel onSelect={drawer.open} />
              <CoachingLeaderboardPanel />
            </>
          )}

          <div className="h-px bg-white/5 my-12" />

          <Card className="glass border-white/5 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 pb-8">
              <CardTitle>Biblioteca de chamadas (Full-text Search)</CardTitle>
              <CardDescription>
                Busca semântica nos transcripts — encontre objeções, concorrentes e tópicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallLibrarySearch onSelectRecording={drawer.open} />
            </CardContent>
          </Card>

          <Card className="glass border-white/5 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 pb-8">
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
                    <motion.button
                      whileHover={{ scale: 1.005, x: 5 }}
                      type="button"
                      key={r.id}
                      onClick={() => drawer.open(r.id)}
                      className="w-full text-left border border-white/5 bg-white/[0.02] rounded-2xl p-6 hover:bg-white/5 hover:border-primary/30 transition-all shadow-sm"
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
                    </motion.button>
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
  accent = "text-primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  accent?: string;
}) => (
  <Card className="glass border-white/5 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
    <div className={cn("absolute -right-4 -top-4 w-20 h-20 blur-2xl opacity-0 group-hover:opacity-10 transition-opacity", 
      accent.includes("primary") ? "bg-primary" : accent.includes("success") ? "bg-success" : "bg-info"
    )} />
    <CardContent className="pt-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className={cn("text-4xl font-black font-display tracking-tighter drop-shadow-sm", accent)}>{value}</p>
            {trend && (
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black tracking-tighter", 
                trend.includes('+') ? 'bg-success/20 text-success' : 
                trend.includes('-') ? 'bg-destructive/20 text-destructive' : 
                'bg-primary/20 text-primary'
              )}>
                {trend}
              </span>
            )}
          </div>
          {hint && <p className="text-[10px] text-muted-foreground font-bold tracking-tight">{hint}</p>}
        </div>
        <div className={cn("size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:bg-white/10", accent)}>
          <Icon className="size-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);
