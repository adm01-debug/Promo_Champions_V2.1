import { Sparkles, Target } from 'lucide-react';
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
import { fmtCurrency, fmtPct } from './pricing-ui';
import type { ProductRecommendation } from '@/hooks/usePricingIntelligence';

export function ProductRecommenderCard({
  recommendations,
}: {
  recommendations: ProductRecommendation[];
}) {
  return (
    <Card className="glass border-white/5 shadow-2xl overflow-hidden group">
      <CardHeader className="border-b border-white/5 bg-white/5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-success/10 border border-success/20 text-success">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-section-title font-sora font-black">
                IA Price Recommender
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Oportunidades neurais de uplift e expansão de margem
              </p>
            </div>
          </div>
          <Badge className="bg-success text-white border-none font-black text-[10px] px-3 py-1 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse">
            UPSELL OPORTUNIDADES
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recommendations.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground italic flex flex-col items-center gap-4">
            <Target className="h-12 w-12 text-primary opacity-20" />A IA está
            recalibrando modelos de elasticidade.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] pl-8 h-12">
                  Ativos Estratégicos
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] h-12">
                  Target Price
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] pr-8 h-12">
                  Uplift IA
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.slice(0, 5).map(p => (
                <TableRow
                  key={p.product_name}
                  className="border-white/5 hover:bg-white/[0.03] transition-all group/row"
                >
                  <TableCell className="pl-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-sm tracking-tight group-hover/row:text-primary transition-colors">
                        {p.product_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        {p.deals_count} deals analisados
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-5 font-mono font-black text-sm text-foreground/90">
                    {fmtCurrency(p.recommended_price)}
                  </TableCell>
                  <TableCell className="text-right pr-8 py-5">
                    <div className="flex flex-col items-end">
                      <Badge className="bg-success text-white border-none font-black text-[10px] px-2 py-0.5 rounded-sm">
                        +{fmtPct(p.uplift_pct)}
                      </Badge>
                      <span className="text-[9px] text-success/70 font-bold mt-1 uppercase tracking-tighter">
                        Baixa Elasticidade
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="p-4 bg-white/5 border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:text-success hover:bg-transparent"
          >
            Exportar Sugestões de Tabela de Preço
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
