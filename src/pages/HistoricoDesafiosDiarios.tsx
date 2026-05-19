import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Calendar, CheckCircle, RefreshCw, TrendingUp, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { StreakAchievementsCard } from "@/components/gamification/StreakAchievementsCard";
import { useCheckAndAwardStreakMilestone } from "@/hooks/gamification/useDailyStreakAchievements";
import { DailyChallengeCard } from "@/components/gamification/DailyChallengeCard";

interface DailyChallengeWithProgress {
  id: string; title: string; description: string | null; challenge_type: string;
  target_value: number; xp_reward: number; challenge_date: string; is_active: boolean;
  progress: { current_value: number; completed_at: string | null; xp_claimed: boolean } | null;
}

export default function HistoricoDesafiosDiarios() {
  const { salesperson } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const checkStreakMilestone = useCheckAndAwardStreakMilestone();

  const { data: history, isLoading } = useQuery({
    queryKey: ['daily-challenges-history', salesperson?.id],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      const { data: challenges, error } = await supabase.from('daily_challenges').select('*').gte('challenge_date', thirtyDaysAgo).order('challenge_date', { ascending: false });
      if (error) throw error;
      if (salesperson?.id && challenges?.length) {
        const { data: progress } = await supabase.from('daily_challenge_progress').select('*').eq('salesperson_id', salesperson.id).in('challenge_id', challenges.map(c => c.id));
        const progressMap = new Map(progress?.map(p => [p.challenge_id, p]));
        return challenges.map(c => ({ ...c, progress: progressMap.get(c.id) || null })) as DailyChallengeWithProgress[];
      }
      return challenges?.map(c => ({ ...c, progress: null as null })) as DailyChallengeWithProgress[];
    },
    enabled: !!salesperson?.id,
  });

  const handleGenerateDailyChallenges = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('rotate-daily-challenges');
      if (error) throw error;
      toast.success('Desafios diários gerados!', { description: data?.message || 'Novos desafios disponíveis' });
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['daily-challenges-history'] });
    } catch {
      toast.error('Erro ao gerar desafios', { description: 'Tente novamente mais tarde' });
    } finally { setIsGenerating(false); }
  };

  const groupedByDate = history?.reduce((acc, challenge) => {
    const date = challenge.challenge_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(challenge);
    return acc;
  }, {} as Record<string, DailyChallengeWithProgress[]>) || {};

  function calculateStreak(dates: string[], grouped: Record<string, DailyChallengeWithProgress[]>): number {
    let streak = 0;
    for (const date of dates) {
      const d = grouped[date];
      if (d.every(c => c.progress?.completed_at) && d.length > 0) streak++;
      else break;
    }
    return streak;
  }

  const stats = {
    totalChallenges: history?.length || 0,
    completed: history?.filter(c => c.progress?.completed_at).length || 0,
    totalXPEarned: history?.reduce((sum, c) => c.progress?.xp_claimed ? sum + c.xp_reward : sum, 0) || 0,
    streakDays: calculateStreak(Object.keys(groupedByDate).sort().reverse(), groupedByDate),
  };

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Histórico de Desafios | Promo Champions</title>
          <meta name="description" content="Histórico de desafios diários completados" />
        </Helmet>
      <div className="min-h-screen bg-background p-6 lg:p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div>
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}</div>
      </div>
      </>
    );
  }

  const statCards = [
    { icon: Zap, color: "amber", label: "Total de Desafios", value: stats.totalChallenges },
    { icon: CheckCircle, color: "green", label: "Completados", value: stats.completed },
    { icon: Gift, color: "purple", label: "XP Ganho", value: stats.totalXPEarned },
    { icon: TrendingUp, color: "orange", label: "Dias em Sequência", value: stats.streakDays },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-6 lg:p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title flex items-center gap-3"><Zap className="h-8 w-8 text-rank-gold" />Histórico de Desafios Diários</h1>
            <p className="text-muted-foreground mt-1">Acompanhe seu progresso nos desafios dos últimos 30 dias</p>
          </div>
          <Button onClick={handleGenerateDailyChallenges} disabled={isGenerating} className="gap-2"><RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />Gerar Desafios (Teste)</Button>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" animate="visible">
          {statCards.map(({ icon: Icon, color, label, value }) => (
            <motion.div key={label} variants={itemVariants}>
              <Card className={`bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 border-${color}-500/20`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}><Icon className={`h-6 w-6 text-${color}-500`} /></div>
                    <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-metric">{value}</p></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StreakAchievementsCard salespersonId={salesperson?.id} />
        </motion.div>

        {salesperson?.id && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center">
            <Button variant="outline" onClick={() => checkStreakMilestone.mutate({ salespersonId: salesperson.id })} disabled={checkStreakMilestone.isPending} className="gap-2">
              <CheckCircle className={`h-4 w-4 ${checkStreakMilestone.isPending ? 'animate-spin' : ''}`} />Verificar Conquistas de Streak
            </Button>
          </motion.div>
        )}

        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {Object.entries(groupedByDate).length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Nenhum desafio encontrado nos últimos 30 dias</p>
              <Button onClick={handleGenerateDailyChallenges} disabled={isGenerating} className="mt-4 gap-2"><RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />Gerar Primeiros Desafios</Button>
            </CardContent></Card>
          ) : (
            Object.entries(groupedByDate).map(([date, challenges], index) => {
              const completedCount = challenges.filter(c => c.progress?.completed_at).length;
              const allCompleted = completedCount === challenges.length;
              const isToday = date === new Date().toISOString().split('T')[0];
              return (
                <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className={isToday ? 'ring-2 ring-primary/50' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                          {isToday && <Badge variant="default" className="ml-2">Hoje</Badge>}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {allCompleted ? (
                            <Badge variant="default" className="bg-success/20 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Todos Completados</Badge>
                          ) : (
                            <Badge variant="secondary">{completedCount}/{challenges.length} completados</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {challenges.map((challenge) => <DailyChallengeCard key={challenge.id} challenge={challenge} />)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
