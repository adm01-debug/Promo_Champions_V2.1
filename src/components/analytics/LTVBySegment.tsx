import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

interface SegmentLTV {
  segment: string;
  avgLTV: number;
  clientCount: number;
  totalRevenue: number;
  avgPurchases: number;
}

const SEGMENT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const LTVBySegment: FC<{ currentClientLTV?: number; currentClientAvgTicket?: number }> = ({ currentClientLTV = 4500, currentClientAvgTicket = 1200 }) => {
  const { data, isLoading } = useQuery<SegmentLTV[]>({
    queryKey: ['ltv-by-segment'],
    queryFn: async () => {
      // Fetch all completed sales with client names
      const { data: sales, error } = await supabase
        .from('sales')
        .select('client_name, amount, status, product_name, created_at')
        .eq('status', 'completed');

      if (error) throw error;

      // Fetch client data for segmentation
      const { data: clients } = await supabase
        .from('clients')
        .select('name, company, total_value, created_at');

      const clientMap = new Map(clients?.map(c => [c.name, c]) || []);

      // Group sales by client
      const clientSales = new Map<string, { total: number; count: number; company: string | null }>();
      
      (sales || []).forEach(sale => {
        const existing = clientSales.get(sale.client_name) || { total: 0, count: 0, company: null };
        existing.total += Number(sale.amount || 0);
        existing.count += 1;
        const client = clientMap.get(sale.client_name);
        if (client?.company) existing.company = client.company;
        clientSales.set(sale.client_name, existing);
      });

      // Segment clients by LTV tier
      const allLTVs = [...clientSales.values()].map(v => v.total);
      const maxLTV = Math.max(...allLTVs, 1);
      const thresholdHigh = maxLTV * 0.6;
      const thresholdMed = maxLTV * 0.25;

      const segments: Record<string, { totalRev: number; count: number; purchases: number }> = {
        'Premium (Top 20%)': { totalRev: 0, count: 0, purchases: 0 },
        'Regular': { totalRev: 0, count: 0, purchases: 0 },
        'Básico': { totalRev: 0, count: 0, purchases: 0 },
        'Recorrente (3+ compras)': { totalRev: 0, count: 0, purchases: 0 },
        'Único (1 compra)': { totalRev: 0, count: 0, purchases: 0 },
      };

      clientSales.forEach((data) => {
        // By value tier
        if (data.total >= thresholdHigh) {
          segments['Premium (Top 20%)'].totalRev += data.total;
          segments['Premium (Top 20%)'].count += 1;
          segments['Premium (Top 20%)'].purchases += data.count;
        } else if (data.total >= thresholdMed) {
          segments['Regular'].totalRev += data.total;
          segments['Regular'].count += 1;
          segments['Regular'].purchases += data.count;
        } else {
          segments['Básico'].totalRev += data.total;
          segments['Básico'].count += 1;
          segments['Básico'].purchases += data.count;
        }

        // By frequency
        if (data.count >= 3) {
          segments['Recorrente (3+ compras)'].totalRev += data.total;
          segments['Recorrente (3+ compras)'].count += 1;
          segments['Recorrente (3+ compras)'].purchases += data.count;
        } else if (data.count === 1) {
          segments['Único (1 compra)'].totalRev += data.total;
          segments['Único (1 compra)'].count += 1;
          segments['Único (1 compra)'].purchases += data.count;
        }
      });

      return Object.entries(segments)
        .filter(([, v]) => v.count > 0)
        .map(([segment, v]) => ({
          segment,
          avgLTV: Math.round(v.totalRev / v.count),
          clientCount: v.count,
          totalRevenue: v.totalRev,
          avgPurchases: Math.round((v.purchases / v.count) * 10) / 10,
        }))
        .sort((a, b) => b.avgLTV - a.avgLTV);
    },
    staleTime: 1000 * 60 * 10,
  });

  const totalRevenue = data?.reduce((sum, s) => sum + s.totalRevenue, 0) || 0;
  const avgSegmentLTV = data ? data.reduce((sum, s) => sum + s.avgLTV, 0) / data.length : 0;

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-section-title flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          LTV por Segmento de Cliente
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Lifetime Value médio e distribuição de receita por segmento
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-48 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        ) : !data?.length ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Dados insuficientes para análise de LTV
          </div>
        ) : (
          <div className="space-y-6">
            {/* Benchmark Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">LTV vs Média</span>
                  <Badge variant={currentClientLTV >= avgSegmentLTV ? "success" : "destructive"} className="h-4 text-[9px]">
                    {currentClientLTV >= avgSegmentLTV ? "+" : ""}{(((currentClientLTV / avgSegmentLTV) - 1) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-xl font-black">R$ {currentClientLTV.toLocaleString('pt-BR')}</div>
                <div className="text-[9px] text-muted-foreground">Média do Segmento: R$ {avgSegmentLTV.toLocaleString('pt-BR')}</div>
              </div>
              
              <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Ticket Médio</span>
                  <Badge variant="outline" className="h-4 text-[9px] border-primary/20 text-primary">BENCHMARK</Badge>
                </div>
                <div className="text-xl font-black">R$ {currentClientAvgTicket.toLocaleString('pt-BR')}</div>
                <div className="text-[9px] text-muted-foreground">Potencial: +R$ 450,00</div>
              </div>
            </div>

            {/* Chart */}
            <div className="pt-4">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Distribuição de LTV por Segmento</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    fontSize={10}
                    stroke="hsl(var(--muted-foreground))"
                    hide
                  />
                  <YAxis
                    dataKey="segment"
                    type="category"
                    width={130}
                    fontSize={10}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'LTV Médio']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="avgLTV" radius={[0, 4, 4, 0]} barSize={12}>
                    {data.map((_, idx) => (
                      <Cell key={idx} fill={SEGMENT_COLORS[idx % SEGMENT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Segment cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.map((seg, _idx) => (
                <div key={seg.segment} className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">{seg.segment}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      <Users className="h-3 w-3 mr-1" />
                      {seg.clientCount}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold">
                      R$ {seg.avgLTV.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] text-muted-foreground">LTV médio</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {seg.avgPurchases} compras/cliente
                    </span>
                    <span>
                      {totalRevenue > 0 ? Math.round((seg.totalRevenue / totalRevenue) * 100) : 0}% receita
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
