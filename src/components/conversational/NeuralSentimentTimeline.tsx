import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, MessageSquare, Zap } from "lucide-react";
import { SentimentTimelineChart } from "./SentimentTimelineChart";
import { TalkRatioBar } from "./TalkRatioBar";
import { DiarizationTimeline } from "./DiarizationTimeline";
import { useCallRecordings } from "@/hooks/conversational/useCallRecordings";
import { useCriticalMoments } from "@/hooks/conversational/useCriticalMoments";
import { type DiarizationTurn } from "./diarizationHelpers";
import { type Objection } from "./meetingSummaryHelpers";
import { type Intent } from "./IntentTracker";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  recordingId: string;
}

export const NeuralSentimentTimeline = ({ recordingId }: Props) => {
  const { data: recordings } = useCallRecordings();
  const rec = recordings?.find((r) => r.id === recordingId) ?? null;
  const { data: moments } = useCriticalMoments(recordingId);

  const derivedIntents: Intent[] = useMemo(() => {
    if (!rec) return [];
    const intents: Intent[] = (rec.objections_summary as Objection[] ?? []).map((o, idx) => ({
      type: o.category === "preço" ? "objection" : "followup",
      label: o.text,
      confidence: 0.85,
      timestamp_sec: 120 + idx * 45,
      excerpt: o.text
    }));

    if (rec.key_topics?.includes("Competitor")) {
      intents.push({
        type: "comparison",
        label: "Menção a Concorrente",
        confidence: 0.92,
        timestamp_sec: 300,
        excerpt: "O cliente mencionou o concorrente principal ao falar sobre preço."
      });
    }
    return intents;
  }, [rec]);

  if (!rec) return null;

  return (
    <Card className="glass border-white/5 shadow-2xl overflow-hidden group relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
        <Brain className="size-48" />
      </div>

      <CardHeader className="pb-6 border-b border-white/5 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="size-5 text-primary animate-pulse" />
              Neural Sentiment Timeline
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Oscilação emocional e detecção de objeções em tempo real</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black text-[10px]">
              AI POWERED
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        {/* Curva de Sentimento Principal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-3" />
              Humor Detalhado (Score -1 a +1)
            </h4>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
            <SentimentTimelineChart 
              recordingId={recordingId} 
              moments={moments ?? []} 
              intents={derivedIntents}
              hideTitle
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Talk Ratio & Diarização */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
                <MessageSquare className="size-3" />
                Diarização & Talk Ratio
              </h4>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                <TalkRatioBar seller={rec.talk_ratio_seller} client={rec.talk_ratio_client} />
                <DiarizationTimeline 
                  turns={rec.diarization as DiarizationTurn[]} 
                  totalSeconds={rec.duration_seconds} 
                />
              </div>
            </div>
          </div>

          {/* Objeções e Insights Críticos */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
              <ShieldCheck className="size-3" />
              Marcadores de Objeção
            </h4>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {derivedIntents.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                  <p className="text-xs text-muted-foreground italic">Nenhuma objeção crítica mapeada na timeline.</p>
                </div>
              ) : (
                derivedIntents.map((intent, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all flex items-start gap-3 group/item"
                  >
                    <div className={cn(
                      "mt-0.5 size-6 rounded-lg flex items-center justify-center border shrink-0",
                      intent.type === "objection" ? "bg-warning/10 border-warning/20 text-warning" : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                      <AlertTriangle className="size-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold truncate group-hover/item:text-primary transition-colors">{intent.label}</span>
                        <span className="text-[9px] font-mono text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                          {Math.floor(intent.timestamp_sec / 60)}:{(intent.timestamp_sec % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic line-clamp-1">"{intent.excerpt}"</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
