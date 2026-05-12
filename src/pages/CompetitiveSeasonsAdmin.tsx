import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Plus, Calendar, Zap, Trophy, Clock, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const CompetitiveSeasonsAdmin = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [xpMultiplier, setXpMultiplier] = useState("1.5");

  const { data: seasons, isLoading } = useQuery({
    queryKey: ["competitive-seasons-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitive_seasons")
        .select("*")
        .order("season_number", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !startsAt || !endsAt) throw new Error("Preencha todos os campos");
      const nextNumber = (seasons?.[0]?.season_number || 0) + 1;
      const { error } = await supabase.from("competitive_seasons").insert({
        name: name.trim(),
        season_number: nextNumber,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        xp_multiplier: parseFloat(xpMultiplier) || 1.5,
        status: "upcoming",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitive-seasons-admin"] });
      setShowCreate(false);
      setName("");
      setStartsAt("");
      setEndsAt("");
      toast.success("Temporada criada!");
    },
    onError: () => toast.error("Erro ao criar temporada"),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("competitive_seasons").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitive-seasons-admin"] });
      toast.success("Status atualizado!");
    },
  });

  const statusConfig: Record<string, { label: string; color: string }> = {
    upcoming: { label: "Próxima", color: "bg-status-info/15 text-status-info" },
    active: { label: "Ativa", color: "bg-status-success/15 text-status-success" },
    completed: { label: "Encerrada", color: "bg-muted/50 text-muted-foreground" },
  };

  return (
    <>
      <Helmet>
        <title>Temporadas Competitivas | Promo Champions</title>
        <meta name="description" content="Gerencie temporadas competitivas e multiplicadores de XP." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-page-title font-display">🔥 Temporadas Competitivas</h1>
              <p className="text-sm text-muted-foreground mt-1">Crie e gerencie temporadas com bônus de XP</p>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Nova Temporada
            </Button>
          </motion.div>

          {showCreate && (
            <motion.div variants={itemVariants}>
              <Card className="p-4 glass border-border/40 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="Nome (ex: Temporada de Verão)" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input placeholder="Multiplicador XP" type="number" step="0.1" value={xpMultiplier} onChange={(e) => setXpMultiplier(e.target.value)} />
                  <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                  <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancelar</Button>
                  <Button size="sm" onClick={() => createMutation.mutate()}>Criar Temporada</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : !seasons?.length ? (
            <Card className="p-8 text-center glass border-border/40">
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Nenhuma temporada criada</p>
            </Card>
          ) : (
            <motion.div variants={itemVariants} className="space-y-3">
              {seasons.map((season) => {
                const cfg = statusConfig[season.status] || statusConfig.upcoming;
                return (
                  <Card key={season.id} className={cn("p-4 glass border-border/40", season.status === "active" && "border-primary/30")}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        season.status === "active" ? "bg-gradient-to-br from-primary/20 to-accent/10" : "bg-muted/50"
                      )}>
                        <Flame className={cn("h-5 w-5", season.status === "active" ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-display font-bold text-sm">{season.name}</p>
                          <Badge variant="outline" className={cn("text-[10px]", cfg.color)}>
                            {cfg.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Zap className="h-3 w-3" /> {season.xp_multiplier}x XP
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(season.starts_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span>→</span>
                          <span>{format(new Date(season.ends_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                          {season.status === "active" && (
                            <span className="flex items-center gap-1 text-primary">
                              <Clock className="h-3 w-3" />
                              Encerra {formatDistanceToNow(new Date(season.ends_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {season.status === "upcoming" && (
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => statusMutation.mutate({ id: season.id, status: "active" })}>
                            Ativar
                          </Button>
                        )}
                        {season.status === "active" && (
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => statusMutation.mutate({ id: season.id, status: "completed" })}>
                            Encerrar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default CompetitiveSeasonsAdmin;
