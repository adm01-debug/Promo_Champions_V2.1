import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSeasonalTournaments } from '@/hooks/useSeasonalTournaments';
import { Trophy, Medal, Calendar, TrendingUp, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
const rankIcons = ['🥇', '🥈', '🥉'];

export const SeasonalTournamentsCard: FC = () => {
  const { data, isLoading, error } = useSeasonalTournaments();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Torneios</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Torneios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar torneios</p>
        </CardContent>
      </Card>
    );
  }

  const tournament = data.activeTournament;
  if (!tournament) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Torneios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum torneio ativo no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  const endDate = new Date(tournament.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const maxScore = Math.max(...tournament.participants.map(p => p.score), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Torneios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Tournament Header */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="font-bold">{tournament.name}</span>
            </div>
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {daysLeft}d restantes
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{tournament.description}</p>
          <p className="text-xs mt-2 font-medium">{tournament.prizePool}</p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Medal className="h-4 w-4" />
            Ranking
          </h4>
          {tournament.participants.slice(0, 5).map((participant, idx) => (
            <div
              key={participant.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                idx < 3 ? 'bg-muted/50' : ''
              }`}
            >
              <span className="text-lg w-6 text-center">
                {idx < 3 ? rankIcons[idx] : `${idx + 1}º`}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${idx < 3 ? rankColors[idx] : ''}`}>
                  {participant.name}
                </p>
                <Progress 
                  value={(participant.score / maxScore) * 100} 
                  className="h-1 mt-1" 
                />
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(participant.score)}
              </span>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        {data.upcomingTournaments.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Próximos torneios</p>
            {data.upcomingTournaments.slice(0, 2).map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-muted-foreground" />
                  {t.name}
                </span>
                <Badge variant="secondary" className="text-xs">{t.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
