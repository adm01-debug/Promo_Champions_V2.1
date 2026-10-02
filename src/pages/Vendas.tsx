import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Search } from 'lucide-react';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Input } from '@/components/ui/input';
import { VendasLoadingSkeleton } from '@/components/skeletons/PageLoadingSkeleton';
import { SkeletonTransition } from '@/components/skeletons/SkeletonTransition';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SavedFiltersBar } from '@/components/filters/SavedFiltersBar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSalesPage, useSalesMarkupSummary } from '@/hooks/sales/useSalesData';
import type { SalesSortKey } from '@/services/salesService';
import { CreateSaleDialog } from '@/components/sales/CreateSaleDialog';
import { FilterPopover, SortOption } from '@/components/shared/FilterPopover';
import { TablePagination } from '@/components/shared/TablePagination';
import { SaleHUDCard } from '@/components/sales/SaleHUDCard';
import {
  formatMarkupPct,
  MARKUP_TIER_LABELS,
  type MarkupTier,
} from '@/lib/markupHelpers';

const sortOptions: SortOption[] = [
  { label: 'Mais recente', value: 'date_desc', direction: 'desc' },
  { label: 'Mais antigo', value: 'date_asc', direction: 'asc' },
  { label: 'Maior valor', value: 'value_desc', direction: 'desc' },
  { label: 'Menor valor', value: 'value_asc', direction: 'asc' },
  { label: 'Cliente (A-Z)', value: 'client_asc', direction: 'asc' },
  { label: 'Maior markup %', value: 'markup_desc', direction: 'desc' },
  { label: 'Menor markup %', value: 'markup_asc', direction: 'asc' },
];

const statusOptions = [
  { label: 'Pendente', value: 'pending' },
  { label: 'Qualificada', value: 'qualified' },
  { label: 'Proposta', value: 'proposal' },
  { label: 'Negociação', value: 'negotiation' },
  { label: 'Concluída', value: 'completed' },
  { label: 'Perdida', value: 'lost' },
];

const markupTierOptions: { label: string; value: MarkupTier }[] = [
  { label: MARKUP_TIER_LABELS.excellent, value: 'excellent' },
  { label: MARKUP_TIER_LABELS.healthy, value: 'healthy' },
  { label: MARKUP_TIER_LABELS.critical, value: 'critical' },
  { label: MARKUP_TIER_LABELS.unknown, value: 'unknown' },
];

const VALID_TIERS: ReadonlyArray<string> = [
  'excellent',
  'healthy',
  'critical',
  'unknown',
];

const EMPTY_SUMMARY = {
  average: null,
  median: null,
  counts: { excellent: 0, healthy: 0, critical: 0, unknown: 0 },
  total: 0,
  withCost: 0,
} as const;

const Vendas = () => {
  const [searchParams] = useSearchParams();
  const initialMarkup = searchParams.get('markup') ?? '';
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SalesSortKey>('date_desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [markupFilter, setMarkupFilter] = useState<MarkupTier | ''>(
    VALID_TIERS.includes(initialMarkup) ? (initialMarkup as MarkupTier) : ''
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const listFilters = {
    searchTerm: debouncedSearchTerm,
    status: statusFilter,
    markupTier: markupFilter,
  };

  const { data: salesPage, isLoading } = useSalesPage({
    ...listFilters,
    sortBy,
    page: currentPage,
    pageSize: itemsPerPage,
  });
  const { data: markupSummaryData } = useSalesMarkupSummary(listFilters);

  const filteredAndSortedSales = salesPage?.rows ?? [];
  const totalItems = salesPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Volta para a página 1 quando qualquer filtro muda o conjunto
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, markupFilter, sortBy, itemsPerPage]);

  const markupSummary = markupSummaryData ?? EMPTY_SUMMARY;

  return (
    <>
      <Helmet>
        <title>Vendas | Promo Champions</title>
        <meta name="description" content="Registro e acompanhamento de vendas" />
      </Helmet>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<VendasLoadingSkeleton />}
        duration={400}
      >
        <PageTransition>
          <div className="min-h-screen bg-background p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                      <ShoppingCart className="h-7 w-7 text-primary animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                  </div>
                  <div>
                    <h1 className="text-page-title uppercase italic">Vendas</h1>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                        Database v2.4
                      </span>
                      <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        {totalItems} DEALS ATIVOS
                      </p>
                    </div>
                  </div>
                </div>
                <CreateSaleDialog />
              </div>

              {/* Filters */}
              <div
                className="opacity-0 animate-fade-in-up glass rounded-xl p-4"
                style={{ animationDelay: '100ms' }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar vendas..."
                      className="pl-10 bg-muted/50 border-border/50"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <FilterPopover
                    sortOptions={sortOptions}
                    currentSort={sortBy}
                    onSortChange={v => setSortBy(v as SalesSortKey)}
                    filterOptions={[
                      {
                        label: 'Status',
                        options: statusOptions,
                        value: statusFilter,
                        onChange: setStatusFilter,
                      },
                      {
                        label: 'Rentabilidade',
                        options: markupTierOptions,
                        value: markupFilter,
                        onChange: v => setMarkupFilter(v as MarkupTier | ''),
                      },
                    ]}
                  />
                </div>
                <SavedFiltersBar
                  entityType="vendas"
                  currentFilters={{ searchTerm, sortBy, statusFilter, markupFilter }}
                  onApplyFilter={filters => {
                    if (filters.searchTerm !== undefined)
                      setSearchTerm(filters.searchTerm as string);
                    if (filters.sortBy !== undefined)
                      setSortBy(filters.sortBy as SalesSortKey);
                    if (filters.statusFilter !== undefined)
                      setStatusFilter(filters.statusFilter as string);
                    if (filters.markupFilter !== undefined)
                      setMarkupFilter(filters.markupFilter as MarkupTier | '');
                  }}
                />

                {/* Resumo de rentabilidade da seleção atual */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/10 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Markup médio
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {formatMarkupPct(markupSummary.average)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    (mediana {formatMarkupPct(markupSummary.median)} ·{' '}
                    {markupSummary.withCost}/{markupSummary.total} com custo)
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                    {markupTierOptions.map(tier => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() =>
                          setMarkupFilter(markupFilter === tier.value ? '' : tier.value)
                        }
                        aria-pressed={markupFilter === tier.value}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          markupFilter === tier.value
                            ? 'bg-primary/15 border-primary/40 text-primary'
                            : 'bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70'
                        }`}
                      >
                        {tier.label.split(' (')[0]} · {markupSummary.counts[tier.value]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* HUD Table */}
              {filteredAndSortedSales.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredAndSortedSales.map((sale, index) => (
                      <SaleHUDCard
                        key={sale.fullId || sale.id}
                        sale={sale}
                        index={index}
                      />
                    ))}
                  </div>
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    itemsPerPageOptions={[10, 20, 50]}
                  />
                </div>
              ) : (
                <div className="glass rounded-xl p-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-section-title mb-2">Nenhuma venda encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter
                      ? 'Tente ajustar os filtros'
                      : 'Adicione sua primeira venda para começar'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </PageTransition>
      </SkeletonTransition>
    </>
  );
};

export default Vendas;
