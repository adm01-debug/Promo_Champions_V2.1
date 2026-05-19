import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/transitions/PageTransition";
import { WeeklyChallengesCard } from "@/components/gamification/WeeklyChallengesCard";
import { CreateChallengeDialog } from "@/components/gamification/CreateChallengeDialog";
import { useGamificationData } from "@/hooks/gamification/useGamificationData";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, Zap, Target, Crown, Medal, Award } from "lucide-react";
import { useChallengesWithProgress } from "@/hooks/gamification/useWeeklyChallenges";
import { motion } from "framer-motion";

export default function DesafiosSemanais() {
  const { data: gamificationData, isLoading: loadingGamification } = useGamificationData();
  const { isAdmin, isManager } = useUserRoles();
  const canCreateChallenges = isAdmin || isManager;

  // Get first salesperson for demo - in real app would use current user
  const currentSalesperson = gamificationData?.[0];
  const { challenges } = useChallengesWithProgress(currentSalesperson?.salesperson_id);

  // Calculate leaderboard based on challenge completions
  const leaderboard = (gamificationData || [])
    .map((sp) => {
      const spChallenges = challenges.filter(
        (c) => c.progress?.salesperson_id === sp.salesperson_id && c.progress?.xp_claimed
      );
      return {
        ...sp,
        challengesCompleted: spChallenges.length,
        totalXPFromChallenges: spChallenges.reduce((acc, c) => acc + c.xp_reward, 0),
      };
    })
    .sort((a, b) => b.challengesCompleted - a.challengesCompleted)
    .slice(0, 10);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-warning" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-rank-silver" />;
    if (rank === 3) return <Award className="h-5 w-5 text-rank-gold" />;
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
  };

  return (
    <>
    <Helmet>
      <title>Desafios Semanais | Promo Champions</title>
      <meta name="description" content="Desafios gamificados da semana" />
    </Helmet>
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-page-title flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              Desafios Semanais
            </h1>
            <p className="text-muted-foreground">
              Complete desafios para ganhar XP bonus e subir no ranking!
            </p>
          </div>
          {canCreateChallenges && <CreateChallengeDialog />}
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-info/20 rounded-full">
                    <Target className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Desafios Ativos</p>
                    <p className="text-metric">{challenges.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success/20 rounded-full">
                    <Trophy className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completados</p>
                    <p className="text-metric">
                      {challenges.filter((c) => c.isCompleted).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">XP Disponível</p>
                    <p className="text-metric">
                      {challenges.reduce((acc, c) => acc + c.xp_reward, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-streak/10 to-streak/5 border-streak/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-streak/20 rounded-full">
                    <Users className="h-6 w-6 text-streak" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Participantes</p>
                    <p className="text-metric">{gamificationData?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="challenges" className="space-y-4">
          <TabsList>
            <TabsTrigger value="challenges">Meus Desafios</TabsTrigger>
            <TabsTrigger value="leaderboard">Ranking da Semana</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            {loadingGamification ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <WeeklyChallengesCard salespersonId={currentSalesperson?.salesperson_id} />
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-warning" />
                  Ranking de Desafios da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGamification ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum desafio completado ainda esta semana</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((person, index) => (
                      <motion.div
                        key={person.salesperson_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          index === 0
                            ? "bg-gradient-to-r from-coins/20 to-coins/10 border border-warning/30"
                            : index === 1
                            ? "bg-gradient-to-r from-rank-silver/20 to-rank-silver/10 border border-rank-silver/30"
                            : index === 2
                            ? "bg-gradient-to-r from-rank-gold/20 to-rank-gold/10 border border-rank-gold/30"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="w-8 flex justify-center">
                          {getRankIcon(index + 1)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Nível {person.level} • {person.totalXP} XP total
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="gap-1">
                            <Trophy className="h-3 w-3" />
                            {person.challengesCompleted} desafios
                          </Badge>
                          {person.totalXPFromChallenges > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              +{person.totalXPFromChallenges} XP de desafios
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  </>
  );
}
