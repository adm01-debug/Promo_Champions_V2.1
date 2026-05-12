import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useABCAnalysis } from '@/hooks/useABCAnalysis';
import { Package, Users, Layers, Download, Filter, MousePointer2, Brain, MoveRight, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/utils/csvExport';
import { ABCChartTable } from './ABCChartTable';
import { ABCNeuralInsights } from './ABCNeuralInsights';
import { ABCMatrixShift } from './ABCMatrixShift';
import { ABCActionableAutomations } from './ABCActionableAutomations';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Maximize2 } from 'lucide-react';

const COLORS = {
  A: 'hsl(var(--status-success))',
  B: 'hsl(var(--status-warning))',
  C: 'hsl(var(--status-error))',
};

export function ABCAnalysis() {
  const { data, isLoading } = useABCAnalysis();
  const navigate = useNavigate();
  const location = useLocation();
  const isDedicatedPage = location.pathname === '/analytics/abc';

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted/50 rounded-lg w-1/3 animate-shimmer" />
            <div className="h-64 bg-muted/50 rounded-lg animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExport = (type: 'products' | 'clients') => {
    const items = type === 'products' ? data?.products : data?.clients;
    if (!items || items.length === 0) {
      toast.error('Nenhum dado disponível para exportação');
      return;
    }

    const exportData = items.map(item => ({
      Nome: item.name,
      Receita: item.revenue,
      Percentual: `${item.percentage.toFixed(2)}%`,
      Acumulado: `${item.cumulativePercentage.toFixed(2)}%`,
      Classe: item.classification
    }));

    exportToCSV(exportData, `analise_abc_${type}_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exportação de ${type === 'products' ? 'produtos' : 'clientes'} concluída`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 group/header">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover/header:scale-110 group-hover/header:shadow-primary/40">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-display font-semibold gradient-text flex items-center gap-2">
              Análise ABC Elite
              <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] font-bold">V10.0</Badge>
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Pareto Neural Insight Engine</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="glass gap-2 border-border/50 hover:bg-primary/10 transition-all duration-300">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass gap-2 border-border/50 hover:bg-primary/10 transition-all duration-300"
            onClick={() => handleExport('products')}
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>

          {!isDedicatedPage && (
            <Button 
              variant="outline" 
              size="sm" 
              className="glass gap-2 border-border/50 hover:bg-primary/10 transition-all duration-300"
              onClick={() => navigate('/analytics/abc')}
            >
              <Maximize2 className="h-4 w-4" />
              Ver Completo
            </Button>
          )}
        </div>
      </div>

      {/* Neural Insights Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-base font-display font-bold text-foreground">Pareto Neural Insights</h3>
        </div>
        <ABCNeuralInsights insights={data?.neuralInsights || []} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {(['A', 'B', 'C'] as const).map((cls, index) => (
              <SummaryCard key={`prod-${cls}`} cls={cls} icon={<Package className="h-3.5 w-3.5" style={{ color: COLORS[cls] }} />} label="Produtos" value={data?.summary.products[cls] || 0} delay={index * 50} />
            ))}
            {(['A', 'B', 'C'] as const).map((cls, index) => (
              <SummaryCard key={`client-${cls}`} cls={cls} icon={<Users className="h-3.5 w-3.5" style={{ color: COLORS[cls] }} />} label="Clientes" value={data?.summary.clients[cls] || 0} delay={(index + 3) * 50} />
            ))}
          </div>

          <Tabs defaultValue="products" className="space-y-4">
            <TabsList className="glass border border-border/50">
              <TabsTrigger value="products" className="gap-2 font-display transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <Package className="h-4 w-4" />Produtos
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2 font-display transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <Users className="h-4 w-4" />Clientes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="animate-fade-in">
              <ABCChartTable items={data?.products || []} chartTitle="Curva ABC - Produtos" tableTitle="Ranking de Produtos" chartIcon={null} tableIcon={<Package className="h-4 w-4 text-primary-foreground" />} emptyIcon={<Package className="h-10 w-10 opacity-50" />} />
            </TabsContent>

            <TabsContent value="clients" className="animate-fade-in">
              <ABCChartTable items={data?.clients || []} chartTitle="Curva ABC - Clientes" tableTitle="Ranking de Clientes" chartIcon={null} tableIcon={<Users className="h-4 w-4 text-primary-foreground" />} emptyIcon={<Users className="h-10 w-10 opacity-50" />} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ABCMatrixShift shifts={data?.matrixShifts || []} />
          
          <Card className="glass border-primary/20 bg-primary/5 overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20 animate-pulse">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold font-display">Optimization Ready</span>
                <span className="text-xs text-muted-foreground leading-tight">Elite engine detectou 3 novas oportunidades de automação.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ABCActionableAutomations automations={data?.automations || []} />
    </div>
  );
}

function SummaryCard({ cls, icon, label, value, delay }: { cls: 'A' | 'B' | 'C'; icon: React.ReactNode; label: string; value: number; delay: number }) {
  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated hover-lift cursor-pointer animate-fade-in group" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ backgroundColor: `${COLORS[cls]}20` }}>
            {icon}
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-display">{label}</span>
          <Badge variant="outline" className="ml-auto font-bold transition-transform group-hover:scale-105" style={{ borderColor: COLORS[cls], color: COLORS[cls], backgroundColor: `${COLORS[cls]}10` }}>
            {cls}
          </Badge>
        </div>
        <p className="text-2xl font-bold font-display transition-transform duration-300 group-hover:scale-105" style={{ color: COLORS[cls] }}>{value}</p>
      </CardContent>
    </Card>
  );
}
