import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Swords, Flame, TrendingUp, Target, Monitor, Bell } from 'lucide-react';
import {
  VictoryFeed, BattleArena, SeasonAndPowerUps, EvolutionChart,
  WeeklyRanking, DailyMissions, LiveScoreboard, RankNotifications
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
        <title>Arena Competitiva | Sales Arena</title>
        <meta name="description" content="Feed de vitórias, duelos ao vivo, missões diárias, ranking semanal e placar em tempo real" />
      </Helmet>

      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-foreground">
            🏟️ Arena Competitiva
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Feed de vitórias, duelos, missões, ranking e placar ao vivo
          </p>
        </div>

        {/* Season Banner */}
        <SeasonAndPowerUps />

        {/* Tabs */}
        <Tabs defaultValue="feed" className="space-y-4">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="feed" className="gap-1.5">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Vitórias</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="gap-1.5">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-1.5">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Missões</span>
            </TabsTrigger>
            <TabsTrigger value="battles" className="gap-1.5">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Duelos</span>
            </TabsTrigger>
            <TabsTrigger value="scoreboard" className="gap-1.5">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Placar</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1.5 relative">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-destructive text-destructive-foreground">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="evolution" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Evolução</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <VictoryFeed currentSalespersonId={currentSalesperson?.id} />
          </TabsContent>

          <TabsContent value="ranking">
            <WeeklyRanking />
          </TabsContent>

          <TabsContent value="missions">
            <DailyMissions salespersonId={currentSalesperson?.id} />
          </TabsContent>

          <TabsContent value="battles">
            <BattleArena />
          </TabsContent>

          <TabsContent value="scoreboard">
            <LiveScoreboard />
          </TabsContent>

          <TabsContent value="alerts">
            <RankNotifications salespersonId={currentSalesperson?.id} />
          </TabsContent>

          <TabsContent value="evolution">
            <EvolutionChart />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ArenaCompetitiva;
