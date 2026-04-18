import { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Flag, Calendar, PlayCircle, Rocket } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {
  RaceArena as Arena,
  RaceLeaderboardSidebar,
  RaceEventFeed,
  CarCustomizer,
  RaceSoundToggle,
  VictoryLapOverlay,
  RaceBadgeShowcase,
  StartSeasonDialog,
  PowerUpIcon,
  RaceCountdown,
} from '@/components/race';
import { getPositionOnTrack } from '@/components/race/raceTrackHelpers';
import { useRaceSeason } from '@/hooks/race/useRaceSeason';
import { useRaceLeaderboard } from '@/hooks/race/useRaceLeaderboard';
import { useRaceEvents } from '@/hooks/race/useRaceEvents';
import { useRaceSounds } from '@/hooks/race/useRaceSounds';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';
import { useRacePowerups, collectRacePowerup } from '@/hooks/race/useRacePowerups';
import { format, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const COUNTDOWN_SEEN_KEY = 'race_countdown_seen_seasons';

export default function RaceArenaPage() {
  const { data: season } = useRaceSeason();
  const { data: leaderboard = [] } = useRaceLeaderboard(season?.id);
  const { data: events = [] } = useRaceEvents(season?.id);
  const { muted, toggleMute, play } = useRaceSounds();
  const { isAdmin } = useUserRoles();
  const { data: myCar } = useMyRaceCar();
  const { data: myPowerups = [] } = useRacePowerups(season?.id, myCar?.salesperson_id);
  const qc = useQueryClient();
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [startSeasonOpen, setStartSeasonOpen] = useState(false);
  const [countdownTrigger, setCountdownTrigger] = useState(0);
  const lastEventIdRef = useRef<string | null>(null);
  const [boostingIds, setBoostingIds] = useState<Set<string>>(new Set());

  // Countdown automático ao detectar season nova (idade < 10s) ainda não vista
  useEffect(() => {
    if (!season) return;
    try {
      const seen = JSON.parse(localStorage.getItem(COUNTDOWN_SEEN_KEY) || '[]') as string[];
      if (seen.includes(season.id)) return;
      const ageSec = differenceInSeconds(new Date(), new Date(season.start_date));
      if (ageSec < 10 && ageSec > -86400) {
        setCountdownTrigger((t) => t + 1);
        localStorage.setItem(COUNTDOWN_SEEN_KEY, JSON.stringify([...seen, season.id]));
      } else if (ageSec >= 10) {
        // marca como vista para não disparar depois
        localStorage.setItem(COUNTDOWN_SEEN_KEY, JSON.stringify([...seen, season.id]));
      }
    } catch { /* noop */ }
  }, [season]);

  // Sons + boost por evento
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

  // Posições dos power-ups disponíveis na pista
  const myEntry = leaderboard.find((e) => e.salesperson_id === myCar?.salesperson_id);
  const myProgress = Number(myEntry?.progress ?? 0);
  const visiblePowerups = useMemo(() => {
    return myPowerups
      .filter((p) => !p.used_at)
      .map((p) => {
        const pos = getPositionOnTrack(p.position_pct, 0);
        return { ...p, x: pos.x, y: pos.y, reachable: myProgress >= p.position_pct };
      });
  }, [myPowerups, myProgress]);

  const handleCollectPowerup = async (id: string, reachable: boolean) => {
    if (!reachable) {
      toast.info('Você ainda não chegou neste power-up — venda mais!');
      return;
    }
    try {
      const res = await collectRacePowerup(id) as { powerup_type?: string; badge_unlocked?: boolean };
      play('powerup');
      toast.success(`⚡ Power-up coletado: ${res?.powerup_type ?? ''}`);
      if (res?.badge_unlocked) toast.success('🏆 Badge desbloqueado: Powerup Collector!');
      qc.invalidateQueries({ queryKey: ['race-powerups'] });
      qc.invalidateQueries({ queryKey: ['race-events'] });
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
    }
  };

  const handleManualCountdown = () => {
    setCountdownTrigger((t) => t + 1);
  };

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
            {season && (
              <Button onClick={handleManualCountdown} variant="outline">
                <Rocket className="w-4 h-4 mr-2" /> Largada!
              </Button>
            )}
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
                  <Arena
                    cars={leaderboard}
                    boostingIds={boostingIds}
                    overlayChildren={
                      <AnimatePresence>
                        {visiblePowerups.map((p) => (
                          <PowerUpIcon
                            key={p.id}
                            type={p.powerup_type}
                            x={p.x}
                            y={p.y}
                            onClick={() => handleCollectPowerup(p.id, p.reachable)}
                          />
                        ))}
                      </AnimatePresence>
                    }
                  />
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
        <RaceCountdown trigger={countdownTrigger} onTick={() => play('countdown')} />
      </div>
    </>
  );
}
