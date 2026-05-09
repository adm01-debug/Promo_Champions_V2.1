import { Helmet } from "react-helmet-async";
import { ShoppingCart, Search, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VendasLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { useState, useMemo } from "react";
import { SavedFiltersBar } from "@/components/filters/SavedFiltersBar";
import Fuse from "fuse.js";
import { useSalesData } from "@/hooks/useSalesData";
import { CreateSaleDialog } from "@/components/sales/CreateSaleDialog";
import { FilterPopover, SortOption } from "@/components/shared/FilterPopover";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";
const statusColors: Record<string, string> = {
  completed: "bg-status-success/20 text-status-success border-status-success/30",
  pending: "bg-warning/20 text-warning border-warning/30",
  lost: "bg-destructive/20 text-destructive border-destructive/30",
  qualified: "bg-primary/20 text-primary border-primary/30",
  proposal: "bg-secondary/20 text-secondary border-secondary/30",
  negotiation: "bg-accent/20 text-accent border-accent/30",
};

const sortOptions: SortOption[] = [
  { label: "Mais recente", value: "date_desc", direction: "desc" },
  { label: "Mais antigo", value: "date_asc", direction: "asc" },
  { label: "Maior valor", value: "value_desc", direction: "desc" },
  { label: "Menor valor", value: "value_asc", direction: "asc" },
  { label: "Cliente (A-Z)", value: "client_asc", direction: "asc" },
];

const statusOptions = [
  { label: "Pendente", value: "pending" },
  { label: "Qualificada", value: "qualified" },
  { label: "Proposta", value: "proposal" },
  { label: "Negociação", value: "negotiation" },
  { label: "Concluída", value: "completed" },
  { label: "Perdida", value: "lost" },
];

const Vendas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [statusFilter, setStatusFilter] = useState("");
  const { data: sales, isLoading } = useSalesData("");

  // Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!sales) return null;
    return new Fuse(sales, {
      keys: ['cliente', 'produto', 'id'],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [sales]);

  const filteredAndSortedSales = useMemo(() => {
    if (!sales) return [];
    
    // Apply fuzzy search
    let filtered = searchTerm.trim() && fuse
      ? fuse.search(searchTerm).map(result => result.item)
      : [...sales];
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.data.split("/").reverse().join("-")).getTime() - 
                 new Date(a.data.split("/").reverse().join("-")).getTime();
        case "date_asc":
          return new Date(a.data.split("/").reverse().join("-")).getTime() - 
                 new Date(b.data.split("/").reverse().join("-")).getTime();
        case "value_desc":
          return b.valor - a.valor;
        case "value_asc":
          return a.valor - b.valor;
        case "client_asc":
          return a.cliente.localeCompare(b.cliente);
        default:
          return 0;
      }
    });
  }, [sales, fuse, searchTerm, sortBy, statusFilter]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    startIndex,
    endIndex,
    totalItems,
    itemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions,
  } = usePagination(filteredAndSortedSales, { initialItemsPerPage: 10 });

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
          <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl gradient-primary">
                <ShoppingCart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Vendas</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie todas as vendas
                  {isLoading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                </p>
              </div>
            </div>
            <CreateSaleDialog />
          </div>

          {/* Filters */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "100ms" }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar vendas..." 
                  className="pl-10 bg-muted/50 border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <FilterPopover
                sortOptions={sortOptions}
                currentSort={sortBy}
                onSortChange={setSortBy}
                filterOptions={[
                  {
                    label: "Status",
                    options: statusOptions,
                    value: statusFilter,
                    onChange: setStatusFilter,
                  },
                ]}
              />
            </div>
            <SavedFiltersBar
              entityType="vendas"
              currentFilters={{ searchTerm, sortBy, statusFilter }}
              onApplyFilter={(filters) => {
                if (filters.searchTerm !== undefined) setSearchTerm(filters.searchTerm as string);
                if (filters.sortBy !== undefined) setSortBy(filters.sortBy as string);
                if (filters.statusFilter !== undefined) setStatusFilter(filters.statusFilter as string);
              }}
            />
          </div>

          {/* Table */}
          {filteredAndSortedSales.length > 0 ? (
            <div className="opacity-0 animate-fade-in-up glass rounded-xl overflow-hidden" style={{ animationDelay: "200ms" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Produto</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Valor</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((sale, index) => (
                      <tr 
                        key={sale.id} 
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                        style={{ animationDelay: `${300 + index * 50}ms` }}
                      >
                        <td className="p-4 text-sm font-mono text-primary">{sale.id}</td>
                        <td className="p-4 text-sm">{sale.cliente}</td>
                        <td className="p-4 text-sm text-muted-foreground">{sale.produto}</td>
                        <td className="p-4 text-sm font-semibold">R$ {sale.valor.toLocaleString("pt-BR")}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={statusColors[sale.status] || statusColors.pending}>
                            {statusOptions.find(o => o.value === sale.status)?.label || sale.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{sale.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-4">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  itemsPerPageOptions={itemsPerPageOptions}
                />
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter 
                  ? "Tente ajustar os filtros" 
                  : "Adicione sua primeira venda para começar"}
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