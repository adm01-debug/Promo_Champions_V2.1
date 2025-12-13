import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClosingTime } from '@/hooks/useClosingTime';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, User, Package, Tag } from 'lucide-react';

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            Tempo médio: <span className="text-foreground font-medium">{item.avgDays} dias</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Deals: <span className="text-foreground">{item.deals}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = (items: { name: string; avgDays: number; deals: number }[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={items} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
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
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avgDays" radius={[0, 4, 4, 0]}>
          {items.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio de Fechamento</p>
              <p className="text-4xl font-bold text-foreground mt-1">
                {data?.overall.avgDays || 0} <span className="text-lg font-normal text-muted-foreground">dias</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total de Deals</p>
              <p className="text-2xl font-bold text-foreground">{data?.overall.totalDeals || 0}</p>
            </div>
            <Clock className="h-16 w-16 text-primary/30" />
          </div>
        </CardContent>
      </Card>

      {/* Charts by Category */}
      <Tabs defaultValue="salesperson" className="space-y-4">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="salesperson" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-4 w-4" />
            Por Vendedor
          </TabsTrigger>
          <TabsTrigger value="product" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="h-4 w-4" />
            Por Produto
          </TabsTrigger>
          <TabsTrigger value="category" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Tag className="h-4 w-4" />
            Por Categoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salesperson">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Tempo de Fechamento por Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.bySalesperson && data.bySalesperson.length > 0 ? (
                renderChart(data.bySalesperson)
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Sem dados de histórico de estágios disponíveis
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Tempo de Fechamento por Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.byProduct && data.byProduct.length > 0 ? (
                renderChart(data.byProduct)
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Sem dados de histórico de estágios disponíveis
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Tempo de Fechamento por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.byCategory && data.byCategory.length > 0 ? (
                renderChart(data.byCategory)
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Sem dados de histórico de estágios disponíveis
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
