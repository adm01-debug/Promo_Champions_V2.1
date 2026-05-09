import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { Trophy, XCircle, TrendingUp, BarChart3, Maximize2, Users, Package, Clock, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const WinLossAnalysis: FC = () => {
  const { data, isLoading } = useWinLossAnalysis();
  const navigate = useNavigate();
  const location = useLocation();
  const isDedicatedPage = location.pathname === '/analytics/win-loss';

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
    <div className="space-y-4 animate-fade-in">
      {/* Header with Nav */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/40 hover-lift transition-all">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10 shadow-lg shadow-success/10">
              <Trophy className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{data.totalWins}</p>
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
              <p className="text-2xl font-bold font-display">{data.totalLosses}</p>
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
              <p className="text-2xl font-bold font-display">{data.winRate}%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate Geral</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card className="glass border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Histórico de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="wins" name="Vitórias" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="losses" name="Perdas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Reasons Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="glass border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-display text-success flex items-center gap-2 uppercase tracking-widest">
                <Trophy className="h-3.5 w-3.5" />
                Por que Ganhamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.topWinReasons.map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{r.reason}</span>
                    <span className="font-bold">{r.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success/60 rounded-full" 
                      style={{ width: `${(r.count / data.totalWins) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-display text-destructive flex items-center gap-2 uppercase tracking-widest">
                <XCircle className="h-3.5 w-3.5" />
                Por que Perdemos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.topLossReasons.map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{r.reason}</span>
                    <span className="font-bold">{r.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive/60 rounded-full" 
                      style={{ width: `${(r.count / data.totalLosses) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {isDedicatedPage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {/* Salesperson Drill-down */}
          <Card className="glass border-border/40 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Ranking por Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-border/30">
                  {data.bySalesperson.map((sp, i) => (
                    <div key={i} className="p-4 hover:bg-primary/5 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{sp.name}</span>
                        <Badge variant="outline" className="text-[10px]">{sp.winRate}% WR</Badge>
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="h-1.5 bg-success/40 rounded-full" style={{ width: `${(sp.wins / (sp.wins + sp.losses)) * 100}%` }} />
                        <div className="h-1.5 bg-destructive/40 rounded-full" style={{ width: `${(sp.losses / (sp.wins + sp.losses)) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>{sp.wins} vitórias</span>
                        <span>{sp.losses} perdas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Product Drill-down */}
          <Card className="glass border-border/40 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Performance por Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-border/30">
                  {data.byProduct.map((p, i) => (
                    <div key={i} className="p-4 hover:bg-primary/5 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate max-w-[150px]">{p.name}</span>
                        <span className="text-xs font-bold text-primary">{p.winRate}% WR</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-success">{p.wins} W</span>
                        <span className="text-destructive">{p.losses} L</span>
                        <span className="text-muted-foreground">{p.wins + p.losses} Total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Timeline of Outcomes */}
          <Card className="glass border-border/40 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-border/30">
                  {data.details.slice(0, 20).map((d, i) => (
                    <div key={i} className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {d.outcome === 'won' ? (
                            <Trophy className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                          )}
                          <span className="text-xs font-medium">{d.sales?.client_name || 'Desconhecido'}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 italic">"{d.reason}"</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{d.salespeople?.name || 'Vendedor'}</Badge>
                        <span className="text-[9px] font-bold text-primary">
                          {d.sales?.amount ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.sales.amount) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
