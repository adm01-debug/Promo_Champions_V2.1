import { Card, CardContent } from '@/components/ui/card';
import { useRaceBadges, RACE_BADGE_CATALOG } from '@/hooks/race/useRaceBadges';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';
import { Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RaceBadgeShowcase() {
  const { data: car } = useMyRaceCar();
  const { data: badges = [] } = useRaceBadges(car?.salesperson_id);
  const earnedMap = new Map(badges.map((b) => [b.badge_code, b]));

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2">🏆 Conquistas da Pista</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RACE_BADGE_CATALOG.map((b) => {
            const earned = earnedMap.get(b.code);
            return (
              <div
                key={b.code}
                className={`relative rounded-xl border p-3 text-center transition-all ${
                  earned
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 border-amber-400 shadow-md'
                    : 'bg-muted/30 border-border opacity-60'
                }`}
              >
                <div className="text-3xl">{earned ? b.emoji : <Lock className="w-6 h-6 mx-auto text-muted-foreground" />}</div>
                <div className="text-xs font-bold mt-1">{b.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{b.desc}</div>
                {earned && (
                  <div className="text-[9px] text-amber-700 dark:text-amber-300 mt-1 font-medium">
                    {format(new Date(earned.earned_at), 'dd/MM', { locale: ptBR })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
