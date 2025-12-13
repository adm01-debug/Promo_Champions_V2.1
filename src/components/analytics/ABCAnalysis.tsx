import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ComposedChart, Area } from 'recharts';
import { Package, Users, TrendingUp } from 'lucide-react';

const COLORS = {
  A: 'hsl(var(--status-success))',
  B: 'hsl(var(--status-warning))',
  C: 'hsl(var(--status-error))',
};

export function ABCAnalysis() {
  const { data, isLoading } = useABCAnalysis();

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
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
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Receita: {formatCurrency(data.revenue)}
          </p>
          <p className="text-sm text-muted-foreground">
            Participação: {data.percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">
            Acumulado: {data.cumulativePercentage.toFixed(1)}%
          </p>
          <Badge 
            variant="outline" 
            className="mt-1"
            style={{ borderColor: COLORS[data.classification as keyof typeof COLORS] }}
          >
            Classe {data.classification}
          </Badge>
        </div>
      );
    }
    return null;
  };

  const renderChart = (items: typeof data.products) => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={items.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
        <Bar yAxisId="left" dataKey="revenue" radius={[4, 4, 0, 0]}>
          {items.slice(0, 15).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.classification]} />
          ))}
        </Bar>
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="cumulativePercentage" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderTable = (items: typeof data.products) => (
    <div className="max-h-[300px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-card">
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground">Nome</th>
            <th className="text-right py-2 px-3 text-muted-foreground">Receita</th>
            <th className="text-right py-2 px-3 text-muted-foreground">%</th>
            <th className="text-center py-2 px-3 text-muted-foreground">Classe</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
              <td className="py-2 px-3 font-medium text-foreground">{item.name}</td>
              <td className="text-right py-2 px-3 text-foreground">{formatCurrency(item.revenue)}</td>
              <td className="text-right py-2 px-3 text-muted-foreground">{item.percentage.toFixed(1)}%</td>
              <td className="text-center py-2 px-3">
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: COLORS[item.classification],
                    color: COLORS[item.classification],
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
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {(['A', 'B', 'C'] as const).map(cls => (
          <Card key={`prod-${cls}`} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Produtos</span>
                <Badge 
                  variant="outline" 
                  className="ml-auto"
                  style={{ borderColor: COLORS[cls], color: COLORS[cls] }}
                >
                  {cls}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{data?.summary.products[cls] || 0}</p>
            </CardContent>
          </Card>
        ))}
        {(['A', 'B', 'C'] as const).map(cls => (
          <Card key={`client-${cls}`} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Clientes</span>
                <Badge 
                  variant="outline" 
                  className="ml-auto"
                  style={{ borderColor: COLORS[cls], color: COLORS[cls] }}
                >
                  {cls}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{data?.summary.clients[cls] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Curva ABC - Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.products && data.products.length > 0 ? (
                  renderChart(data.products)
                ) : (
                  <p className="text-muted-foreground text-center py-8">Sem dados disponíveis</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ranking de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.products && data.products.length > 0 ? (
                  renderTable(data.products)
                ) : (
                  <p className="text-muted-foreground text-center py-8">Sem dados disponíveis</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Curva ABC - Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.clients && data.clients.length > 0 ? (
                  renderChart(data.clients)
                ) : (
                  <p className="text-muted-foreground text-center py-8">Sem dados disponíveis</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ranking de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.clients && data.clients.length > 0 ? (
                  renderTable(data.clients)
                ) : (
                  <p className="text-muted-foreground text-center py-8">Sem dados disponíveis</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
