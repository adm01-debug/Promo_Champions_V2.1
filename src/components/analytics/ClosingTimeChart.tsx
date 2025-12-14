import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useClosingTime } from '@/hooks/useClosingTime';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, User, Package, Tag, Timer, TrendingDown, Trophy } from 'lucide-react';

const COLORS = [
  'hsl(var(--status-success))',
  'hsl(var(--primary))',
  'hsl(var(--status-warning))',
  'hsl(var(--status-info))',
  'hsl(var(--status-purple))',
];

export function ClosingTimeChart() {
  const { data, isLoading } = useClosingTime();

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow animate-fade-in">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-muted/50 rounded-xl animate-shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted/50 rounded-lg w-1/4 animate-shimmer" />
                <div className="h-8 bg-muted/50 rounded-lg w-1/3 animate-shimmer" />
              </div>
            </div>
            <div className="h-64 bg-muted/50 rounded-xl animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass border border-border/50 rounded-xl p-3 shadow-lg shadow-primary/10">
          <p className="font-display font-semibold text-foreground">{item.name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-primary" />
                Tempo médio:
              </span>
              <span className="font-medium gradient-text">{item.avgDays} dias</span>
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-status-info" />
                Deals:
              </span>
              <span className="font-medium text-foreground">{item.deals}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = (items: { name: string; avgDays: number; deals: number }[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={items} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
        <defs>
          {items.map((_, index) => (
            <linearGradient key={`gradient-${index}`} id={`closingGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1}/>
              <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6}/>
            </linearGradient>
          ))}
        </defs>
        <XAxis 
          type="number"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickFormatter={(v) => `${v}d`}
        />
        <YAxis 
          type="category"
          dataKey="name"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
        <Bar dataKey="avgDays" radius={[0, 6, 6, 0]}>
          {items.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#closingGradient-${index})`}
              style={{ filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.15))' }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Find fastest performer in each category
  const fastestSalesperson = data?.bySalesperson?.[0];
  const fastestProduct = data?.byProduct?.[0];
  const fastestCategory = data?.byCategory?.[0];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Card */}
      <Card variant="elevated" className="glass border-primary/30 dark:border-glow hover-lift transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/50 group-hover:rotate-3">
                <Timer className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Tempo Médio de Fechamento</p>
                <p className="text-4xl font-bold font-display gradient-text mt-1 transition-transform duration-300 group-hover:scale-105">
                  {data?.overall.avgDays || 0} <span className="text-lg font-normal text-muted-foreground">dias</span>
                </p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Total de Deals</p>
              <p className="text-2xl font-bold font-display text-foreground">{data?.overall.totalDeals || 0}</p>
              {fastestSalesperson && (
                <Badge variant="outline" className="bg-status-success/10 border-status-success/30 text-status-success text-xs mt-1">
                  <Trophy className="h-3 w-3 mr-1" />
                  {fastestSalesperson.name}: {fastestSalesperson.avgDays}d
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts by Category */}
      <Tabs defaultValue="salesperson" className="space-y-4">
        <TabsList className="glass border border-border/50 p-1">
          <TabsTrigger value="salesperson" className="gap-2 font-display transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
            <User className="h-4 w-4" />
            Por Vendedor
          </TabsTrigger>
          <TabsTrigger value="product" className="gap-2 font-display transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
            <Package className="h-4 w-4" />
            Por Produto
          </TabsTrigger>
          <TabsTrigger value="category" className="gap-2 font-display transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
            <Tag className="h-4 w-4" />
            Por Categoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salesperson" className="animate-fade-in">
          <Card variant="elevated" className="glass border-border/40 dark:border-glow hover-lift transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
                  <div className="p-1.5 rounded-lg bg-status-info/20 shadow-md transition-all duration-300 group-hover/title:scale-110">
                    <User className="h-3.5 w-3.5 text-status-info" />
                  </div>
                  Tempo de Fechamento por Vendedor
                </CardTitle>
                {data?.bySalesperson && data.bySalesperson.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {data.bySalesperson.length} vendedores
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {data?.bySalesperson && data.bySalesperson.length > 0 ? (
                renderChart(data.bySalesperson)
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
                  <div className="p-4 rounded-full bg-muted/30 mb-3 animate-pulse">
                    <User className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="font-display font-medium">Sem dados de histórico de estágios</p>
                  <p className="text-xs text-muted-foreground mt-1">Dados aparecerão conforme deals forem fechados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product" className="animate-fade-in">
          <Card variant="elevated" className="glass border-border/40 dark:border-glow hover-lift transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
                  <div className="p-1.5 rounded-lg bg-status-purple/20 shadow-md transition-all duration-300 group-hover/title:scale-110">
                    <Package className="h-3.5 w-3.5 text-status-purple" />
                  </div>
                  Tempo de Fechamento por Produto
                </CardTitle>
                {data?.byProduct && data.byProduct.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {data.byProduct.length} produtos
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {data?.byProduct && data.byProduct.length > 0 ? (
                renderChart(data.byProduct)
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
                  <div className="p-4 rounded-full bg-muted/30 mb-3 animate-pulse">
                    <Package className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="font-display font-medium">Sem dados de histórico de estágios</p>
                  <p className="text-xs text-muted-foreground mt-1">Dados aparecerão conforme deals forem fechados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="animate-fade-in">
          <Card variant="elevated" className="glass border-border/40 dark:border-glow hover-lift transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
                  <div className="p-1.5 rounded-lg bg-status-warning/20 shadow-md transition-all duration-300 group-hover/title:scale-110">
                    <Tag className="h-3.5 w-3.5 text-status-warning" />
                  </div>
                  Tempo de Fechamento por Categoria
                </CardTitle>
                {data?.byCategory && data.byCategory.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {data.byCategory.length} categorias
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {data?.byCategory && data.byCategory.length > 0 ? (
                renderChart(data.byCategory)
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
                  <div className="p-4 rounded-full bg-muted/30 mb-3 animate-pulse">
                    <Tag className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="font-display font-medium">Sem dados de histórico de estágios</p>
                  <p className="text-xs text-muted-foreground mt-1">Dados aparecerão conforme deals forem fechados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
