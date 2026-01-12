import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Zap, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Target,
  Gift
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { getDailyChallengeIcon, getDailyChallengeColor } from "@/hooks/useDailyChallenges";
import { StreakAchievementsCard } from "@/components/gamification/StreakAchievementsCard";
import { useCheckAndAwardStreakMilestone } from "@/hooks/useDailyStreakAchievements";

interface DailyChallengeWithProgress {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  challenge_date: string;
  is_active: boolean;
  progress: {
    current_value: number;
    completed_at: string | null;
    xp_claimed: boolean;
  } | null;
}

export default function HistoricoDesafiosDiarios() {
  const { salesperson } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const checkStreakMilestone = useCheckAndAwardStreakMilestone();

  const { data: history, isLoading } = useQuery({
    queryKey: ['daily-challenges-history', salesperson?.id],
    queryFn: async () => {
      // Get challenges from last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      
      const { data: challenges, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .gte('challenge_date', thirtyDaysAgo)
        .order('challenge_date', { ascending: false });

      if (error) throw error;

      // Get progress for current salesperson
      if (salesperson?.id && challenges?.length) {
        const { data: progress } = await supabase
          .from('daily_challenge_progress')
          .select('*')
          .eq('salesperson_id', salesperson.id)
          .in('challenge_id', challenges.map(c => c.id));

        const progressMap = new Map(progress?.map(p => [p.challenge_id, p]));
        
        return challenges.map(challenge => ({
          ...challenge,
          progress: progressMap.get(challenge.id) || null,
        })) as DailyChallengeWithProgress[];
      }

      return challenges?.map(c => ({ ...c, progress: null })) as DailyChallengeWithProgress[];
    },
    enabled: !!salesperson?.id,
  });

  const handleGenerateDailyChallenges = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('rotate-daily-challenges');
      
      if (error) throw error;
      
      toast.success('Desafios diários gerados!', {
        description: data?.message || 'Novos desafios disponíveis'
      });
      
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['daily-challenges-history'] });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error generating daily challenges:', error);
      }
      toast.error('Erro ao gerar desafios', {
        description: 'Tente novamente mais tarde'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Group challenges by date
  const groupedByDate = history?.reduce((acc, challenge) => {
    const date = challenge.challenge_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(challenge);
    return acc;
  }, {} as Record<string, DailyChallengeWithProgress[]>) || {};

  // Calculate stats
  const stats = {
    totalChallenges: history?.length || 0,
    completed: history?.filter(c => c.progress?.completed_at).length || 0,
    totalXPEarned: history?.reduce((sum, c) => 
      c.progress?.xp_claimed ? sum + c.xp_reward : sum, 0
    ) || 0,
    streakDays: calculateStreak(Object.keys(groupedByDate).sort().reverse(), groupedByDate),
  };

  function calculateStreak(dates: string[], grouped: Record<string, DailyChallengeWithProgress[]>): number {
    let streak = 0;
    for (const date of dates) {
      const daysChallenges = grouped[date];
      const allCompleted = daysChallenges.every(c => c.progress?.completed_at);
      if (allCompleted && daysChallenges.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-6 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="h-8 w-8 text-amber-500" />
              Histórico de Desafios Diários
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe seu progresso nos desafios dos últimos 30 dias
            </p>
          </div>
          <Button
            onClick={handleGenerateDailyChallenges}
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Gerar Desafios (Teste)
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Desafios</p>
                    <p className="text-2xl font-bold">{stats.totalChallenges}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completados</p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Gift className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">XP Ganho</p>
                    <p className="text-2xl font-bold">{stats.totalXPEarned}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dias em Sequência</p>
                    <p className="text-2xl font-bold">{stats.streakDays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Streak Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StreakAchievementsCard salespersonId={salesperson?.id} />
        </motion.div>

        {/* Check for new streak milestones button */}
        {salesperson?.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Button
              variant="outline"
              onClick={() => checkStreakMilestone.mutate({ salespersonId: salesperson.id })}
              disabled={checkStreakMilestone.isPending}
              className="gap-2"
            >
              <CheckCircle className={`h-4 w-4 ${checkStreakMilestone.isPending ? 'animate-spin' : ''}`} />
              Verificar Conquistas de Streak
            </Button>
          </motion.div>
        )}

        {/* History by Date */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {Object.entries(groupedByDate).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  Nenhum desafio encontrado nos últimos 30 dias
                </p>
                <Button
                  onClick={handleGenerateDailyChallenges}
                  disabled={isGenerating}
                  className="mt-4 gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Gerar Primeiros Desafios
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedByDate).map(([date, challenges], index) => {
              const completedCount = challenges.filter(c => c.progress?.completed_at).length;
              const allCompleted = completedCount === challenges.length;
              const isToday = date === new Date().toISOString().split('T')[0];

              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={isToday ? 'ring-2 ring-primary/50' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                          {isToday && (
                            <Badge variant="default" className="ml-2">Hoje</Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {allCompleted ? (
                            <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Todos Completados
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {completedCount}/{challenges.length} completados
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {challenges.map((challenge) => {
                          const isCompleted = !!challenge.progress?.completed_at;
                          const isClaimed = challenge.progress?.xp_claimed;
                          const percentComplete = challenge.progress 
                            ? Math.min((challenge.progress.current_value / challenge.target_value) * 100, 100)
                            : 0;

                          return (
                            <div
                              key={challenge.id}
                              className={`rounded-lg border p-4 transition-colors ${
                                isClaimed 
                                  ? 'bg-green-500/5 border-green-500/20' 
                                  : isCompleted
                                    ? 'bg-amber-500/5 border-amber-500/20'
                                    : 'bg-muted/30'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getDailyChallengeColor(challenge.challenge_type)} text-white text-lg shrink-0`}>
                                  {getDailyChallengeIcon(challenge.challenge_type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className={`font-medium text-sm ${isClaimed ? 'line-through text-muted-foreground' : ''}`}>
                                      {challenge.title}
                                    </h4>
                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                                      +{challenge.xp_reward} XP
                                    </span>
                                  </div>
                                  
                                  {challenge.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                      {challenge.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all ${
                                          isClaimed ? 'bg-green-500' : isCompleted ? 'bg-amber-500' : 'bg-primary'
                                        }`}
                                        style={{ width: `${percentComplete}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {challenge.progress?.current_value || 0}/{challenge.target_value}
                                    </span>
                                  </div>

                                  <div className="mt-2 flex items-center gap-2">
                                    {isClaimed ? (
                                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        XP Resgatado
                                      </span>
                                    ) : isCompleted ? (
                                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        Completado
                                      </span>
                                    ) : challenge.progress ? (
                                      <span className="text-xs text-muted-foreground">
                                        Em progresso
                                      </span>
                                    ) : (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        Não iniciado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
