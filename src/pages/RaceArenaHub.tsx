import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Trophy, Users, ArrowRight, Settings, Phone, Handshake, Award } from 'lucide-react';
import { useRaceSeasonByRole, type RoleType } from '@/hooks/race/useRaceSeasonByRole';
import { useRaceLeaderboard } from '@/hooks/race/useRaceLeaderboard';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';
import { useCurrentStreak } from '@/hooks/gamification/useDailyStreakAchievements';
import { useDailyBriefing } from '@/hooks/race/useDailyBriefing';
import { useRaceWhatIf } from '@/hooks/race/useRaceWhatIf';
import { useRaceSmartNotifications } from '@/hooks/race/useRaceSmartNotifications';
import { useMyRival } from '@/hooks/race/useMyRival';
import { useMyCareer } from '@/hooks/race/useMyCareer';
import { useSessionDuration } from '@/hooks/race/useSessionDuration';
import { useRaceViewTelemetry } from '@/hooks/race/useRaceViewTelemetry';
import { ChampionsHistoryPanel } from '@/components/race/ChampionsHistoryPanel';
import { DailyBriefingModal } from '@/components/race/DailyBriefingModal';
import { NextRaceActionCard } from '@/components/race/NextRaceActionCard';
import { RacePanelErrorBoundary } from '@/components/race/RacePanelErrorBoundary';
import { RaceCalmProvider } from '@/contexts/RaceCalmContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ROLES: { role: RoleType; title: string; emoji: string; description: string; gradient: string; href: string; Icon: typeof Phone }[] = [
  {
    role: 'closer', title: 'Corrida dos Closers', emoji: '🎯',
    description: 'Disputa entre fechadores de vendas. Pontuação baseada em valor, markup e novos clientes.',
    gradient: 'from-primary/20 via-primary/5 to-transparent',
    href: '/race-arena/closer', Icon: Handshake,
  },
  {
    role: 'sdr', title: 'Corrida dos SDRs', emoji: '📞',
    description: 'Disputa de prospecção. Pontuação por stakeholders captados, conversas e vendas originadas.',
    gradient: 'from-info/20 via-info/5 to-transparent',
    href: '/race-arena/sdr', Icon: Phone,
  },
];

function RoleCard({ cfg, index }: { cfg: typeof ROLES[number]; index: number }) {
  const { data: season } = useRaceSeasonByRole(cfg.role);
  const { data: leaderboard = [] } = useRaceLeaderboard(season?.id);
  const leader = leaderboard[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 120, damping: 18 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/40 transition-all hover:shadow-2xl group h-full">
        <div className={`bg-gradient-to-br ${cfg.gradient} p-6 border-b border-border`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-background/80 backdrop-blur flex items-center justify-center shadow-lg">
                <cfg.Icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black font-display flex items-center gap-2">
                  {cfg.emoji} {cfg.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">{cfg.description}</p>
              </div>
            </div>
            {season ? (
              <Badge variant="default" className="animate-pulse">AO VIVO</Badge>
            ) : (
              <Badge variant="secondary">Sem temporada</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {season ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Metric label="Temporada" value={season.name} />
                <Metric label="Pilotos" value={String(leaderboard.length)} icon={Users} />
                <Metric label="Líder" value={leader?.salesperson_name?.split(' ')[0] ?? '—'} icon={Trophy} />
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(season.start_date), 'dd MMM', { locale: ptBR })} →{' '}
                {format(new Date(season.end_date), 'dd MMM', { locale: ptBR })} · Meta{' '}
                {Number(season.goal_amount).toLocaleString('pt-BR')} pts
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              Nenhuma corrida ativa neste papel. Aguarde o admin iniciar a próxima temporada.
            </p>
          )}

          <Button asChild className="w-full group-hover:scale-[1.02] transition-transform" size="lg">
            <Link to={cfg.href}>
              Entrar na pista <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Phone }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </div>
      <div className="text-sm font-bold truncate">{value}</div>
    </div>
  );
}

export default function RaceArenaHub() {
  const { isAdmin } = useUserRoles();
  const { data: myCar } = useMyRaceCar();
  // Briefing usa a corrida de Closer como contexto principal (pode ser ajustado).
  const { data: closerSeason } = useRaceSeasonByRole('closer');
  const { data: closerLeaderboard = [] } = useRaceLeaderboard(closerSeason?.id);
  const { data: streakDays = 0 } = useCurrentStreak(myCar?.salesperson_id);
  const { data: career } = useMyCareer(myCar?.salesperson_id);

  const briefing = useDailyBriefing({
    entries: closerLeaderboard,
    currentUserSalespersonId: myCar?.salesperson_id,
    streakDays,
  });

  const whatIf = useRaceWhatIf({
    entries: closerLeaderboard,
    currentUserSalespersonId: myCar?.salesperson_id,
  });

  useRaceSmartNotifications({
    entries: closerLeaderboard,
    currentUserSalespersonId: myCar?.salesperson_id,
    seasonEndDate: closerSeason?.end_date,
  });

  // Densidade adaptativa: rastreia tempo na arena.
  useSessionDuration({ fatigueThresholdMs: 10 * 60 * 1000, notify: true });
  useRaceViewTelemetry('/race-arena', !!closerSeason);

  return (
    <RaceCalmProvider>
      <Helmet>
        <title>Race Arena — Hub de Corridas</title>
        <meta name="description" content="Hub central da Race Arena. Escolha entre a corrida dos Closers ou dos SDRs e acompanhe o ranking ao vivo." />
      </Helmet>

      <RacePanelErrorBoundary panelName="Briefing diário" fallback={null}>
        <DailyBriefingModal open={briefing.open} data={briefing.data} onDismiss={briefing.dismiss} whatIf={whatIf} />
      </RacePanelErrorBoundary>

      <div className="container mx-auto p-4 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3 font-display">
              <Flag className="w-9 h-9 text-primary" /> Race Arena
            </h1>
            <p className="text-muted-foreground mt-1">
              Duas corridas simultâneas — escolha a sua pista e acelere.
            </p>
          </div>
          {isAdmin && (
            <Button asChild variant="outline">
              <Link to="/admin/race-arena"><Settings className="w-4 h-4 mr-2" /> Admin Race</Link>
            </Button>
          )}
        </header>

        <RacePanelErrorBoundary panelName="Próxima ação">
          <NextRaceActionCard salespersonId={myCar?.salesperson_id} />
        </RacePanelErrorBoundary>

        {career && career.summary.total_seasons > 0 && (
          <Link
            to="/race-arena/career"
            className="block group"
            aria-label="Abrir minha carreira"
          >
            <Card className="border-warning/30 bg-gradient-to-r from-warning/10 via-card to-card hover:border-warning/60 transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    Sua Carreira
                  </p>
                  <p className="text-sm font-bold">
                    {career.summary.total_seasons} season{career.summary.total_seasons === 1 ? '' : 's'}
                    {' · '}
                    <span className="text-warning">{career.summary.total_titles} título{career.summary.total_titles === 1 ? '' : 's'}</span>
                    {' · '}
                    {career.summary.total_podiums} pódio{career.summary.total_podiums === 1 ? '' : 's'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROLES.map((cfg, i) => (
              <RacePanelErrorBoundary key={cfg.role} panelName={cfg.title}>
                <RoleCard cfg={cfg} index={i} />
              </RacePanelErrorBoundary>
            ))}
          </div>
          <RacePanelErrorBoundary panelName="Histórico de campeões">
            <ChampionsHistoryPanel className="lg:col-span-1" />
          </RacePanelErrorBoundary>
        </div>
      </div>
    </RaceCalmProvider>
  );
}
