import { FC, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, AlertTriangle, Heart, Target } from "lucide-react";
import { useBehavioralAnalysis, type BehavioralAnalysis } from "@/hooks/useBehavioralAnalysis";
import { Skeleton } from "@/components/ui/skeleton";

interface BehavioralAnalysisDialogProps {
  text: string;
  interactionId?: string;
  dealId?: string;
  contactName?: string;
  channel?: string;
  triggerLabel?: string;
  size?: "sm" | "default";
}

const severityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-rank-gold/15 text-rank-gold border-rank-gold/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

export const BehavioralAnalysisDialog: FC<BehavioralAnalysisDialogProps> = ({
  text,
  interactionId,
  dealId,
  contactName,
  channel,
  triggerLabel = "Análise IA",
  size = "sm",
}) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<BehavioralAnalysis | null>(null);
  const analyze = useBehavioralAnalysis();

  const tooShort = !text || text.length < 100;

  const runAnalysis = async () => {
    setResult(null);
    const r = await analyze.mutateAsync({ text, interactionId, dealId, contactName, channel });
    if (r) setResult(r);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && !result && !tooShort) runAnalysis();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size={size}
          variant="outline"
          className="gap-1.5"
          disabled={tooShort}
          title={tooShort ? "Texto muito curto (mín. 100 caracteres)" : "Analisar com IA"}
        >
          <Brain className="h-3.5 w-3.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Análise Comportamental (DISC + EQ + Vieses)
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-3">
          {analyze.isPending && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {!analyze.isPending && !result && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Clique em "Analisar" para gerar a análise.
              <div className="mt-3">
                <Button onClick={runAnalysis} size="sm">
                  <Sparkles className="h-4 w-4 mr-1.5" /> Analisar
                </Button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Resumo */}
              <section>
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">Resumo</h3>
                <p className="text-sm">{result.summary}</p>
              </section>

              {/* DISC */}
              <section className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-primary" />
                    Perfil DISC
                  </h3>
                  <div className="flex gap-1">
                    <Badge>{result.disc.primary}</Badge>
                    {result.disc.secondary && (
                      <Badge variant="secondary">{result.disc.secondary}</Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{result.disc.description}</p>
                <div className="space-y-1.5">
                  {Object.entries(result.disc.scores).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="capitalize">{k}</span>
                        <span className="tabular-nums">{v}%</span>
                      </div>
                      <Progress value={v} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </section>

              {/* EQ */}
              <section className="rounded-lg border bg-card p-3">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <Heart className="h-4 w-4 text-success" />
                  Inteligência Emocional ({result.emotional_intelligence.score}/100)
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {result.emotional_intelligence.empathy}
                    </div>
                    <div className="text-muted-foreground">Empatia</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {result.emotional_intelligence.self_awareness}
                    </div>
                    <div className="text-muted-foreground">Autoconsciência</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {result.emotional_intelligence.social_skills}
                    </div>
                    <div className="text-muted-foreground">Social</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{result.emotional_intelligence.notes}</p>
              </section>

              {/* Vieses */}
              {result.cognitive_biases?.length > 0 && (
                <section className="rounded-lg border bg-card p-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="h-4 w-4 text-rank-gold" />
                    Vieses Cognitivos Detectados
                  </h3>
                  <div className="space-y-2">
                    {result.cognitive_biases.map((b, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={severityColor[b.severity]}>
                            {b.bias}
                          </Badge>
                          <span className="text-muted-foreground capitalize">{b.severity}</span>
                        </div>
                        <p className="text-muted-foreground italic">"{b.evidence}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recomendação */}
              <section className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <h3 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Abordagem Recomendada
                </h3>
                <p className="text-sm">{result.recommended_approach}</p>
              </section>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
