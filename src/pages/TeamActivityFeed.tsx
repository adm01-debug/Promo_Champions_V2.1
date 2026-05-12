import React from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, Calendar, FileText, CheckCircle, Trophy, TrendingUp, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const activityIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  call: { icon: Phone, color: "text-status-info", bg: "bg-status-info/10" },
  email: { icon: Mail, color: "text-status-warning", bg: "bg-status-warning/10" },
  meeting: { icon: Calendar, color: "text-status-purple", bg: "bg-status-purple/10" },
  task: { icon: CheckCircle, color: "text-status-success", bg: "bg-status-success/10" },
  note: { icon: FileText, color: "text-muted-foreground", bg: "bg-muted/30" },
};

const outcomeLabels: Record<string, string> = {
  positive: "Positivo",
  negative: "Negativo",
  neutral: "Neutro",
  scheduled: "Agendado",
  no_answer: "Sem Resposta",
};

const TeamActivityFeed = () => {
  const queryClient = useQueryClient();
  const { data: activities, isLoading } = useQuery({
    queryKey: ["team-activity-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("id, activity_type, outcome, notes, contact_name, created_at, duration_minutes, salesperson_id, salespeople:salesperson_id(name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('team-activities')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, () => {
        queryClient.invalidateQueries({ queryKey: ["team-activity-feed"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <>
      <Helmet>
        <title>Feed da Equipe | Promo Champions</title>
        <meta name="description" content="Acompanhe as atividades recentes de toda a equipe em tempo real." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">📡 Feed da Equipe</h1>
            <p className="text-sm text-muted-foreground mt-1">Atividades recentes de todos os vendedores</p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : !activities?.length ? (
            <Card className="p-8 text-center glass border-border/40">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Nenhuma atividade registrada</p>
            </Card>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border/40" />

              <div className="space-y-1">
                {activities.map((act: any) => {
                  const cfg = activityIcons[act.activity_type] || activityIcons.note;
                  const sp = act.salespeople;
                  const Icon = cfg.icon;

                  return (
                    <motion.div key={act.id} variants={itemVariants}>
                      <div className="relative flex items-start gap-4 py-3 pl-2">
                        {/* Timeline dot */}
                        <div className={cn("relative z-10 p-2 rounded-xl shrink-0", cfg.bg)}>
                          <Icon className={cn("h-4 w-4", cfg.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {sp && (
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={sp.avatar_url} />
                                  <AvatarFallback className="text-[8px]">{sp.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold">{sp.name}</span>
                              </div>
                            )}
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <Badge variant="outline" className="text-[9px] capitalize">{act.activity_type}</Badge>
                            {act.outcome && (
                              <Badge variant="outline" className={cn(
                                "text-[9px]",
                                act.outcome === "positive" && "text-status-success border-status-success/30",
                                act.outcome === "negative" && "text-destructive border-destructive/30",
                              )}>
                                {outcomeLabels[act.outcome] || act.outcome}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1">
                            {act.contact_name && (
                              <p className="text-xs text-foreground">
                                Contato: <span className="font-medium">{act.contact_name}</span>
                              </p>
                            )}
                            {act.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{act.notes}</p>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(act.created_at), { addSuffix: true, locale: ptBR })}
                            {act.duration_minutes ? ` • ${act.duration_minutes}min` : ""}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default TeamActivityFeed;
