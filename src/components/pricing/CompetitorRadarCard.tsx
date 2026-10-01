import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fmtCurrency } from './pricing-ui';
import type { PricingIntelligenceResponse } from '@/hooks/usePricingIntelligence';

interface CompetitorRadarCardProps {
  threats: PricingIntelligenceResponse['competitor_threats'];
}

export function CompetitorRadarCard({ threats }: CompetitorRadarCardProps) {
  const items =
    threats && threats.length > 0
      ? threats
      : [
          {
            product_name: 'Advanced Analytics Suite',
            our_price: 12500,
            competitor_price: 9800,
            threat_level: 'high',
          },
          {
            product_name: 'CRM Integration Module',
            our_price: 4500,
            competitor_price: 3900,
            threat_level: 'medium',
          },
          {
            product_name: 'Priority Support SLA',
            our_price: 2200,
            competitor_price: 1800,
            threat_level: 'high',
          },
          {
            product_name: 'Security Hardening Kit',
            our_price: 8900,
            competitor_price: 7500,
            threat_level: 'medium',
          },
        ];

  return (
    <Card className="glass border-destructive/20 overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-destructive/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
            <div>
              <CardTitle className="text-section-title font-sora text-destructive">
                Radar de Concorrência
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Produtos sob ataque de preço
              </p>
            </div>
          </div>
          <Badge className="bg-destructive text-white border-none text-[10px] font-black uppercase">
            Crítico
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {items.map((threat, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-1.5 h-10 rounded-full',
                    threat.threat_level === 'high'
                      ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'bg-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  )}
                />
                <div>
                  <div className="font-bold text-sm group-hover:text-destructive transition-colors">
                    {threat.product_name}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                    Delta: -
                    {Math.round(
                      (1 - threat.competitor_price / threat.our_price) * 100
                    )}
                    % vs Concorrência
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-foreground">
                  {fmtCurrency(threat.our_price)}
                  <span className="text-[10px] text-muted-foreground mx-1">vs</span>
                  <span className="text-destructive">
                    {fmtCurrency(threat.competitor_price)}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-1 text-[9px] py-0 px-1.5 font-black uppercase',
                    threat.threat_level === 'high'
                      ? 'border-destructive/30 text-destructive bg-destructive/5'
                      : 'border-warning/30 text-warning bg-warning/5'
                  )}
                >
                  Risco {threat.threat_level === 'high' ? 'Crítico' : 'Médio'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
