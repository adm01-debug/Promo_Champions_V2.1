import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ComposedChart, Area } from 'recharts';
import { Package, Users, TrendingUp, Layers } from 'lucide-react';

const COLORS = {
  A: 'hsl(var(--status-success))',
  B: 'hsl(var(--status-warning))',
  C: 'hsl(var(--status-error))',
};

export function ABCAnalysis() {
  const { data, isLoading } = useABCAnalysis();

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted/50 rounded-lg w-1/3" />
            <div className="h-64 bg-muted/50 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass rounded-xl p-4 border border-border/50 shadow-xl animate-fade-in">
          <p className="font-semibold text-foreground gradient-text">{data.name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">
              Receita: <span className="text-foreground font-medium">{formatCurrency(data.revenue)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Participação: <span className="text-foreground font-medium">{data.percentage.toFixed(1)}%</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Acumulado: <span className="text-foreground font-medium">{data.cumulativePercentage.toFixed(1)}%</span>
            </p>
          </div>
          <Badge 
            variant="outline" 
            className="mt-2 font-bold"
            style={{ borderColor: COLORS[data.classification as keyof typeof COLORS], color: COLORS[data.classification as keyof typeof COLORS] }}
          >
            Classe {data.classification}
          </Badge>
        </div>
      );
    }
    return null;
  };

  const renderChart = (items: typeof data.products) => (
    <div className="animate-fade-in">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={items.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            interval={0}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            height={80}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar yAxisId="left" dataKey="revenue" radius={[6, 6, 0, 0]}>
            {items.slice(0, 15).map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.classification]}
                style={{
                  filter: `drop-shadow(0 4px 8px ${COLORS[entry.classification]}40)`
                }}
              />
            ))}
          </Bar>
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="cumulativePercentage" 
            stroke="url(#lineGradient)" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTable = (items: typeof data.products) => (
    <div className="max-h-[300px] overflow-y-auto rounded-xl">
      <table className="w-full text-sm">
        <thead className="sticky top-0 glass">
          <tr className="border-b border-border/50">
            <th className="text-left py-3 px-3 text-muted-foreground font-medium">Nome</th>
            <th className="text-right py-3 px-3 text-muted-foreground font-medium">Receita</th>
            <th className="text-right py-3 px-3 text-muted-foreground font-medium">%</th>
            <th className="text-center py-3 px-3 text-muted-foreground font-medium">Classe</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr 
              key={i} 
              className="border-b border-border/30 hover:bg-primary/5 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <td className="py-2.5 px-3 font-medium text-foreground">{item.name}</td>
              <td className="text-right py-2.5 px-3 text-foreground">{formatCurrency(item.revenue)}</td>
              <td className="text-right py-2.5 px-3 text-muted-foreground">{item.percentage.toFixed(1)}%</td>
              <td className="text-center py-2.5 px-3">
                <Badge 
                  variant="outline"
                  className="font-bold"
                  style={{ 
                    borderColor: COLORS[item.classification],
                    color: COLORS[item.classification],
                    backgroundColor: `${COLORS[item.classification]}15`,
                  }}
                >
                  {item.classification}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <span className="text-lg font-display font-semibold gradient-text">Análise ABC</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {(['A', 'B', 'C'] as const).map((cls, index) => (
          <Card 
            key={`prod-${cls}`} 
            className="glass dark:border-glow card-elevated hover-lift cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-1.5 rounded-lg transition-transform group-hover:scale-110" 
                  style={{ backgroundColor: `${COLORS[cls]}20` }}
                >
                  <Package className="h-3.5 w-3.5" style={{ color: COLORS[cls] }} />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Produtos</span>
                <Badge 
                  variant="outline" 
                  className="ml-auto font-bold"
                  style={{ borderColor: COLORS[cls], color: COLORS[cls], backgroundColor: `${COLORS[cls]}10` }}
                >
                  {cls}
                </Badge>
              </div>
              <p className="text-2xl font-bold font-display" style={{ color: COLORS[cls] }}>
                {data?.summary.products[cls] || 0}
              </p>
            </CardContent>
          </Card>
        ))}
        {(['A', 'B', 'C'] as const).map((cls, index) => (
          <Card 
            key={`client-${cls}`} 
            className="glass dark:border-glow card-elevated hover-lift cursor-pointer animate-fade-in"
            style={{ animationDelay: `${(index + 3) * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-1.5 rounded-lg transition-transform group-hover:scale-110" 
                  style={{ backgroundColor: `${COLORS[cls]}20` }}
                >
                  <Users className="h-3.5 w-3.5" style={{ color: COLORS[cls] }} />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Clientes</span>
                <Badge 
                  variant="outline" 
                  className="ml-auto font-bold"
                  style={{ borderColor: COLORS[cls], color: COLORS[cls], backgroundColor: `${COLORS[cls]}10` }}
                >
                  {cls}
                </Badge>
              </div>
              <p className="text-2xl font-bold font-display" style={{ color: COLORS[cls] }}>
                {data?.summary.clients[cls] || 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="glass border border-border/50">
          <TabsTrigger value="products" className="gap-2 data-[state=active]:gradient-primary data-[state=active]:text-white">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2 data-[state=active]:gradient-primary data-[state=active]:text-white">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass dark:border-glow card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <span className="gradient-text">Curva ABC - Produtos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.products && data.products.length > 0 ? (
                  renderChart(data.products)
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl">
                    <Package className="h-10 w-10 opacity-30 mb-2" />
                    <p className="text-sm">Sem dados disponíveis</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="glass dark:border-glow card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <span className="gradient-text">Ranking de Produtos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.products && data.products.length > 0 ? (
                  renderTable(data.products)
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl">
                    <Package className="h-10 w-10 opacity-30 mb-2" />
                    <p className="text-sm">Sem dados disponíveis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass dark:border-glow card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <span className="gradient-text">Curva ABC - Clientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.clients && data.clients.length > 0 ? (
                  renderChart(data.clients)
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl">
                    <Users className="h-10 w-10 opacity-30 mb-2" />
                    <p className="text-sm">Sem dados disponíveis</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="glass dark:border-glow card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="gradient-text">Ranking de Clientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.clients && data.clients.length > 0 ? (
                  renderTable(data.clients)
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl">
                    <Users className="h-10 w-10 opacity-30 mb-2" />
                    <p className="text-sm">Sem dados disponíveis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
