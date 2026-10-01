import { ShieldCheck, Zap, Copy, MessageSquare, CalendarPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Client360Data } from '@/hooks/crm/useClient360';

export function Client360HealthNbaSection({ data }: { data: Client360Data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden group">
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title flex items-center gap-2 text-sm uppercase font-black tracking-tighter">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Customer Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * (100 - data.churnRisk)) / 100}
                  className={cn(
                    'transition-all duration-1000',
                    data.churnRisk < 30
                      ? 'text-emerald-500'
                      : data.churnRisk < 60
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{100 - data.churnRisk}</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase">
                  Score Total
                </span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-muted-foreground">Risco de Churn:</span>
                <span
                  className={cn(
                    data.churnRisk < 30
                      ? 'text-emerald-500'
                      : data.churnRisk < 60
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  )}
                >
                  {data.churnRisk}%
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-muted-foreground">Recência (Últ. Compra):</span>
                <span>
                  {data.orders.length > 0
                    ? `${Math.floor((new Date().getTime() - new Date(data.orders[0].created_at).getTime()) / (1000 * 60 * 60 * 24))} dias`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-muted-foreground">Frequência Média:</span>
                <span>{data.purchaseFrequency.toFixed(1)} dias</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title flex items-center gap-2 text-sm uppercase font-black tracking-tighter text-primary">
            <Zap className="h-4 w-4 fill-primary" />
            IA Next Best Action (NBA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-xl font-black text-foreground uppercase tracking-tight">
                  {data.nba.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {data.nba.description}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/20 border border-white/5 relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data.nba.script);
                      toast.success('Script copiado para o clipboard!');
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
                <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-2">
                  Script Sugerido pela IA
                </span>
                <p className="text-xs italic text-foreground/80 leading-relaxed pr-6">
                  "{data.nba.script}"
                </p>
              </div>
            </div>

            <div className="w-full md:w-48 space-y-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">
                  Previsão Próxima Compra
                </span>
                <div className="text-lg font-black text-primary">
                  {data.predictedNextPurchaseDays !== null
                    ? `Em ~${data.predictedNextPurchaseDays} dias`
                    : 'Indefinido'}
                </div>
                <Badge
                  variant="outline"
                  className="text-[8px] font-bold mt-2 border-primary/20 text-primary"
                >
                  85% Confiança
                </Badge>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toast.success('Follow-up agendado com sucesso!')}
                  className="flex-1 py-3 px-2 rounded-xl bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-tighter hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Agendar
                </button>
                <button
                  onClick={() => toast.info('Abrindo canal de comunicação...')}
                  className="py-3 px-3 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
