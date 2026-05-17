import { Helmet } from "react-helmet-async";
import { ShoppingCart, Search, Plus } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { SaleHUDCard } from "@/components/sales/SaleHUDCard";

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
    
    // Improved Lost Deals Handling: Filtered list shows lost deals only if specifically requested
    if (!statusFilter || statusFilter !== "lost") {
      filtered = filtered.filter(s => s.status !== "lost" && s.status !== "qualified");
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                  <ShoppingCart className="h-7 w-7 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="font-display font-black text-3xl uppercase tracking-tighter italic">Vendas</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Database v2.4</span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                    {filteredAndSortedSales.length} DEALS ATIVOS
                  </p>
                </div>
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

          {/* HUD Table */}
          {filteredAndSortedSales.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {paginatedItems.map((sale, index) => (
                  <SaleHUDCard key={sale.fullId || sale.id} sale={sale} index={index} />
                ))}
              </div>
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
