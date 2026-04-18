import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Flag, Calendar, PlayCircle } from 'lucide-react';
import {
  RaceArena as Arena,
  RaceLeaderboardSidebar,
  RaceEventFeed,
  CarCustomizer,
  RaceSoundToggle,
  VictoryLapOverlay,
  RaceBadgeShowcase,
  StartSeasonDialog,
} from '@/components/race';
import { useRaceSeason } from '@/hooks/race/useRaceSeason';
import { useRaceLeaderboard } from '@/hooks/race/useRaceLeaderboard';
import { useRaceEvents } from '@/hooks/race/useRaceEvents';
import { useRaceSounds } from '@/hooks/race/useRaceSounds';
import { useUserRoles } from '@/hooks/useUserRoles';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RaceArenaPage() {
  const { data: season } = useRaceSeason();
  const { data: leaderboard = [] } = useRaceLeaderboard(season?.id);
  const { data: events = [] } = useRaceEvents(season?.id);
  const { muted, toggleMute, play } = useRaceSounds();
  const { isAdmin } = useUserRoles();
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [startSeasonOpen, setStartSeasonOpen] = useState(false);
  const lastEventIdRef = useRef<string | null>(null);
  const [boostingIds, setBoostingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (events.length === 0) return;
    const newest = events[0];
    if (lastEventIdRef.current && lastEventIdRef.current !== newest.id) {
      const soundMap: Record<string, Parameters<typeof play>[0]> = {
        boost: 'boost', overtake: 'overtake', checkpoint: 'checkpoint',
        victory: 'victory', powerup: 'powerup', pitstop: 'pitstop',
      };
      const s = soundMap[newest.event_type];
      if (s) play(s);
      if (newest.event_type === 'boost' || newest.event_type === 'overtake') {
        setBoostingIds((prev) => new Set(prev).add(newest.salesperson_id));
        setTimeout(() => {
          setBoostingIds((prev) => { const n = new Set(prev); n.delete(newest.salesperson_id); return n; });
        }, 1500);
      }
    }
    lastEventIdRef.current = newest.id;
  }, [events, play]);

  return (
    <>
      <Helmet>
        <title>Race Arena — Corrida de Vendedores</title>
        <meta name="description" content="Acompanhe a corrida em tempo real entre vendedores, com carros, ultrapassagens, power-ups e bandeira quadriculada." />
      </Helmet>

      <div className="container mx-auto p-4 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <Flag className="w-7 h-7 text-primary" /> Race Arena
            </h1>
            <p className="text-sm text-muted-foreground">
              {season ? (
                <>
                  <strong>{season.name}</strong> · {format(new Date(season.start_date), 'dd MMM', { locale: ptBR })} → {format(new Date(season.end_date), 'dd MMM', { locale: ptBR })}
                </>
              ) : (
                'Nenhuma temporada ativa. Aguardando largada...'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RaceSoundToggle muted={muted} onToggle={toggleMute} />
            {isAdmin && (
              <Button onClick={() => setStartSeasonOpen(true)} variant="outline">
                <PlayCircle className="w-4 h-4 mr-2" /> Nova Temporada
              </Button>
            )}
            <Button onClick={() => setCustomizerOpen(true)} variant="default">
              <Settings2 className="w-4 h-4 mr-2" /> Meu Carro
            </Button>
          </div>
        </header>

        {!season && (
          <Card>
            <CardContent className="py-10 text-center space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold">Nenhuma temporada ativa</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? 'Clique em "Nova Temporada" para iniciar.' : 'Peça a um administrador para iniciar uma nova temporada.'}
              </p>
            </CardContent>
          </Card>
        )}

        {season && (
          <Tabs defaultValue="race" className="w-full">
            <TabsList>
              <TabsTrigger value="race">🏁 Pista</TabsTrigger>
              <TabsTrigger value="badges">🏆 Conquistas</TabsTrigger>
            </TabsList>
            <TabsContent value="race">
              <div className="grid grid-cols-12 gap-4" style={{ minHeight: '70vh' }}>
                <div className="col-span-12 lg:col-span-3 order-2 lg:order-1">
                  <RaceEventFeed events={events} cars={leaderboard} />
                </div>
                <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
                  <Arena cars={leaderboard} boostingIds={boostingIds} />
                </div>
                <div className="col-span-12 lg:col-span-3 order-3">
                  <RaceLeaderboardSidebar entries={leaderboard} goalAmount={Number(season.goal_amount)} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="badges">
              <RaceBadgeShowcase />
            </TabsContent>
          </Tabs>
        )}

        <CarCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
        <StartSeasonDialog open={startSeasonOpen} onOpenChange={setStartSeasonOpen} />
        <VictoryLapOverlay events={events} cars={leaderboard} onPlaySound={() => play('victory')} />
      </div>
    </>
  );
}
