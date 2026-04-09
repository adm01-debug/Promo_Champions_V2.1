import React from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { MapPin, Crown, Swords, Shield, Flag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TERRITORY_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(142 71% 45%)',
  'hsl(var(--destructive))',
  'hsl(45 93% 47%)',
  'hsl(280 65% 60%)',
  'hsl(200 80% 50%)',
  'hsl(340 75% 55%)',
];

function TerritoryWarsComponent() {
  const { data: salesData = [] } = useQuery({
    queryKey: ['territory-wars-sales'],
    queryFn: async () => {
      const { data } = await supabase
        .from('sales')
        .select('id, client_name, product_name, amount, status, salesperson_id, category')
        .eq('status', 'won');
      return data || [];
    },
  });

  const { data: salespeople = [] } = useQuery({
    queryKey: ['territory-wars-sp'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_active_salespeople');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const territories = useMemo(() => {
    const spMap = new Map(salespeople.map(sp => [sp.id, sp.name]));
    const territoryMap = new Map<string, { name: string; owners: Map<string, { name: string; revenue: number; deals: number }> }>();

    salesData.forEach(sale => {
      const territory = sale.product_name || sale.category || 'Outros';
      if (!territoryMap.has(territory)) {
        territoryMap.set(territory, { name: territory, owners: new Map() });
      }
      const t = territoryMap.get(territory)!;
      const spName = spMap.get(sale.salesperson_id || '') || 'N/A';
      const spId = sale.salesperson_id || 'unknown';
      if (!t.owners.has(spId)) {
        t.owners.set(spId, { name: spName, revenue: 0, deals: 0 });
      }
      const owner = t.owners.get(spId)!;
      owner.revenue += sale.amount || 0;
      owner.deals += 1;
    });

    return Array.from(territoryMap.entries()).map(([key, t]) => {
      const owners = Array.from(t.owners.values()).sort((a, b) => b.revenue - a.revenue);
      const currentOwner = owners[0];
      const challenger = owners[1];
      const isContested = challenger && challenger.revenue > currentOwner.revenue * 0.7;
      const totalRevenue = owners.reduce((sum, o) => sum + o.revenue, 0);

      return {
        id: key,
        name: t.name,
        currentOwner,
        challenger,
        isContested,
        totalRevenue,
        totalDeals: owners.reduce((sum, o) => sum + o.deals, 0),
        competitorCount: owners.length,
        owners,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [salesData, salespeople]);

  const topConquerors = useMemo(() => {
    const conquests: Record<string, { name: string; territories: number; revenue: number }> = {};
    territories.forEach(t => {
      if (t.currentOwner) {
        const key = t.currentOwner.name;
        if (!conquests[key]) conquests[key] = { name: key, territories: 0, revenue: 0 };
        conquests[key].territories += 1;
        conquests[key].revenue += t.currentOwner.revenue;
      }
    });
    return Object.values(conquests).sort((a, b) => b.territories - a.territories);
  }, [territories]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <Swords className="h-5 w-5 text-destructive" /> Guerra de Territórios
        </h2>
        <p className="text-sm text-muted-foreground">Conquiste segmentos vendendo mais que seus rivais</p>
      </div>

      {/* Conquerors Leaderboard */}
      {topConquerors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-rank-gold" /> Maiores Conquistadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {topConquerors.slice(0, 5).map((c, i) => (
                <motion.div key={c.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 text-center p-3 rounded-lg bg-muted/30 min-w-[120px]">
                  <div className="text-lg mb-1">{i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⚔️'}</div>
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-primary">{c.territories} territórios</div>
                  <div className="text-xs text-muted-foreground">R$ {(c.revenue / 1000).toFixed(1)}k</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Territory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {territories.map((territory, i) => (
          <motion.div key={territory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`transition-all ${territory.isContested ? 'border-destructive/50' : 'hover:border-primary/30'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: TERRITORY_COLORS[i % TERRITORY_COLORS.length] + '20' }}>
                      <MapPin className="h-4 w-4" style={{ color: TERRITORY_COLORS[i % TERRITORY_COLORS.length] }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm truncate max-w-[150px]">{territory.name}</div>
                      <div className="text-xs text-muted-foreground">{territory.totalDeals} deals · {territory.competitorCount} competidores</div>
                    </div>
                  </div>
                  {territory.isContested && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs animate-pulse">
                      <Swords className="h-3 w-3 mr-1" /> Disputado!
                    </Badge>
                  )}
                </div>

                {/* Current Owner */}
                {territory.currentOwner && (
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5 text-rank-gold" />
                        <span className="text-sm font-semibold">{territory.currentOwner.name}</span>
                      </div>
                      <span className="text-xs font-mono text-primary">R$ {(territory.currentOwner.revenue / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                )}

                {/* Challenger */}
                {territory.challenger && (
                  <div className="p-2 rounded-lg bg-destructive/5 border border-dashed border-destructive/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-xs">{territory.challenger.name}</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">R$ {(territory.challenger.revenue / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                )}

                {/* Revenue bar */}
                <div className="mt-3 flex items-center gap-2">
                  <Flag className="h-3 w-3 text-muted-foreground" />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    {territory.owners.slice(0, 3).map((owner, j) => (
                      <div key={j} className="h-full inline-block" style={{
                        width: `${(owner.revenue / territory.totalRevenue) * 100}%`,
                        backgroundColor: TERRITORY_COLORS[j % TERRITORY_COLORS.length],
                      }} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">R$ {(territory.totalRevenue / 1000).toFixed(1)}k</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {territories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg">Nenhum território ainda</h3>
            <p className="text-sm text-muted-foreground">Territórios são gerados automaticamente baseados nas vendas por produto/segmento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


export const TerritoryWars = React.memo(TerritoryWarsComponent);
