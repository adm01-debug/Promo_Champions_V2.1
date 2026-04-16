import React, { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Rocket, Check, Plus, ChevronDown, ChevronUp, Users, Target } from "lucide-react";
import { toast } from "sonner";

interface OnboardingMilestone {
  id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
}

interface OnboardingTrack {
  id: string;
  client_name: string;
  started_at: string;
  status: "in_progress" | "completed" | "stalled";
  milestones: OnboardingMilestone[];
  progress: number;
}

// Local state — can be migrated to DB later
const DEFAULT_MILESTONES = [
  "Kickoff realizado",
  "Dados de acesso enviados",
  "Treinamento inicial agendado",
  "Configuração concluída",
  "Primeiro uso registrado",
  "Feedback coletado",
];

const OnboardingTracking = () => {
  const [tracks, setTracks] = useState<OnboardingTrack[]>([
    {
      id: "1",
      client_name: "Empresa Alpha",
      started_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: "in_progress",
      milestones: DEFAULT_MILESTONES.map((m, i) => ({
        id: `m1-${i}`,
        title: m,
        completed: i < 3,
        completed_at: i < 3 ? new Date().toISOString() : null,
      })),
      progress: 50,
    },
    {
      id: "2",
      client_name: "Corp Beta",
      started_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      status: "completed",
      milestones: DEFAULT_MILESTONES.map((m, i) => ({
        id: `m2-${i}`,
        title: m,
        completed: true,
        completed_at: new Date().toISOString(),
      })),
      progress: 100,
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState("");

  const handleAddTrack = useCallback(() => {
    if (!newClientName.trim()) { toast.error("Digite o nome do cliente"); return; }
    const newTrack: OnboardingTrack = {
      id: crypto.randomUUID(),
      client_name: newClientName,
      started_at: new Date().toISOString(),
      status: "in_progress",
      milestones: DEFAULT_MILESTONES.map((m, i) => ({
        id: `m-${Date.now()}-${i}`,
        title: m,
        completed: false,
        completed_at: null,
      })),
      progress: 0,
    };
    setTracks((prev) => [newTrack, ...prev]);
    setNewClientName("");
    toast.success(`Onboarding criado para ${newClientName}`);
  }, [newClientName]);

  const toggleMilestone = useCallback((trackId: string, milestoneId: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== trackId) return t;
        const milestones = t.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, completed: !m.completed, completed_at: !m.completed ? new Date().toISOString() : null }
            : m
        );
        const completed = milestones.filter((m) => m.completed).length;
        const progress = Math.round((completed / milestones.length) * 100);
        const status = progress === 100 ? "completed" as const : progress === 0 ? "stalled" as const : "in_progress" as const;
        return { ...t, milestones, progress, status };
      })
    );
  }, []);

  const summary = useMemo(() => ({
    total: tracks.length,
    inProgress: tracks.filter((t) => t.status === "in_progress").length,
    completed: tracks.filter((t) => t.status === "completed").length,
    avgProgress: tracks.length ? Math.round(tracks.reduce((s, t) => s + t.progress, 0) / tracks.length) : 0,
  }), [tracks]);

  return (
    <>
      <Helmet>
        <title>Onboarding Tracking | Promo Champions</title>
        <meta name="description" content="Acompanhe a implementação e onboarding de novos clientes." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">Onboarding Tracking</h1>
            <p className="text-sm text-muted-foreground mt-1">Acompanhe milestones de implementação de clientes</p>
          </motion.div>

          {/* Summary */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 glass border-border/40 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-display font-bold">{summary.total}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </Card>
            <Card className="p-4 glass border-border/40 text-center">
              <Rocket className="h-5 w-5 mx-auto mb-1 text-status-warning" />
              <p className="text-2xl font-display font-bold">{summary.inProgress}</p>
              <p className="text-[10px] text-muted-foreground">Em Progresso</p>
            </Card>
            <Card className="p-4 glass border-border/40 text-center">
              <Check className="h-5 w-5 mx-auto mb-1 text-status-success" />
              <p className="text-2xl font-display font-bold">{summary.completed}</p>
              <p className="text-[10px] text-muted-foreground">Concluídos</p>
            </Card>
            <Card className="p-4 glass border-border/40 text-center">
              <Target className="h-5 w-5 mx-auto mb-1 text-info" />
              <p className="text-2xl font-display font-bold">{summary.avgProgress}%</p>
              <p className="text-[10px] text-muted-foreground">Progresso Médio</p>
            </Card>
          </motion.div>

          {/* Add new */}
          <motion.div variants={itemVariants} className="flex gap-2">
            <Input
              placeholder="Nome do cliente para onboarding..."
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTrack()}
              className="max-w-sm"
            />
            <Button onClick={handleAddTrack} size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Iniciar Onboarding
            </Button>
          </motion.div>

          {/* Tracks */}
          <motion.div variants={itemVariants} className="space-y-3">
            {tracks.map((track) => (
              <Card key={track.id} className="glass border-border/40 overflow-hidden">
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === track.id ? null : track.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{track.client_name}</p>
                      <Badge variant={track.status === "completed" ? "default" : "outline"} className="text-[10px]">
                        {track.status === "completed" ? "Concluído" : track.status === "in_progress" ? "Em Progresso" : "Parado"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={track.progress} className="h-1.5 flex-1" />
                      <span className="text-xs font-semibold text-muted-foreground">{track.progress}%</span>
                    </div>
                  </div>
                  {expandedId === track.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>

                {expandedId === track.id && (
                  <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-2 animate-in fade-in-0 slide-in-from-top-1">
                    {track.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 py-1">
                        <Checkbox
                          checked={m.completed}
                          onCheckedChange={() => toggleMilestone(track.id, m.id)}
                        />
                        <span className={cn("text-sm", m.completed && "line-through text-muted-foreground")}>
                          {m.title}
                        </span>
                        {m.completed && m.completed_at && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(m.completed_at).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
};

export default OnboardingTracking;
