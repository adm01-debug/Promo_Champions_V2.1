import { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Flag, Calendar, PlayCircle, Rocket, Sliders } from 'lucide-react';
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
  ScoreBreakdownCard,
  ScoringRulesEditor,
} from '@/components/race';
import { getPositionOnTrack } from '@/components/race/raceTrackHelpers';
import { useRaceSeasonByRole, type RoleType } from '@/hooks/race/useRaceSeasonByRole';
import { useRaceLeaderboard } from '@/hooks/race/useRaceLeaderboard';
import { useRaceEvents } from '@/hooks/race/useRaceEvents';
import { useRaceSounds } from '@/hooks/race/useRaceSounds';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';
import { useRacePowerups, collectRacePowerup } from '@/hooks/race/useRacePowerups';
import { useRaceScoringRules, useUpsertScoringRule } from '@/hooks/race/useRaceScoringRules';
import { format, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const COUNTDOWN_SEEN_KEY = 'race_countdown_seen_seasons';

function RaceTabContent({ roleType }: { roleType: RoleType }) {
  const { data: season } = useRaceSeasonByRole(roleType);
  const { data: leaderboard = [] } = useRaceLeaderboard(season?.id);
  const { data: events = [] } = useRaceEvents(season?.id);
  const { data: rules = [] } = useRaceScoringRules(season?.id);
  const { play } = useRaceSounds();
  const { isAdmin } = useUserRoles();
  const { data: myCar } = useMyRaceCar();
  const { data: myPowerups = [] } = useRacePowerups(season?.id, myCar?.salesperson_id);
  const upsertRule = useUpsertScoringRule();
  const qc = useQueryClient();
  const [rulesEditorOpen, setRulesEditorOpen] = useState(false);
  const [boostingIds, setBoostingIds] = useState<Set<string>>(new Set());
  const lastEventIdRef = useRef<string | null>(null);

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

  const myEntry = leaderboard.find((e) => e.salesperson_id === myCar?.salesperson_id);
  const myProgress = Number(myEntry?.progress ?? 0);
  const visiblePowerups = useMemo(() => myPowerups
    .filter((p) => !p.used_at)
    .map((p) => {
      const pos = getPositionOnTrack(p.position_pct, 0);
      return { ...p, x: pos.x, y: pos.y, reachable: myProgress >= p.position_pct };
    }), [myPowerups, myProgress]);

  const handleCollectPowerup = async (id: string, reachable: boolean) => {
    if (!reachable) { toast.info('Você ainda não chegou neste power-up — venda mais!'); return; }
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

  if (!season) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-2">
          <Calendar className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="font-semibold">Nenhuma temporada ativa para {roleType === 'closer' ? 'Closers' : 'SDRs'}</p>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Use "Nova Temporada" para iniciar uma corrida deste papel.' : 'Aguarde o admin iniciar a próxima corrida.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">{season.name}</strong> · {format(new Date(season.start_date), 'dd MMM', { locale: ptBR })} → {format(new Date(season.end_date), 'dd MMM', { locale: ptBR })} · Meta {Number(season.goal_amount).toLocaleString('pt-BR')} pts
        </div>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={() => setRulesEditorOpen(true)}>
            <Sliders className="w-3.5 h-3.5 mr-1.5" /> Editar regras ({rules.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4" style={{ minHeight: '70vh' }}>
        <div className="col-span-12 lg:col-span-3 order-2 lg:order-1 space-y-3">
          <RaceEventFeed events={events} cars={leaderboard} />
          {myEntry && rules.length > 0 && (
            <ScoreBreakdownCard entry={myEntry} rules={rules} />
          )}
        </div>
        <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
          <Arena
            cars={leaderboard}
            boostingIds={boostingIds}
            overlayChildren={
              <AnimatePresence>
                {visiblePowerups.map((p) => (
                  <PowerUpIcon key={p.id} type={p.powerup_type} x={p.x} y={p.y} onClick={() => handleCollectPowerup(p.id, p.reachable)} />
                ))}
              </AnimatePresence>
            }
          />
        </div>
        <div className="col-span-12 lg:col-span-3 order-3">
          <RaceLeaderboardSidebar entries={leaderboard} goalAmount={Number(season.goal_amount)} />
        </div>
      </div>

      {isAdmin && (
        <ScoringRulesEditor
          open={rulesEditorOpen}
          onOpenChange={setRulesEditorOpen}
          roleType={roleType}
          initialRules={rules}
          onConfirm={async (newRules) => {
            try {
              await Promise.all(newRules.map((r) => upsertRule.mutateAsync({
                season_id: season.id,
                metric_code: r.metric_code,
                weight: r.weight,
                points_per_unit: r.points_per_unit,
                label: r.label,
              })));
              toast.success('Regras atualizadas! Leaderboard será recalculado.');
            } catch (e) {
              toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
            }
          }}
        />
      )}

      <VictoryLapOverlay events={events} cars={leaderboard} onPlaySound={() => play('victory')} />
    </div>
  );
}

export default function RaceArenaPage() {
  const { muted, toggleMute, play } = useRaceSounds();
  const { isAdmin } = useUserRoles();
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [startSeasonOpen, setStartSeasonOpen] = useState(false);
  const [countdownTrigger, setCountdownTrigger] = useState(0);
  const [activeRole, setActiveRole] = useState<RoleType>('closer');
  const { data: closerSeason } = useRaceSeasonByRole('closer');
  const { data: sdrSeason } = useRaceSeasonByRole('sdr');

  // countdown trigger ao detectar season nova
  useEffect(() => {
    const season = activeRole === 'closer' ? closerSeason : sdrSeason;
    if (!season) return;
    try {
      const seen = JSON.parse(localStorage.getItem(COUNTDOWN_SEEN_KEY) || '[]') as string[];
      if (seen.includes(season.id)) return;
      const ageSec = differenceInSeconds(new Date(), new Date(season.start_date));
      if (ageSec < 10 && ageSec > -86400) {
        setCountdownTrigger((t) => t + 1);
        localStorage.setItem(COUNTDOWN_SEEN_KEY, JSON.stringify([...seen, season.id]));
      } else if (ageSec >= 10) {
        localStorage.setItem(COUNTDOWN_SEEN_KEY, JSON.stringify([...seen, season.id]));
      }
    } catch { /* noop */ }
  }, [activeRole, closerSeason, sdrSeason]);

  return (
    <>
      <Helmet>
        <title>Race Arena — Corridas Closer & SDR</title>
        <meta name="description" content="Duas corridas mensais simultâneas: Closer e SDR, com pontuação configurável e auto-atualização em tempo real." />
      </Helmet>

      <div className="container mx-auto p-4 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2 font-display">
              <Flag className="w-7 h-7 text-primary" /> Race Arena
            </h1>
            <p className="text-sm text-muted-foreground">
              Duas corridas simultâneas — pontuação configurável por papel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RaceSoundToggle muted={muted} onToggle={toggleMute} />
            <Button onClick={() => setCountdownTrigger((t) => t + 1)} variant="outline">
              <Rocket className="w-4 h-4 mr-2" /> Largada!
            </Button>
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

        <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as RoleType)} className="w-full">
          <TabsList>
            <TabsTrigger value="closer">🎯 Corrida Closer</TabsTrigger>
            <TabsTrigger value="sdr">📞 Corrida SDR</TabsTrigger>
            <TabsTrigger value="badges">🏆 Conquistas</TabsTrigger>
          </TabsList>
          <TabsContent value="closer">
            <RaceTabContent roleType="closer" />
          </TabsContent>
          <TabsContent value="sdr">
            <RaceTabContent roleType="sdr" />
          </TabsContent>
          <TabsContent value="badges">
            <RaceBadgeShowcase />
          </TabsContent>
        </Tabs>

        <CarCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
        <StartSeasonDialog open={startSeasonOpen} onOpenChange={setStartSeasonOpen} />
        <RaceCountdown trigger={countdownTrigger} onTick={() => play('countdown')} />
      </div>
    </>
  );
}
