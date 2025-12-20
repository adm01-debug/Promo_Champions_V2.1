import { PageTransition } from "@/components/transitions/PageTransition";
import { WeeklyChallengesCard } from "@/components/gamification/WeeklyChallengesCard";
import { CreateChallengeDialog } from "@/components/gamification/CreateChallengeDialog";
import { useGamificationData } from "@/hooks/useGamificationData";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, Zap, Target, Crown, Medal, Award } from "lucide-react";
import { useChallengesWithProgress } from "@/hooks/useWeeklyChallenges";
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
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
  };

  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
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
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Desafios Ativos</p>
                    <p className="text-2xl font-bold">{challenges.length}</p>
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
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <Trophy className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completados</p>
                    <p className="text-2xl font-bold">
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
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Zap className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">XP Disponível</p>
                    <p className="text-2xl font-bold">
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
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Participantes</p>
                    <p className="text-2xl font-bold">{gamificationData?.length || 0}</p>
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
                  <Crown className="h-5 w-5 text-yellow-500" />
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
                            ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border border-gray-400/30"
                            : index === 2
                            ? "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border border-amber-600/30"
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
  );
}
