import { Helmet } from 'react-helmet-async';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="min-h-screen bg-background bg-gradient-subtle">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Tournament Hub</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tighter gradient-text uppercase italic leading-none">
                  Arena Competitiva
                </h1>
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Swords className="h-4 w-4 text-primary/60" />
                  Ecossistema Global de Competição • <span className="text-foreground/80 italic font-bold">Modo Ativo</span>
                </p>
              </div>
            </div>
          </div>

        <SeasonAndPowerUps />

        <Tabs defaultValue="feed" className="space-y-4">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="feed" className="gap-1.5"><Trophy className="h-4 w-4" /><span className="hidden sm:inline">Vitórias</span></TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5"><User className="h-4 w-4" /><span className="hidden sm:inline">Perfil</span></TabsTrigger>
            <TabsTrigger value="ranking" className="gap-1.5"><Flame className="h-4 w-4" /><span className="hidden sm:inline">Ranking</span></TabsTrigger>
            <TabsTrigger value="badges" className="gap-1.5"><Award className="h-4 w-4" /><span className="hidden sm:inline">Badges</span></TabsTrigger>
            <TabsTrigger value="fame" className="gap-1.5"><Star className="h-4 w-4" /><span className="hidden sm:inline">Kudos</span></TabsTrigger>
            <TabsTrigger value="streaks" className="gap-1.5"><TrendingUp className="h-4 w-4" /><span className="hidden sm:inline">Streaks</span></TabsTrigger>
            <TabsTrigger value="leagues" className="gap-1.5"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Ligas</span></TabsTrigger>
            <TabsTrigger value="h2h" className="gap-1.5"><Users className="h-4 w-4" /><span className="hidden sm:inline">1v1</span></TabsTrigger>
            <TabsTrigger value="bench" className="gap-1.5"><BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Bench</span></TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-1.5"><Clock className="h-4 w-4" /><span className="hidden sm:inline">Heatmap</span></TabsTrigger>
            <TabsTrigger value="goals" className="gap-1.5"><Target className="h-4 w-4" /><span className="hidden sm:inline">Metas</span></TabsTrigger>
            <TabsTrigger value="missions" className="gap-1.5"><Target className="h-4 w-4" /><span className="hidden sm:inline">Missões</span></TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5"><MessageCircle className="h-4 w-4" /><span className="hidden sm:inline">Chat</span></TabsTrigger>
            <TabsTrigger value="wheel" className="gap-1.5"><Gift className="h-4 w-4" /><span className="hidden sm:inline">Roda</span></TabsTrigger>
            <TabsTrigger value="battles" className="gap-1.5"><Swords className="h-4 w-4" /><span className="hidden sm:inline">Duelos</span></TabsTrigger>
            <TabsTrigger value="tournament" className="gap-1.5"><Crown className="h-4 w-4" /><span className="hidden sm:inline">Torneios</span></TabsTrigger>
            <TabsTrigger value="bets" className="gap-1.5"><Coins className="h-4 w-4" /><span className="hidden sm:inline">Apostas</span></TabsTrigger>
            <TabsTrigger value="territory" className="gap-1.5"><MapPin className="h-4 w-4" /><span className="hidden sm:inline">Territórios</span></TabsTrigger>
            <TabsTrigger value="tv" className="gap-1.5"><Tv className="h-4 w-4" /><span className="hidden sm:inline">TV</span></TabsTrigger>
            <TabsTrigger value="tvpro" className="gap-1.5"><Monitor className="h-4 w-4" /><span className="hidden sm:inline">TV Pro</span></TabsTrigger>
            <TabsTrigger value="scoreboard" className="gap-1.5"><Monitor className="h-4 w-4" /><span className="hidden sm:inline">Placar</span></TabsTrigger>
            <TabsTrigger value="comparison" className="gap-1.5"><Search className="h-4 w-4" /><span className="hidden sm:inline">Market Intel</span></TabsTrigger>
            <TabsTrigger value="plan" className="gap-1.5 bg-primary/10 text-primary animate-pulse"><ListChecks className="h-4 w-4" /><span className="hidden sm:inline">Plano 10 Etapas</span></TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1.5 relative">
              <Bell className="h-4 w-4" /><span className="hidden sm:inline">Alertas</span>
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-destructive text-destructive-foreground">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="evolution" className="gap-1.5"><TrendingUp className="h-4 w-4" /><span className="hidden sm:inline">Evolução</span></TabsTrigger>
          </TabsList>

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
