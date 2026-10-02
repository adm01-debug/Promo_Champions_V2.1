import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MarginAlertsCard() {
  return (
    <Card className="glass border-warning/20 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldCheck className="h-24 w-24 text-warning" />
      </div>
      <CardHeader className="bg-warning/10 border-b border-warning/10 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20 border border-warning/30">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <CardTitle className="text-section-title font-black font-sora">
                Price Guard: Alertas de Margem
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Detecção de erosão de receita em tempo real
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-warning/20 text-warning border-warning/40 font-black text-[10px] px-3 py-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            3 INCIDENTES CRÍTICOS
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <div className="divide-y divide-white/5">
          {[
            {
              client: 'Tech Solutions Inc',
              deal: 'Enterprise License v2.0',
              margin: 12.5,
              status: 'Critical',
              trend: 'down',
              impact: 'R$ 45.200',
            },
            {
              client: 'Global Retail Ltd',
              deal: 'Consulting Premium Package',
              margin: 14.2,
              status: 'Warning',
              trend: 'down',
              impact: 'R$ 12.800',
            },
            {
              client: 'Alpha Systems',
              deal: 'Core Support Tier 3',
              margin: 11.8,
              status: 'Critical',
              trend: 'stable',
              impact: 'R$ 28.500',
            },
          ].map((alert, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/5 transition-all group gap-4"
            >
              <div className="flex items-center gap-5">
                <div
                  className={cn(
                    'w-1.5 h-12 rounded-full',
                    alert.status === 'Critical'
                      ? 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse'
                      : 'bg-warning shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                  )}
                />
                <div>
                  <div className="text-lg font-black group-hover:text-primary transition-colors flex items-center gap-2">
                    {alert.client}
                    {alert.status === 'Critical' && (
                      <Badge className="bg-destructive/20 text-destructive border-none h-4 text-[8px] font-black uppercase">
                        Forte Vazamento
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {alert.deal}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-10">
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">
                    Impacto Estimado
                  </div>
                  <div className="text-sm font-black text-destructive/80 font-mono">
                    {alert.impact}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      'text-2xl font-black font-mono tracking-tighter',
                      alert.status === 'Critical' ? 'text-destructive' : 'text-warning'
                    )}
                  >
                    {alert.margin}%
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                    Margem Real
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-6 text-[10px] font-black tracking-widest border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg"
                >
                  REVISAR DEAL
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
