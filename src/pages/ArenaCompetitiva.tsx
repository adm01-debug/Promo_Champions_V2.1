import { Helmet } from 'react-helmet-async';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Trophy, Swords, Flame, TrendingUp, Target, Monitor, Bell, Shield, Gift, Users, Award, MessageCircle, Tv, Star, BarChart3, Clock, User, Crown, Coins, MapPin, Search, ListChecks } from 'lucide-react';
import {
  VictoryFeed, BattleArena, SeasonAndPowerUps, EvolutionChart,
  WeeklyRanking, DailyMissions, LiveScoreboard, RankNotifications,
  StreakTracker, LeagueSystem, HeadToHead, PrizeWheel,
  BadgesGallery, ProgressiveGoals, CompetitiveChat, CompetitiveTVDashboard,
  WallOfFame, GamifiedProfile, Benchmarking, ActivityHeatmap,
  TournamentBrackets, PerformanceBets, TerritoryWars, EnhancedTVMode,
  FeatureComparison, ImprovementPlan
} from '@/components/competitive';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRankNotifications } from '@/hooks/useRankNotifications';
import { Badge } from '@/components/ui/badge';

const ArenaCompetitiva = () => {
  const { data: currentSalesperson } = useQuery({
    queryKey: ['arena-current-sp'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('salespeople')
        .select('id, name, role')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { unreadCount } = useRankNotifications(currentSalesperson?.id);

  return (
    <>
      <Helmet>
        <title>Arena Competitiva | PROMO CHAMPIONS</title>
        <meta name="description" content="Feed de vitórias, duelos ao vivo, missões diárias, ranking semanal e placar em tempo real" />
      </Helmet>

      <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Futuristic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
        </div>

        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-10 relative z-10">
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Tournament Hub v2.0</span>
                </div>
                <h1 className="text-6xl sm:text-8xl font-display font-black tracking-tighter gradient-text uppercase italic leading-[0.8]">
                  Arena <br /> <span className="text-foreground">Competitiva</span>
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                    <Swords className="h-4 w-4 text-primary" />
                    Global Ecosystem • <span className="text-primary italic animate-pulse">Active Mode</span>
                  </p>
                  <div className="h-4 w-px bg-white/10" />
                  <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-[0.2em]">
                    Real-time Data Sync enabled
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Card className="glass border-white/5 p-4 flex flex-col items-center justify-center min-w-[120px]">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">ONLINE</Badge>
                </Card>
                <Card className="glass border-white/5 p-4 flex flex-col items-center justify-center min-w-[120px]">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Players</p>
                  <p className="text-xl font-black italic tracking-tighter">1,248</p>
                </Card>
              </div>
            </div>
          </div>

        <SeasonAndPowerUps />

        <Tabs defaultValue="feed" className="space-y-8 relative z-10">
          <div className="flex justify-center">
            <TabsList className="bg-white/5 backdrop-blur-xl border border-white/5 flex-wrap h-auto gap-2 p-2 rounded-2xl shadow-2xl">
              {[
                { value: 'feed', icon: Trophy, label: 'Vitórias' },
                { value: 'profile', icon: User, label: 'Perfil' },
                { value: 'ranking', icon: Flame, label: 'Ranking' },
                { value: 'badges', icon: Award, label: 'Badges' },
                { value: 'fame', icon: Star, label: 'Kudos' },
                { value: 'streaks', icon: TrendingUp, label: 'Streaks' },
                { value: 'leagues', icon: Shield, label: 'Ligas' },
                { value: 'h2h', icon: Users, label: '1v1' },
                { value: 'bench', icon: BarChart3, label: 'Bench' },
                { value: 'heatmap', icon: Clock, label: 'Heatmap' },
                { value: 'goals', icon: Target, label: 'Metas' },
                { value: 'missions', icon: Target, label: 'Missões' },
                { value: 'chat', icon: MessageCircle, label: 'Chat' },
                { value: 'wheel', icon: Gift, label: 'Roda' },
                { value: 'battles', icon: Swords, label: 'Duelos' },
                { value: 'tournament', icon: Crown, label: 'Torneios' },
                { value: 'bets', icon: Coins, label: 'Apostas' },
                { value: 'territory', icon: MapPin, label: 'Territórios' },
                { value: 'tv', icon: Tv, label: 'TV' },
                { value: 'tvpro', icon: Monitor, label: 'TV Pro' },
                { value: 'scoreboard', icon: Monitor, label: 'Placar' },
                { value: 'comparison', icon: Search, label: 'Market Intel' },
                { value: 'plan', icon: ListChecks, label: 'Plano 10 Etapas', special: true },
                { value: 'evolution', icon: TrendingUp, label: 'Evolução' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className={cn(
                    "gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 data-[state=active]:shadow-lg",
                    tab.special ? "bg-primary/10 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-pulse" : "hover:bg-white/5"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
              <TabsTrigger value="alerts" className="gap-2 px-4 py-2.5 rounded-xl hover:bg-white/5 relative">
                <Bell className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Alertas</span>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-black bg-destructive text-destructive-foreground border-2 border-background animate-bounce shadow-lg">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed"><VictoryFeed currentSalespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="profile"><GamifiedProfile salespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="ranking"><WeeklyRanking /></TabsContent>
          <TabsContent value="badges"><BadgesGallery salespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="fame"><WallOfFame salespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="streaks"><StreakTracker /></TabsContent>
          <TabsContent value="leagues"><LeagueSystem /></TabsContent>
          <TabsContent value="h2h"><HeadToHead /></TabsContent>
          <TabsContent value="bench"><Benchmarking /></TabsContent>
          <TabsContent value="heatmap"><ActivityHeatmap /></TabsContent>
          <TabsContent value="goals"><ProgressiveGoals salespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="missions"><DailyMissions salespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="chat"><CompetitiveChat salespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="wheel"><PrizeWheel salespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="battles"><BattleArena /></TabsContent>
          <TabsContent value="tournament"><TournamentBrackets /></TabsContent>
          <TabsContent value="bets"><PerformanceBets /></TabsContent>
          <TabsContent value="territory"><TerritoryWars /></TabsContent>
          <TabsContent value="tv"><CompetitiveTVDashboard /></TabsContent>
          <TabsContent value="tvpro"><EnhancedTVMode /></TabsContent>
          <TabsContent value="scoreboard"><LiveScoreboard /></TabsContent>
          <TabsContent value="comparison"><FeatureComparison /></TabsContent>
          <TabsContent value="plan"><ImprovementPlan /></TabsContent>
          <TabsContent value="alerts"><RankNotifications salespersonId={currentSalesperson?.id} /></TabsContent>
          <TabsContent value="evolution"><EvolutionChart /></TabsContent>
        </Tabs>
      </div>
    </div>
    </PageTransition>
    </>
  );
};

export default ArenaCompetitiva;
