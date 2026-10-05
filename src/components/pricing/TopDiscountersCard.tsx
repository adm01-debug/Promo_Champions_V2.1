import { TrendingDown, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fmtCurrency, fmtPct } from './pricing-ui';
import type { TopDiscounter } from '@/hooks/usePricingIntelligence';

export function TopDiscountersCard({ discounters }: { discounters: TopDiscounter[] }) {
  return (
    <Card className="glass border-white/5 shadow-2xl overflow-hidden group">
      <CardHeader className="border-b border-white/5 bg-white/5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-section-title font-sora font-black">
                Top Discounters
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Vendedores com maior erosão de margem acumulada
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-destructive/30 text-destructive bg-destructive/5 font-black text-[10px]"
          >
            ALERTA DE MARGEM
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {discounters.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground italic flex flex-col items-center gap-4">
            <ShieldCheck className="h-12 w-12 text-success opacity-20" />
            Sem erosão crítica detectada na equipe.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] pl-8 h-12">
                  Performance
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] h-12">
                  Avg Discount
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] pr-8 h-12">
                  Total Leakage
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounters.slice(0, 5).map((s, idx) => (
                <TableRow
                  key={s.salesperson_id}
                  className="border-white/5 hover:bg-white/[0.03] transition-all group/row"
                >
                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                        {idx + 1}
                      </div>
                      <span className="font-black text-sm tracking-tight">
                        {s.salesperson_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-5">
                    <Badge
                      className={cn(
                        'font-mono font-black text-[10px] px-3 py-1 border-none',
                        s.avg_discount_pct > 0.2
                          ? 'bg-destructive text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                          : 'bg-warning text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      )}
                    >
                      {fmtPct(s.avg_discount_pct)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-black text-destructive/80 pr-8 py-5 text-sm">
                    {fmtCurrency(s.revenue_lost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="p-4 bg-white/5 border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:text-primary hover:bg-transparent"
          >
            Ver Ranking Completo de Erosão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
