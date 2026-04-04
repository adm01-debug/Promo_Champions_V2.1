import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { Trophy, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const WinLossAnalysis: FC = () => {
  const { data, isLoading } = useWinLossAnalysis();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="glass border-border/40">
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/40">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Trophy className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.totalWins}</p>
              <p className="text-xs text-muted-foreground">Vitórias</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/40">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.totalLosses}</p>
              <p className="text-xs text-muted-foreground">Perdas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/40">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card className="glass border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Tendência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="wins" name="Vitórias" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="losses" name="Perdas" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Reasons */}
        <div className="space-y-4">
          <Card className="glass border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-success" />
                Top Motivos de Vitória
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.topWinReasons.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum registro</p>
              ) : (
                data.topWinReasons.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{r.reason}</span>
                    <Badge variant="secondary" className="ml-2">{r.count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="glass border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Top Motivos de Perda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.topLossReasons.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum registro</p>
              ) : (
                data.topLossReasons.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{r.reason}</span>
                    <Badge variant="destructive" className="ml-2">{r.count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
