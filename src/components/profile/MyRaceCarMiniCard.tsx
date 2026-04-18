import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Trophy, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRaceSeason } from '@/hooks/race/useRaceSeason';
import { useRaceLeaderboard } from '@/hooks/race/useRaceLeaderboard';
import { useRaceBadges } from '@/hooks/race/useRaceBadges';

interface MyRaceCarMiniCardProps {
  salespersonId?: string;
}

export function MyRaceCarMiniCard({ salespersonId }: MyRaceCarMiniCardProps) {
  const { data: car } = useQuery({
    queryKey: ['my-race-car', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return null;
      const { data } = await supabase
        .from('race_cars')
        .select('car_number, primary_color, secondary_color, nickname, total_wins, total_overtakes')
        .eq('salesperson_id', salespersonId)
        .maybeSingle();
      return data;
    },
    enabled: !!salespersonId,
  });
  const { data: season } = useRaceSeason();
  const { data: leaderboard = [] } = useRaceLeaderboard(season?.id);
  const { data: badges = [] } = useRaceBadges(salespersonId);

  if (!salespersonId || !car) return null;

  const myEntry = leaderboard.find((e) => e.salesperson_id === salespersonId);
  const rank = myEntry?.rank ?? '-';
  const progress = Math.round(Number(myEntry?.progress ?? 0) * 100);

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Meu Carro de Corrida</span>
          </div>
          <Button asChild size="sm" variant="ghost" className="h-7 px-2">
            <Link to="/race-arena">
              <ExternalLink className="w-3 h-3" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            className="relative w-16 h-10 rounded-md flex items-center justify-center font-black text-lg shadow-lg"
            style={{ backgroundColor: car.primary_color, color: car.secondary_color }}
            animate={{ x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            #{car.car_number}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{car.nickname || 'Sem apelido'}</p>
            <p className="text-xs text-muted-foreground">
              Posição <strong>#{rank}</strong> · {progress}% da meta
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>{car.total_wins} vitórias · {car.total_overtakes} ultrapassagens</span>
          </div>
          <Badge variant="secondary" className="text-xs">{badges.length} 🏆</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
