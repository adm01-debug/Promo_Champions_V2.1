import { FC } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { Trophy, Maximize2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WinLossKpiCards } from './win-loss/WinLossKpiCards';
import { WinLossMonthlyTrend } from './win-loss/WinLossMonthlyTrend';
import { WinLossReasonsPanels } from './win-loss/WinLossReasonsPanels';
import { WinLossDrillDown } from './win-loss/WinLossDrillDown';

export const WinLossAnalysis: FC = () => {
  const { data, isLoading } = useWinLossAnalysis();
  const navigate = useNavigate();
  const location = useLocation();
  const isDedicatedPage = location.pathname === '/analytics/win-loss';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass border-border/40">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      {!isDedicatedPage && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-success" />
            <h3 className="font-display font-semibold gradient-text">Análise de Ganhos e Perdas</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10"
            onClick={() => navigate('/analytics/win-loss')}
          >
            <Maximize2 className="h-4 w-4" />
            Ver Completo
          </Button>
        </div>
      )}

      <WinLossKpiCards totalWins={data.totalWins} totalLosses={data.totalLosses} winRate={data.winRate} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WinLossMonthlyTrend data={data.monthlyTrend} />
        <WinLossReasonsPanels
          topWinReasons={data.topWinReasons}
          topLossReasons={data.topLossReasons}
          totalWins={data.totalWins}
          totalLosses={data.totalLosses}
        />
      </div>

      {isDedicatedPage && (
        <WinLossDrillDown
          bySalesperson={data.bySalesperson}
          byProduct={data.byProduct}
          details={data.details}
        />
      )}
    </div>
  );
};
