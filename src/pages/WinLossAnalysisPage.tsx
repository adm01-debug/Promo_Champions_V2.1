import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { WinLossAnalysis } from '@/components/analytics/WinLossAnalysis';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Trophy, ShieldCheck, Filter, Download, LineChart, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWinLossAnalysis } from '@/hooks/useWinLossAnalysis';
import { exportToCSV, formatDateForExport } from '@/utils/csvExport';
import { getLocalISODate } from '@/utils/dateHelpers';
import { WIN_LOSS_OUTCOME } from '@/constants';

const OUTCOME_OPTIONS = [
  { value: 'all' as const, label: 'Todos' },
  { value: WIN_LOSS_OUTCOME.WON as 'won', label: 'Ganhos' },
  { value: WIN_LOSS_OUTCOME.LOST as 'lost', label: 'Perdas' },
];

export default function WinLossAnalysisPage() {
  const { data } = useWinLossAnalysis();
  const [outcome, setOutcome] = useState<'all' | 'won' | 'lost'>('all');
  const [salesperson, setSalesperson] = useState<string>('all');

  const salespeople = useMemo(() => data?.bySalesperson.map(s => s.name) ?? [], [data]);

  const filteredDetails = useMemo(
    () =>
      (data?.details ?? []).filter(
        d =>
          (outcome === 'all' || d.outcome === outcome) &&
          (salesperson === 'all' ||
            (d.salespeople?.name ?? 'Desconhecido') === salesperson)
      ),
    [data, outcome, salesperson]
  );

  const activeFilters = (outcome === 'all' ? 0 : 1) + (salesperson === 'all' ? 0 : 1);

  const clearFilters = () => {
    setOutcome('all');
    setSalesperson('all');
  };

  const handleExport = () => {
    if (filteredDetails.length === 0) {
      toast.message('Nada para exportar com os filtros atuais');
      return;
    }
    const rows = filteredDetails.map(d => ({
      Data: formatDateForExport(d.created_at),
      Vendedor: d.salespeople?.name ?? 'Desconhecido',
      Cliente: d.sales?.client_name ?? '',
      Produto: d.sales?.product_name ?? '',
      'Valor (R$)': d.sales?.amount ?? 0,
      Desfecho: d.outcome === WIN_LOSS_OUTCOME.WON ? 'Ganho' : 'Perdido',
      Motivo: d.reason ?? '',
      Observacoes: d.notes ?? '',
    }));
    exportToCSV(rows, `win_loss_${getLocalISODate()}`);
    toast.success(`${rows.length} negócio(s) exportado(s)`);
  };

  return (
    <>
      <Helmet>
        <title>Win/Loss Analysis | Promo Champions</title>
        <meta
          name="description"
          content="Análise profunda de vitórias e perdas com drill-down por vendedor e produto"
        />
      </Helmet>
      <PageTransition>
        <div className="space-y-6 p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2.5 rounded-xl bg-linear-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Win/Loss Analysis</h1>
                <p className="text-sm text-muted-foreground/80">
                  Inteligência competitiva baseada em desfechos de deals
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="glass gap-2 border-border/50"
                onClick={handleExport}
                disabled={!data || filteredDetails.length === 0}
              >
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass gap-2 border-border/50"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros Avançados
                    {activeFilters > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {activeFilters}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 space-y-3 p-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Resultado</p>
                    <div className="flex gap-1">
                      {OUTCOME_OPTIONS.map(o => (
                        <Button
                          key={o.value}
                          size="sm"
                          variant={outcome === o.value ? 'default' : 'ghost'}
                          className="h-7 flex-1 text-xs"
                          onClick={() => setOutcome(o.value)}
                        >
                          {o.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Vendedor</p>
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      <Button
                        size="sm"
                        variant={salesperson === 'all' ? 'default' : 'ghost'}
                        className="h-7 w-full justify-start text-xs"
                        onClick={() => setSalesperson('all')}
                      >
                        Todos
                      </Button>
                      {salespeople.map(name => (
                        <Button
                          key={name}
                          size="sm"
                          variant={salesperson === name ? 'default' : 'ghost'}
                          className="h-7 w-full justify-start text-xs"
                          onClick={() => setSalesperson(name)}
                        >
                          <span className="truncate">{name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-2">
                    <span className="text-xs text-muted-foreground">
                      {filteredDetails.length} de {data?.details.length ?? 0} negócios
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={clearFilters}
                      disabled={activeFilters === 0}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Limpar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <WinLossAnalysis details={filteredDetails} />
              </div>

              <div className="space-y-6">
                <Card className="glass border-border/40">
                  <CardHeader>
                    <CardTitle className="text-section-title text-sm flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Estratégia de Defesa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-semibold text-primary uppercase mb-1">
                        Destaque de Ganho
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A "Rapidez na Resposta" foi citada em 70% das vitórias deste mês.
                        Mantenha os SLAs agressivos.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-xs font-semibold text-destructive uppercase mb-1">
                        Vulnerabilidade
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        "Falta de Integração" é a principal razão de perda contra o Player
                        Y (30% dos casos).
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-section-title text-sm flex items-center gap-2 text-primary">
                      <LineChart className="h-4 w-4" />
                      Projeção de Melhoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Se reduzirmos as perdas por "Preço" em 10% via novos bundles, o Win
                      Rate geral subirá para{' '}
                      <span className="text-foreground font-semibold">68%</span>.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
