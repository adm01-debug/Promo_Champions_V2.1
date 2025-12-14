import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWinLossAnalysis, WinLossFilters } from '@/hooks/useWinLossAnalysis';
import { useSalespeople } from '@/hooks/useSalespeople';
import { Trophy, XCircle, TrendingUp, Package, Users, Filter, Calendar, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const COLORS_WON = ['hsl(var(--status-success))', 'hsl(142 76% 46%)', 'hsl(142 76% 56%)', 'hsl(142 76% 66%)'];
const COLORS_LOST = ['hsl(var(--destructive))', 'hsl(0 84% 50%)', 'hsl(0 84% 60%)', 'hsl(0 84% 70%)'];

const PERIOD_PRESETS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Este ano', days: 365 },
];

export function WinLossAnalysis() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<WinLossFilters>({});
  
  const { data: salespeople } = useSalespeople();
  const { data, isLoading } = useWinLossAnalysis(filters);

  const handlePeriodPreset = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = filters.salespersonId || filters.productName || filters.startDate || filters.endDate;

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rank-gold/20 to-rank-gold/5 shadow-lg">
              <Trophy className="h-4 w-4 text-rank-gold animate-pulse" />
            </div>
            <span className="gradient-text">Análise Win/Loss</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted/30 rounded-xl animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && (data.totalWins > 0 || data.totalLosses > 0);
  const isHighWinRate = data && data.winRate >= 50;

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rank-gold/20 to-rank-gold/5 shadow-lg group-hover:scale-110 transition-transform">
              <Trophy className="h-4 w-4 text-rank-gold" />
            </div>
            <span className="gradient-text">Análise Win/Loss</span>
            {isHighWinRate && (
              <Sparkles className="h-4 w-4 text-rank-gold animate-pulse" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasData && (
              <Badge variant="secondary" className={cn(
                "text-[10px] shadow-sm",
                isHighWinRate ? "bg-status-success/10 text-status-success" : "bg-destructive/10 text-destructive"
              )}>
                {data.winRate.toFixed(0)}% win rate
              </Badge>
            )}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 hover:scale-105 transition-transform">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Filters Panel */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleContent className="pt-4 animate-fade-in">
            <div className="space-y-4 p-4 glass rounded-lg border border-border/50">
              {/* Period Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-display flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Período Rápido
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PERIOD_PRESETS.map(preset => (
                    <Button
                      key={preset.days}
                      variant="outline"
                      size="sm"
                      className="text-xs transition-all duration-300 hover:scale-105"
                      onClick={() => handlePeriodPreset(preset.days)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-xs font-display">Data Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value || undefined }))}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-xs font-display">Data Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                    className="h-9"
                  />
                </div>

                {/* Salesperson */}
                <div className="space-y-2">
                  <Label className="text-xs font-display flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Vendedor
                  </Label>
                  <Select 
                    value={filters.salespersonId || 'all'} 
                    onValueChange={(v) => setFilters(prev => ({ ...prev, salespersonId: v === 'all' ? undefined : v }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {salespeople?.map(sp => (
                        <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product */}
                <div className="space-y-2">
                  <Label className="text-xs font-display flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Produto
                  </Label>
                  <Select 
                    value={filters.productName || 'all'} 
                    onValueChange={(v) => setFilters(prev => ({ ...prev, productName: v === 'all' ? undefined : v }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {data?.availableProducts.map(product => (
                        <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="transition-all duration-300 hover:scale-105">
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>

      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
            <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-3 shadow-inner animate-pulse">
              <Trophy className="h-12 w-12 opacity-50" />
            </div>
            <p className="font-display font-medium gradient-text">Nenhum resultado encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters 
                ? 'Tente ajustar os filtros' 
                : 'Registre wins e losses para ver a análise'}
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift cursor-pointer hover-glow-success transition-all duration-300 animate-fade-in group">
                <div className="p-2 rounded-lg bg-status-success/20 shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-status-success/20">
                  <Trophy className="h-5 w-5 text-status-success" />
                </div>
                <p className="text-2xl font-bold font-display text-status-success transition-transform duration-300 group-hover:scale-110">{data.totalWins}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Vitórias</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-destructive/30 hover-lift cursor-pointer hover-glow-error transition-all duration-300 animate-fade-in group" style={{ animationDelay: '50ms' }}>
                <div className="p-2 rounded-lg bg-destructive/20 shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-destructive/20">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-2xl font-bold font-display text-destructive transition-transform duration-300 group-hover:scale-110">{data.totalLosses}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Perdas</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift cursor-pointer transition-all duration-300 animate-fade-in group" style={{ animationDelay: '100ms' }}>
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md w-fit mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-primary/30">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold font-display gradient-text transition-transform duration-300 group-hover:scale-110">{data.winRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Win Rate</p>
              </div>
            </div>

            {/* Reasons Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Win Reasons */}
              <div className="animate-fade-in glass rounded-xl p-4 border border-status-success/20" style={{ animationDelay: '150ms' }}>
                <h4 className="text-sm font-display font-medium mb-3 flex items-center gap-2">
                  <div className="p-1 rounded-md bg-status-success/10">
                    <Trophy className="h-3.5 w-3.5 text-status-success" />
                  </div>
                  Motivos de Vitória
                </h4>
                {data.reasonsWon.length > 0 ? (
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.reasonsWon}
                          dataKey="count"
                          nameKey="reason"
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={55}
                        >
                          {data.reasonsWon.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS_WON[index % COLORS_WON.length]}
                              className="transition-all hover:opacity-80"
                              style={{ filter: `drop-shadow(0 2px 4px ${COLORS_WON[index % COLORS_WON.length]}40)` }}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [`${value} (${((value / data.totalWins) * 100).toFixed(0)}%)`, name]}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground glass rounded-lg p-4 text-center">Sem dados</p>
                )}
                <ScrollArea className="h-[80px] mt-2">
                  <div className="space-y-1">
                    {data.reasonsWon.slice(0, 5).map((r, i) => (
                      <div key={r.reason} className="flex items-center justify-between text-xs group cursor-default hover:bg-status-success/5 rounded-md px-2 py-1.5 transition-all">
                        <span className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS_WON[i % COLORS_WON.length] }} />
                          <span className="group-hover:text-status-success transition-colors truncate max-w-[120px]">{r.reason}</span>
                        </span>
                        <span className="text-status-success font-display font-bold">{r.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Loss Reasons */}
              <div className="animate-fade-in glass rounded-xl p-4 border border-destructive/20" style={{ animationDelay: '200ms' }}>
                <h4 className="text-sm font-display font-medium mb-3 flex items-center gap-2">
                  <div className="p-1 rounded-md bg-destructive/10">
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  Motivos de Perda
                </h4>
                {data.reasonsLost.length > 0 ? (
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.reasonsLost}
                          dataKey="count"
                          nameKey="reason"
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={55}
                        >
                          {data.reasonsLost.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS_LOST[index % COLORS_LOST.length]}
                              className="transition-all hover:opacity-80"
                              style={{ filter: `drop-shadow(0 2px 4px ${COLORS_LOST[index % COLORS_LOST.length]}40)` }}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [`${value} (${((value / data.totalLosses) * 100).toFixed(0)}%)`, name]}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground glass rounded-lg p-4 text-center">Sem dados</p>
                )}
                <ScrollArea className="h-[80px] mt-2">
                  <div className="space-y-1">
                    {data.reasonsLost.slice(0, 5).map((r, i) => (
                      <div key={r.reason} className="flex items-center justify-between text-xs group cursor-default hover:bg-destructive/5 rounded-md px-2 py-1.5 transition-all">
                        <span className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS_LOST[i % COLORS_LOST.length] }} />
                          <span className="group-hover:text-destructive transition-colors truncate max-w-[120px]">{r.reason}</span>
                        </span>
                        <span className="text-destructive font-display font-bold">{r.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* By Product */}
            {data.byProduct.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
                <h4 className="text-sm font-display font-medium mb-2 flex items-center gap-1">
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
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.75rem' }}
                      />
                      <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* By Salesperson (only if not filtered by salesperson) */}
            {!filters.salespersonId && data.bySalesperson.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <h4 className="text-sm font-display font-medium mb-2 flex items-center gap-1">
                  <Users className="h-4 w-4 text-primary" />
                  Win Rate por Vendedor
                </h4>
                <div className="space-y-2">
                  {data.bySalesperson.slice(0, 5).map((sp, index) => (
                    <div key={sp.name} className="flex items-center gap-2 group cursor-pointer animate-fade-in" style={{ animationDelay: `${(index + 7) * 50}ms` }}>
                      <span className="text-xs font-display w-20 truncate group-hover:text-primary transition-colors">{sp.name}</span>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500 group-hover:brightness-110"
                          style={{ width: `${sp.winRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-display font-medium w-12 text-right group-hover:text-foreground transition-colors">{sp.winRate.toFixed(0)}%</span>
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
