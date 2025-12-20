import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Zap, 
  Flame, 
  Trophy, 
  Target, 
  Star,
  TrendingUp,
  Calendar,
  Award,
  Crown,
  Sparkles,
  ChevronRight,
  Clock
} from "lucide-react";
import { useSalespersonGamification } from "@/hooks/useGamificationData";
import { useXPHistory } from "@/hooks/useSalespersonXP";
import { XPHistoryTimeline } from "./XPHistoryTimeline";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface GamificationProfileModalProps {
  salespersonId: string;
  children: React.ReactNode;
}

export function GamificationProfileModal({ salespersonId, children }: GamificationProfileModalProps) {
  const [open, setOpen] = useState(false);
  const { data: profile, isLoading } = useSalespersonGamification(salespersonId);
  const { data: xpHistory } = useXPHistory(salespersonId);

  if (!profile && !isLoading) return <>{children}</>;

  const xpToNextLevel = profile ? profile.xpToNext : 100;
  const xpInLevel = profile ? profile.xpInLevel : 0;
  const progressPercent = profile ? Math.min((xpInLevel / xpToNextLevel) * 100, 100) : 0;

  // Calculate recent XP gained (last 7 days)
  const recentXP = xpHistory?.reduce((sum, item) => {
    const date = new Date(item.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (date >= weekAgo) return sum + item.xp_amount;
    return sum;
  }, 0) || 0;

  // Stats
  const stats = profile ? [
    { label: "XP Total", value: profile.totalXP.toLocaleString(), icon: Zap, color: "text-xp" },
    { label: "Nível", value: profile.level, icon: Star, color: "text-coins" },
    { label: "Streak Atual", value: `${profile.currentStreak} dias`, icon: Flame, color: "text-streak" },
    { label: "Melhor Streak", value: `${profile.bestStreak} dias`, icon: Trophy, color: "text-coins" },
    { label: "Metas Batidas", value: profile.dailyGoalsAchieved, icon: Target, color: "text-success" },
    { label: "XP esta semana", value: `+${recentXP}`, icon: TrendingUp, color: "text-primary" },
  ] : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {isLoading || !profile ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Hero Section */}
                <div className="relative mb-6">
                  {/* Background gradient */}
                  <div className="absolute inset-0 -mx-6 -mt-6 h-32 bg-gradient-to-br from-xp/20 via-primary/10 to-coins/20" />
                  
                  <div className="relative pt-8 flex flex-col items-center text-center">
                    {/* Avatar with level badge */}
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-white">
                          {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-lg">
                        {profile.level}
                      </div>
                    </div>

                    {/* Name and title */}
                    <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl">{profile.levelEmoji}</span>
                      <span className="text-lg font-medium text-muted-foreground">{profile.levelTitle}</span>
                    </div>

                    {/* Role badge */}
                    <Badge variant="outline" className="mt-2 capitalize">
                      {profile.role === 'sdr' ? 'SDR' : profile.role === 'closer' ? 'Closer' : 'Híbrido'}
                    </Badge>
                  </div>
                </div>

                {/* XP Progress */}
                <Card className="glass-card border-border/40 mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-xp" />
                        Progresso para Nível {profile.level + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {xpInLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-3 bg-muted/50" />
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>Nível {profile.level}</span>
                      <span>{(xpToNextLevel - xpInLevel).toLocaleString()} XP restantes</span>
                      <span>Nível {profile.level + 1}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors">
                        <CardContent className="p-3 text-center">
                          <stat.icon className={cn("h-5 w-5 mx-auto mb-1", stat.color)} />
                          <div className="text-lg font-bold">{stat.value}</div>
                          <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="history" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="history" className="gap-2">
                      <Clock className="h-4 w-4" />
                      Histórico XP
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="gap-2">
                      <Award className="h-4 w-4" />
                      Conquistas
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="history" className="mt-4">
                    <XPHistoryTimeline 
                      salespersonId={salespersonId} 
                      compact 
                      maxItems={20}
                    />
                  </TabsContent>

                  <TabsContent value="achievements" className="mt-4">
                    <Card className="glass-card border-border/40">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-coins" />
                          Conquistas Desbloqueadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Achievement badges */}
                        <div className="grid grid-cols-2 gap-3">
                          {profile.dailyGoalsAchieved > 0 && (
                            <AchievementBadge
                              icon={Target}
                              title="Primeira Meta"
                              description="Bateu a primeira meta diária"
                              color="text-success"
                              earned
                            />
                          )}
                          {profile.currentStreak >= 3 && (
                            <AchievementBadge
                              icon={Flame}
                              title="Em Chamas"
                              description="3 dias consecutivos"
                              color="text-streak"
                              earned
                            />
                          )}
                          {profile.currentStreak >= 7 && (
                            <AchievementBadge
                              icon={Flame}
                              title="Imparável"
                              description="7 dias consecutivos"
                              color="text-streak"
                              earned
                            />
                          )}
                          {profile.level >= 5 && (
                            <AchievementBadge
                              icon={Star}
                              title="Habilidoso"
                              description="Alcançou nível 5"
                              color="text-xp"
                              earned
                            />
                          )}
                          {profile.level >= 10 && (
                            <AchievementBadge
                              icon={Crown}
                              title="Grão-Mestre"
                              description="Alcançou nível 10"
                              color="text-coins"
                              earned
                            />
                          )}
                          {profile.dailyGoalsAchieved >= 10 && (
                            <AchievementBadge
                              icon={Award}
                              title="Dedicado"
                              description="10 metas diárias"
                              color="text-primary"
                              earned
                            />
                          )}
                          {profile.dailyGoalsAchieved >= 30 && (
                            <AchievementBadge
                              icon={Trophy}
                              title="Campeão"
                              description="30 metas diárias"
                              color="text-coins"
                              earned
                            />
                          )}
                          {profile.bestStreak >= 10 && (
                            <AchievementBadge
                              icon={Sparkles}
                              title="Lendário"
                              description="Streak de 10+ dias"
                              color="text-xp"
                              earned
                            />
                          )}
                        </div>

                        {/* Summary */}
                        <div className="pt-3 border-t border-border/40 text-center text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{profile.totalAchievements}</span> conquistas registradas
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function AchievementBadge({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  earned 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  color: string;
  earned: boolean;
}) {
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      earned 
        ? "bg-muted/30 border-border/40" 
        : "bg-muted/10 border-border/20 opacity-50"
    )}>
      <div className="flex items-start gap-2">
        <div className={cn(
          "p-1.5 rounded-full",
          earned ? "bg-muted" : "bg-muted/50"
        )}>
          <Icon className={cn("h-4 w-4", earned ? color : "text-muted-foreground")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{title}</div>
          <div className="text-[10px] text-muted-foreground truncate">{description}</div>
        </div>
      </div>
    </div>
  );
}
