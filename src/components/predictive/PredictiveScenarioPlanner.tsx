import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, TrendingUp, Calendar, Sparkles, Info } from 'lucide-react';
import {
  SCENARIO_BASELINE_DAYS,
  useScenarioBaseline,
} from '@/hooks/forecast/useScenarioBaseline';
import { formatBRL } from '@/lib/money';

export const PredictiveScenarioPlanner = () => {
  const [hiring, setHiring] = useState([2]);
  const [conversionBoost, setConversionBoost] = useState([5]);
  const [churnReduction, setChurnReduction] = useState([2]);

  const { data: baseline, isLoading, isError } = useScenarioBaseline();

  // Base = receita ganha real dos últimos 90 dias; produtividade = receita
  // ganha média por vendedor que fechou venda no mesmo período.
  const baseRevenue = baseline?.wonRevenue ?? 0;
  const repProductivity = baseline?.revenuePerSeller ?? 0;
  const hiringImpact = hiring[0] * repProductivity;
  const conversionImpact = baseRevenue * (conversionBoost[0] / 100);
  const churnImpact = baseRevenue * (churnReduction[0] / 100);

  const projectedRevenue = baseRevenue + hiringImpact + conversionImpact + churnImpact;
  const projectedWinRate =
    baseline?.winRate != null
      ? Math.min(100, baseline.winRate * (1 + conversionBoost[0] / 100))
      : null;
  const hasBaseline = !!baseline && baseline.wonCount > 0;

  return (
    <Card className="glass border-primary/20 shadow-2xl overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Sparkles className="size-12 text-primary/10 rotate-12" />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          <CardTitle className="text-section-title">Simulador de Cenários</CardTitle>
        </div>
        <CardDescription>
          Preveja o impacto de mudanças táticas no seu faturamento trimestral
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {isLoading ? (
          <Skeleton className="h-64 w-full" data-testid="scenario-planner-loading" />
        ) : isError ? (
          <p className="text-sm text-destructive" role="alert">
            Não foi possível carregar a receita ganha dos últimos {SCENARIO_BASELINE_DAYS}{' '}
            dias. Tente novamente mais tarde.
          </p>
        ) : !hasBaseline ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma venda ganha nos últimos {SCENARIO_BASELINE_DAYS} dias — sem base real
            para simular cenários.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2">
                      Novos Vendedores (Contratação)
                      <Info className="size-3 text-muted-foreground" />
                    </label>
                    <Badge variant="secondary" className="text-lg">
                      +{hiring[0]}
                    </Badge>
                  </div>
                  <Slider
                    value={hiring}
                    onValueChange={setHiring}
                    max={10}
                    step={1}
                    className="py-2"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2">
                      Melhoria na Conversão (AI Playbooks)
                      <Info className="size-3 text-muted-foreground" />
                    </label>
                    <Badge variant="secondary" className="text-lg">
                      +{conversionBoost[0]}%
                    </Badge>
                  </div>
                  <Slider
                    value={conversionBoost}
                    onValueChange={setConversionBoost}
                    max={20}
                    step={1}
                    className="py-2"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2">
                      Redução de Churn (CS Intelligence)
                      <Info className="size-3 text-muted-foreground" />
                    </label>
                    <Badge variant="secondary" className="text-lg">
                      -{churnReduction[0]}%
                    </Badge>
                  </div>
                  <Slider
                    value={churnReduction}
                    onValueChange={setChurnReduction}
                    max={10}
                    step={0.5}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col justify-center items-center text-center space-y-4">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Receita Trimestral Projetada
                </p>
                <div className="text-5xl font-black text-primary tracking-tighter">
                  {formatBRL(projectedRevenue)}
                </div>
                <div className="flex items-center gap-2 text-success font-bold">
                  <TrendingUp className="size-4" />+
                  {formatBRL(hiringImpact + conversionImpact + churnImpact)} de incremento
                </div>
                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  <div className="bg-background/50 p-3 rounded-xl border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Novo Win-Rate
                    </p>
                    <p className="text-lg font-bold">
                      {projectedWinRate != null ? `${projectedWinRate.toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="bg-background/50 p-3 rounded-xl border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Capacidade
                    </p>
                    <p className="text-lg font-bold">
                      {baseline.sellersWithWins + hiring[0]} Reps
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs text-muted-foreground italic">
              <Calendar className="size-4 text-primary shrink-0" />
              Base real: {formatBRL(baseRevenue)} em {baseline.wonCount} vendas ganhas nos
              últimos {SCENARIO_BASELINE_DAYS} dias ({baseline.sellersWithWins} vendedores
              com venda). Os ajustes acima são hipóteses aplicadas linearmente sobre essa
              base.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
