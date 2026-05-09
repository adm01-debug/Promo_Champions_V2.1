import { Helmet } from "react-helmet-async";
import { ShoppingCart, Search, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActivityLogForm } from "@/components/activities/ActivityLogForm";
import { Plus, History } from "lucide-react";
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

const SaleHUDCard = ({ sale, index }: { sale: any; index: number }) => {
  const [showLog, setShowLog] = useState(false);
  return (
    <div 
      className="group relative overflow-hidden bg-gradient-to-r from-card/80 to-card/40 border border-border/20 shadow-xl backdrop-blur-md rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:border-primary/30"
      style={{ animationDelay: `${200 + index * 30}ms` }}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-[300px]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary font-mono tracking-widest uppercase">#{sale.id}</span>
            <h3 className="font-display font-black text-lg uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
              {sale.cliente}
            </h3>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20 border border-white/5">
              <ShoppingCart className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Product / SKU</p>
              <p className="text-sm font-bold truncate">
                {sale.produto} <span className="text-[10px] font-mono text-muted-foreground ml-2 opacity-60">[{sale.sku || "NO-SKU"}]</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 min-w-[250px]">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Status</span>
            <Badge variant="outline" className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest", statusColors[sale.status] || statusColors.pending)}>
              {sale.statusLabel || sale.status}
            </Badge>
          </div>
          <div className="flex flex-col items-end min-w-[100px]">
            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Created At</span>
            <span className="text-sm font-bold text-muted-foreground">{sale.data}</span>
          </div>
        </div>

        <div className="flex items-center justify-end min-w-[180px] gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Gross Volume</span>
            <span className="text-2xl font-display font-black tracking-tighter text-primary">
              R$ {sale.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 group-hover:scale-110 transition-all"
            onClick={() => setShowLog(true)}
            title="Registrar Atividade"
          >
            <History className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>

      <Dialog open={showLog} onOpenChange={setShowLog}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Log Tactical Activity</DialogTitle>
          </DialogHeader>
          <ActivityLogForm 
            saleId={sale.fullId} 
            clientId={sale.client_id}
            onSuccess={() => setShowLog(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

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
                    {filteredAndSortedSales.length} DEALS ACTIVE
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
                  <div 
                    key={sale.fullId || sale.id}
                    className="group relative overflow-hidden bg-gradient-to-r from-card/80 to-card/40 border border-border/20 shadow-xl backdrop-blur-md rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:border-primary/30"
                    style={{ animationDelay: `${200 + index * 30}ms` }}
                  >
                    {/* Decoration */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Deal ID & Client */}
                      <div className="flex items-center gap-4 min-w-[300px]">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-primary font-mono tracking-widest uppercase">#{sale.id}</span>
                          <h3 className="font-display font-black text-lg uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
                            {sale.cliente}
                          </h3>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-accent/20 border border-white/5">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground/70" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Product / SKU</p>
                            <p className="text-sm font-bold truncate">
                              {sale.produto} <span className="text-[10px] font-mono text-muted-foreground ml-2 opacity-60">[{sale.sku || "NO-SKU"}]</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status & Date */}
                      <div className="flex items-center gap-8 min-w-[250px]">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Status</span>
                          <Badge variant="outline" className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest", statusColors[sale.status] || statusColors.pending)}>
                            {sale.statusLabel || sale.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col items-end min-w-[100px]">
                          <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Created At</span>
                          <span className="text-sm font-bold text-muted-foreground">{sale.data}</span>
                        </div>
                      </div>

                      {/* Value Display */}
                      <div className="flex items-center justify-end min-w-[180px]">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Gross Volume</span>
                          <span className="text-2xl font-display font-black tracking-tighter text-primary">
                            R$ {sale.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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