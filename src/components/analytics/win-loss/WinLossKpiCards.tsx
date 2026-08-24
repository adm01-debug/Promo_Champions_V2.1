import { FC, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, XCircle, TrendingUp } from 'lucide-react';

interface Props {
  totalWins: number;
  totalLosses: number;
  winRate: number;
}

const WinLossKpiCardsBase: FC<Props> = ({ totalWins, totalLosses, winRate }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card className="glass border-border/40 hover-lift transition-all">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-success/10 shadow-lg shadow-success/10">
          <Trophy className="h-6 w-6 text-success" />
        </div>
        <div>
          <p className="text-2xl font-bold font-display">{totalWins}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Vitórias</p>
        </div>
      </CardContent>
    </Card>
    <Card className="glass border-border/40 hover-lift transition-all">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-destructive/10 shadow-lg shadow-destructive/10">
          <XCircle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p className="text-2xl font-bold font-display">{totalLosses}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Perdas</p>
        </div>
      </CardContent>
    </Card>
    <Card className="glass border-border/40 hover-lift transition-all">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 shadow-lg shadow-primary/10">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold font-display">{winRate}%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate Geral</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const WinLossKpiCards = memo(WinLossKpiCardsBase);
