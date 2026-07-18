import { FC, memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Package, Clock, Trophy, XCircle } from 'lucide-react';

interface SP {
  name: string;
  wins: number;
  losses: number;
  winRate: number;
}
interface Prod {
  name: string;
  wins: number;
  losses: number;
  winRate: number;
}
interface Detail {
  outcome: string;
  reason: string;
  created_at: string;
  sales?: { client_name?: string | null; amount?: number | null } | null;
  salespeople?: { name?: string } | null;
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const SalespersonList: FC<{ items: SP[] }> = memo(({ items }) => (
  <Card className="glass border-border/40 lg:col-span-1">
    <CardHeader className="pb-2">
      <CardTitle className="text-section-title text-sm flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        Ranking por Vendedor
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-border/30">
          {items.map((sp, i) => {
            const total = sp.wins + sp.losses || 1;
            return (
              <div key={i} className="p-4 hover:bg-primary/5 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{sp.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {sp.winRate}% WR
                  </Badge>
                </div>
                <div className="flex gap-1 items-center">
                  <div className="h-1.5 bg-success/40 rounded-full" style={{ width: `${(sp.wins / total) * 100}%` }} />
                  <div className="h-1.5 bg-destructive/40 rounded-full" style={{ width: `${(sp.losses / total) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{sp.wins} vitórias</span>
                  <span>{sp.losses} perdas</span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
));
SalespersonList.displayName = 'SalespersonList';

const ProductList: FC<{ items: Prod[] }> = memo(({ items }) => (
  <Card className="glass border-border/40 lg:col-span-1">
    <CardHeader className="pb-2">
      <CardTitle className="text-section-title text-sm flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        Performance por Produto
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-border/30">
          {items.map((p, i) => (
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
));
ProductList.displayName = 'ProductList';

const RecentList: FC<{ items: Detail[] }> = memo(({ items }) => {
  const rows = useMemo(() => items.slice(0, 20), [items]);
  return (
    <Card className="glass border-border/40 lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-section-title text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Histórico Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border/30">
            {rows.map((d, i) => (
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
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 italic">"{d.reason}"</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    {d.salespeople?.name || 'Vendedor'}
                  </Badge>
                  <span className="text-[9px] font-bold text-primary">
                    {d.sales?.amount ? currency.format(d.sales.amount) : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
RecentList.displayName = 'RecentList';

interface Props {
  bySalesperson: SP[];
  byProduct: Prod[];
  details: Detail[];
}

const WinLossDrillDownBase: FC<Props> = ({ bySalesperson, byProduct, details }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
    <SalespersonList items={bySalesperson} />
    <ProductList items={byProduct} />
    <RecentList items={details} />
  </div>
);

export const WinLossDrillDown = memo(WinLossDrillDownBase);
