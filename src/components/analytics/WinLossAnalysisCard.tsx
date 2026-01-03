import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWinLossAnalysisDetailed } from '@/hooks/useWinLossAnalysisDetailed';
import { TrendingUp, TrendingDown, Target, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

export const WinLossAnalysisCard: FC = () => {
  const { data, isLoading, error } = useWinLossAnalysisDetailed();

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Análise Win/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Análise Win/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar análise</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Análise Win/Loss
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm">{data.won.total} ganhos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm">{data.lost.total} perdidos</span>
          </div>
          <span className="text-lg font-bold">
            {data.winRate.toFixed(1)}% Win Rate
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reasons">
          <TabsList className="mb-4">
            <TabsTrigger value="reasons">Motivos</TabsTrigger>
            <TabsTrigger value="category">Por Categoria</TabsTrigger>
            <TabsTrigger value="team">Por Vendedor</TabsTrigger>
          </TabsList>

          <TabsContent value="reasons" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Por que ganhamos
                </h4>
                {data.won.topReasons.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem dados</p>
                ) : (
                  data.won.topReasons.map((r, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{r.reason}</span>
                        <span className="text-muted-foreground">{r.percentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={r.percentage} className="h-1.5 bg-green-100" />
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Por que perdemos
                </h4>
                {data.lost.topReasons.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem dados</p>
                ) : (
                  data.lost.topReasons.map((r, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{r.reason}</span>
                        <span className="text-muted-foreground">{r.percentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={r.percentage} className="h-1.5 bg-red-100" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="category">
            <div className="space-y-3">
              {Object.entries(data.byCategory).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados por categoria</p>
              ) : (
                Object.entries(data.byCategory).map(([cat, stats]) => (
                  <div key={cat} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="font-medium">{cat}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600">{stats.won} ✓</span>
                      <span className="text-red-600">{stats.lost} ✗</span>
                      <span className="font-bold">{stats.winRate.toFixed(0)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-3">
              {data.bySalesperson.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados por vendedor</p>
              ) : (
                data.bySalesperson.slice(0, 5).map((sp) => (
                  <div key={sp.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{sp.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600">{sp.won} ✓</span>
                      <span className="text-red-600">{sp.lost} ✗</span>
                      <span className="font-bold">{sp.winRate.toFixed(0)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
