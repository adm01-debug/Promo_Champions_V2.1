import React, { useState } from "react";
import { useNPSSurveys, useNPSStats, useCreateNPSSurvey, useRespondNPSSurvey } from "@/hooks/useNPSSurveys";
import { MessageSquare, Send, ThumbsUp, ThumbsDown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { useCountUp } from "@/hooks/useCountUp";

const NPSGauge = React.memo(({ nps }: { nps: number }) => {
  const color = nps >= 50 ? "text-green-500" : nps >= 0 ? "text-yellow-500" : "text-destructive";
  const label = nps >= 50 ? "Excelente" : nps >= 0 ? "Bom" : "Precisa melhorar";

  return (
    <div className="text-center">
      <p className={cn("text-5xl font-display font-bold", color)}>{nps}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
});
NPSGauge.displayName = "NPSGauge";

const ScoreSelector = ({ value, onChange }: { value: number | null; onChange: (v: number) => void }) => (
  <div className="flex gap-1 justify-center">
    {Array.from({ length: 11 }, (_, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        className={cn(
          "w-8 h-8 rounded-md text-xs font-bold transition-all",
          value === i
            ? i >= 9 ? "bg-green-500 text-white" : i >= 7 ? "bg-yellow-500 text-white" : "bg-destructive text-white"
            : "bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
        )}
        aria-label={`Nota ${i}`}
      >
        {i}
      </button>
    ))}
  </div>
);

export default function NPSDashboard() {
  const { data: surveys, isLoading } = useNPSSurveys();
  const stats = useNPSStats();
  const createSurvey = useCreateNPSSurvey();
  const respondSurvey = useRespondNPSSurvey();
  const [newClient, setNewClient] = useState("");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [respondScore, setRespondScore] = useState<number | null>(null);
  const [respondComment, setRespondComment] = useState("");

  const animatedNPS = useCountUp(stats?.nps ?? 0, { duration: 1400 });
  const animatedPromoters = useCountUp(stats?.promoters ?? 0, { duration: 1400 });
  const animatedPassives = useCountUp(stats?.passives ?? 0, { duration: 1400 });
  const animatedDetractors = useCountUp(stats?.detractors ?? 0, { duration: 1400 });
  const animatedAvg = useCountUp(stats?.avgScore ?? 0, { duration: 1400, decimals: 1 });

  const handleSend = () => {
    if (!newClient.trim()) return;
    createSurvey.mutate({ client_name: newClient.trim() });
    setNewClient("");
  };

  const handleRespond = () => {
    if (!respondingId || respondScore === null) return;
    respondSurvey.mutate({ id: respondingId, score: respondScore, comment: respondComment || undefined });
    setRespondingId(null);
    setRespondScore(null);
    setRespondComment("");
  };

  return (
    <>
      <Helmet>
        <title>NPS & Satisfação | Promo Champions</title>
        <meta name="description" content="Pesquisas de NPS e satisfação do cliente" />
      </Helmet>
      <PageTransition>
        <div className="space-y-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-3 rounded-xl gradient-primary shadow-lg shadow-primary/20">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black tracking-tight gradient-text">NPS & Satisfação</h1>
              <p className="text-muted-foreground text-sm">Acompanhe a satisfação dos seus clientes em tempo real</p>
            </div>
          </motion.div>

          {/* Stats */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-2 md:col-span-1 glass rounded-xl p-4 border-2 border-primary/20 flex items-center justify-center glow-primary"
              >
                <NPSGauge nps={animatedNPS} />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass rounded-xl p-4 border border-green-500/20 text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><ThumbsUp className="h-8 w-8 text-green-500" /></div>
                <ThumbsUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-3xl font-black text-green-500">{animatedPromoters}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Promotores</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass rounded-xl p-4 border border-yellow-500/20 text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Minus className="h-8 w-8 text-yellow-500" /></div>
                <Minus className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-3xl font-black text-yellow-500">{animatedPassives}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Neutros</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass rounded-xl p-4 border border-destructive/20 text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><ThumbsDown className="h-8 w-8 text-destructive" /></div>
                <ThumbsDown className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-3xl font-black text-destructive">{animatedDetractors}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Detratores</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass rounded-xl p-4 border border-border/40 text-center"
              >
                <p className="text-3xl font-black">{animatedAvg.toFixed(1)}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Score Médio</p>
              </motion.div>
            </div>
          )}

          {/* New Survey */}
          <div className="glass rounded-xl p-4 border border-border/40 flex gap-2">
            <Input
              placeholder="Nome do cliente para enviar NPS..."
              value={newClient}
              onChange={(e) => setNewClient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!newClient.trim() || createSurvey.isPending} size="sm">
              <Send className="h-4 w-4 mr-1" /> Enviar NPS
            </Button>
          </div>

          {/* Survey List */}
          <div className="glass rounded-xl border border-border/40 overflow-hidden">
            <div className="p-4 border-b border-border/30">
              <h3 className="font-display font-semibold text-sm">Pesquisas Recentes</h3>
            </div>
            <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
              {(surveys || []).slice(0, 50).map((survey) => (
                <div key={survey.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      survey.status === "responded"
                        ? (survey.score ?? 0) >= 9 ? "bg-green-500/20 text-green-500"
                          : (survey.score ?? 0) >= 7 ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-destructive/20 text-destructive"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {survey.status === "responded" ? survey.score : "—"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{survey.client_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(parseISO(survey.created_at), "dd/MM/yyyy")}
                        {survey.comment && ` — "${survey.comment}"`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={
                      survey.status === "responded" ? "default" :
                      survey.status === "sent" ? "outline" : "secondary"
                    } className="text-[10px]">
                      {survey.status === "responded" ? "Respondido" : survey.status === "sent" ? "Enviado" : "Pendente"}
                    </Badge>
                    {survey.status !== "responded" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { setRespondingId(survey.id); setRespondScore(null); setRespondComment(""); }}
                            aria-label="Registrar resposta"
                          >
                            Responder
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Registrar Resposta — {survey.client_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground text-center">
                              De 0 a 10, o quanto você recomendaria nossos serviços?
                            </p>
                            <ScoreSelector value={respondScore} onChange={setRespondScore} />
                            <Input
                              placeholder="Comentário (opcional)"
                              value={respondComment}
                              onChange={(e) => setRespondComment(e.target.value)}
                            />
                            <Button
                              className="w-full"
                              onClick={handleRespond}
                              disabled={respondScore === null}
                            >
                              Registrar Resposta
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
