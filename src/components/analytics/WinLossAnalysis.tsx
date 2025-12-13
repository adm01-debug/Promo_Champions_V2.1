import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWinLossAnalysis, WinLossFilters } from '@/hooks/useWinLossAnalysis';
import { useSalespeople } from '@/hooks/useSalespeople';
import { Trophy, XCircle, TrendingUp, Package, Users, Filter, Calendar } from 'lucide-react';
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

const COLORS_WON = ['hsl(var(--chart-2))', 'hsl(142 76% 46%)', 'hsl(142 76% 56%)', 'hsl(142 76% 66%)'];
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
      <Card variant="elevated" className="border-border/40 dark:border-glow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Análise Win/Loss</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted/50 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && (data.totalWins > 0 || data.totalLosses > 0);

  return (
    <Card variant="elevated" className="border-border/40 dark:border-glow hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Análise Win/Loss</span>
          </CardTitle>
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Filters Panel */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleContent className="pt-4">
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              {/* Period Presets */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Período Rápido
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PERIOD_PRESETS.map(preset => (
                    <Button
                      key={preset.days}
                      variant="outline"
                      size="sm"
                      className="text-xs"
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
                  <Label htmlFor="startDate" className="text-xs">Data Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value || undefined }))}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-xs">Data Fim</Label>
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
                  <Label className="text-xs flex items-center gap-1">
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
                  <Label className="text-xs flex items-center gap-1">
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
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
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
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum resultado encontrado</p>
            <p className="text-sm">
              {hasActiveFilters 
                ? 'Tente ajustar os filtros' 
                : 'Registre wins e losses para ver a análise'}
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center border border-status-success/30 hover-lift cursor-pointer hover-glow-success">
                <div className="p-2 rounded-lg bg-status-success/20 w-fit mx-auto mb-2">
                  <Trophy className="h-5 w-5 text-status-success" />
                </div>
                <p className="text-2xl font-bold text-status-success">{data.totalWins}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Vitórias</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-destructive/30 hover-lift cursor-pointer hover-glow-error">
                <div className="p-2 rounded-lg bg-destructive/20 w-fit mx-auto mb-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-2xl font-bold text-destructive">{data.totalLosses}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Perdas</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-primary/30 hover-lift cursor-pointer hover-glow-primary">
                <div className="p-2 rounded-lg gradient-primary w-fit mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold gradient-text">{data.winRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
              </div>
            </div>

            {/* Reasons Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Win Reasons */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-status-success" />
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

            {/* By Salesperson (only if not filtered by salesperson) */}
            {!filters.salespersonId && data.bySalesperson.length > 0 && (
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
