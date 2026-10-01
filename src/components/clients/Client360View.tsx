import { useState, useMemo } from 'react';
import { useClient360 } from '@/hooks/crm/useClient360';
import { toast } from 'sonner';
import {
  extractCategories,
  filterOrders,
  type SelectedOrder,
} from './Client360ViewHelpers';
import { Client360Skeleton } from './Client360Skeleton';
import { Client360KpiCards } from './Client360KpiCards';
import { LtvChart } from './LtvChart';
import { InsightBanner } from './InsightBanner';
import { ClientChurnJustificationCard } from './ClientChurnJustificationCard';
import { Client360Header } from './Client360Header';
import { Client360AffinityCard } from './Client360AffinityCard';
import { Client360HealthNbaSection } from './Client360HealthNbaSection';
import { Client360PredictiveCards } from './Client360PredictiveCards';
import { Client360OrdersCard } from './Client360OrdersCard';
import { OrderDetailsDialog } from './OrderDetailsDialog';

interface Client360ViewProps {
  clientName: string;
}

export function Client360View({ clientName }: Client360ViewProps) {
  const { data, isLoading } = useClient360(clientName);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [valueRange, setValueRange] = useState<[number, number]>([0, 100000]);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrder | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('timeline');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Gerando dossiê estratégico com IA...',
      success: 'Dossiê PDF gerado com sucesso!',
      error: 'Erro ao gerar dossiê.',
      finally: () => setIsExporting(false),
    });
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setValueRange([0, 100000]);
    setSearchTerm('');
  };

  const categories = useMemo(() => extractCategories(data?.orders), [data?.orders]);

  const filteredOrders = useMemo(
    () => filterOrders(data?.orders, { searchTerm, statusFilter, categoryFilter, valueRange }),
    [data?.orders, searchTerm, statusFilter, categoryFilter, valueRange]
  );

  if (isLoading) return <Client360Skeleton />;

  if (!data)
    return (
      <div className="p-12 text-center text-muted-foreground">
        Nenhum dado encontrado para este cliente.
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-6 selection:bg-primary selection:text-primary-foreground">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500 z-50 animate-pulse" />

      <Client360Header
        clientName={clientName}
        isVip={data.ltv > data.segmentAverageLtv * 1.5}
        isExporting={isExporting}
        onExport={handleExport}
      />

      {/* Smart Insight Banner */}
      <InsightBanner data={data} />

      {/* Justificativa do alerta de churn */}
      <ClientChurnJustificationCard clientName={clientName} />

      {/* KPIs Estratégicos com Comparativo de Segmento */}
      <Client360KpiCards data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução LTV */}
        <LtvChart data={data.spendingHistory} />

        {/* Mix de Categorias */}
        <Client360AffinityCard data={data} />
      </div>

      {/* Health Score & NBA (Next Best Action) Section */}
      <Client360HealthNbaSection data={data} />

      {/* Predictive & UI Refactoring Section (Etapas 8-10) */}
      <Client360PredictiveCards />

      {/* Histórico com Filtros e Deep-dive */}
      <Client360OrdersCard
        orders={filteredOrders}
        averageTicket={data.averageTicket}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onValueRangeChange={setValueRange}
        onClearFilters={handleClearFilters}
        onSelectOrder={setSelectedOrder}
      />

      {/* Deep-dive Modal Pedido */}
      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
