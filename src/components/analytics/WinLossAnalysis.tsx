import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { Trophy, XCircle, TrendingUp, Package, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS_WON = ['hsl(var(--chart-2))', 'hsl(142 76% 46%)', 'hsl(142 76% 56%)', 'hsl(142 76% 66%)'];
const COLORS_LOST = ['hsl(var(--destructive))', 'hsl(0 84% 50%)', 'hsl(0 84% 60%)', 'hsl(0 84% 70%)'];

interface WinLossAnalysisProps {
  salespersonId?: string;
}

export function WinLossAnalysis({ salespersonId }: WinLossAnalysisProps) {
  const { data, isLoading } = useWinLossAnalysis(salespersonId);

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Análise Win/Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && (data.totalWins > 0 || data.totalLosses > 0);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Análise Win/Loss
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum resultado registrado ainda</p>
            <p className="text-sm">Registre wins e losses para ver a análise</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-500/10 rounded-lg p-4 text-center border border-green-500/20">
                <Trophy className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-500">{data.totalWins}</p>
                <p className="text-xs text-muted-foreground">Vitórias</p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-4 text-center border border-destructive/20">
                <XCircle className="h-6 w-6 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold text-destructive">{data.totalLosses}</p>
                <p className="text-xs text-muted-foreground">Perdas</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-primary">{data.winRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
            </div>

            {/* Reasons Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Win Reasons */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-green-500" />
                  Motivos de Vitória
                </h4>
                {data.reasonsWon.length > 0 ? (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.reasonsWon}
                          dataKey="count"
                          nameKey="reason"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                        >
                          {data.reasonsWon.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_WON[index % COLORS_WON.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [`${value} (${((value / data.totalWins) * 100).toFixed(0)}%)`, name]}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem dados</p>
                )}
                <div className="space-y-1 mt-2">
                  {data.reasonsWon.slice(0, 3).map((r, i) => (
                    <div key={r.reason} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_WON[i] }} />
                        {r.reason}
                      </span>
                      <span className="text-muted-foreground">{r.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loss Reasons */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-destructive" />
                  Motivos de Perda
                </h4>
                {data.reasonsLost.length > 0 ? (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.reasonsLost}
                          dataKey="count"
                          nameKey="reason"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                        >
                          {data.reasonsLost.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_LOST[index % COLORS_LOST.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [`${value} (${((value / data.totalLosses) * 100).toFixed(0)}%)`, name]}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem dados</p>
                )}
                <div className="space-y-1 mt-2">
                  {data.reasonsLost.slice(0, 3).map((r, i) => (
                    <div key={r.reason} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_LOST[i] }} />
                        {r.reason}
                      </span>
                      <span className="text-muted-foreground">{r.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By Product */}
            {data.byProduct.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Package className="h-4 w-4 text-primary" />
                  Win Rate por Produto
                </h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.byProduct.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis type="category" dataKey="product" width={80} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      />
                      <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* By Salesperson (only if not filtered) */}
            {!salespersonId && data.bySalesperson.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Users className="h-4 w-4 text-primary" />
                  Win Rate por Vendedor
                </h4>
                <div className="space-y-2">
                  {data.bySalesperson.slice(0, 5).map((sp) => (
                    <div key={sp.name} className="flex items-center gap-2">
                      <span className="text-xs w-20 truncate">{sp.name}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                          style={{ width: `${sp.winRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{sp.winRate.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
