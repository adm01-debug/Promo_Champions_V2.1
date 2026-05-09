import { Helmet } from "react-helmet-async";
import { Package, Search, Star, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProdutosLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useProducts, useDeleteProduct, Product } from "@/hooks/useProducts";
import { CreateProductDialog } from "@/components/products/CreateProductDialog";
import { EditProductDialog } from "@/components/products/EditProductDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { FilterPopover, SortOption } from "@/components/shared/FilterPopover";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmptyStateProducts } from "@/components/shared/EmptyStateProducts";
import { PageTransition } from "@/components/transitions/PageTransition";
const statusColors: Record<string, string> = {
  ativo: "bg-status-success/20 text-status-success border-status-success/30",
  pausado: "bg-warning/20 text-warning border-warning/30",
};

const sortOptions: SortOption[] = [
  { label: "Nome (A-Z)", value: "name_asc", direction: "asc" },
  { label: "Nome (Z-A)", value: "name_desc", direction: "desc" },
  { label: "Maior preço", value: "price_desc", direction: "desc" },
  { label: "Menor preço", value: "price_asc", direction: "asc" },
  { label: "Mais vendidos", value: "sales_desc", direction: "desc" },
  { label: "Melhor avaliação", value: "rating_desc", direction: "desc" },
];

const categoryOptions = [
  { label: "Assinatura", value: "Assinatura" },
  { label: "Serviço", value: "Serviço" },
  { label: "Consultoria", value: "Consultoria" },
];

const statusOptions = [
  { label: "Ativo", value: "ativo" },
  { label: "Pausado", value: "pausado" },
];

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("sales_desc");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  
  const { data: products = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  // Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!products || products.length === 0) return null;
    return new Fuse(products, {
      keys: ['name', 'category'],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    // Apply fuzzy search
    let filtered = searchTerm.trim() && fuse
      ? fuse.search(searchTerm).map(result => result.item)
      : [...products];
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "price_desc":
          return Number(b.price) - Number(a.price);
        case "price_asc":
          return Number(a.price) - Number(b.price);
        case "sales_desc":
          return b.sales_count - a.sales_count;
        case "rating_desc":
          return Number(b.rating) - Number(a.rating);
        default:
          return 0;
      }
    });
  }, [products, fuse, searchTerm, sortBy, categoryFilter, statusFilter]);

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
  } = usePagination(filteredAndSortedProducts, { initialItemsPerPage: 12 });

  const handleDelete = () => {
    if (!deletingProduct) return;
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => setDeletingProduct(null),
    });
  };

  return (
    <PageTransition>
    <>
    <Helmet>
      <title>Produtos | Promo Champions</title>
      <meta name="description" content="Catálogo e gestão de produtos" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<ProdutosLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl gradient-primary">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-page-title gradient-text">Produtos</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie seu catálogo de produtos
                  {isLoading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                </p>
              </div>
            </div>
            <CreateProductDialog />
          </div>

          {/* Filters */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "100ms" }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar produtos..." 
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
                    label: "Categoria",
                    options: categoryOptions,
                    value: categoryFilter,
                    onChange: setCategoryFilter,
                  },
                  {
                    label: "Status",
                    options: statusOptions,
                    value: statusFilter,
                    onChange: setStatusFilter,
                  },
                ]}
              />
            </div>
          </div>

          {/* Products Grid */}
          {filteredAndSortedProducts.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {paginatedItems.map((product, index) => (
                <div 
                  key={product.id}
                  className="opacity-0 animate-fade-in-up glass rounded-xl p-5 hover:bg-card/80 transition-all group relative"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon" aria-label="Editar"
                      className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon" aria-label="Excluir"
                      className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                      onClick={() => setDeletingProduct(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-start justify-between pr-16">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs bg-muted/50">
                          {product.category}
                        </Badge>
                        <Badge variant="outline" className={statusColors[product.status] || statusColors.ativo}>
                          {product.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground/60">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">{Number(product.rating).toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({product.sales_count} vendas)</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Estoque: {product.stock_quantity || 0}</span>
                      <span className="text-xl font-bold gradient-text">
                        R$ {Number(product.price).toLocaleString("pt-BR")}
                      </span>
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
          ) : searchTerm || categoryFilter || statusFilter ? (
            <div className="glass rounded-xl p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">Tente ajustar os filtros</p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter(''); setStatusFilter(''); }}>
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="glass rounded-xl">
              <EmptyStateProducts onAdd={() => document.querySelector<HTMLButtonElement>('[data-create-product]')?.click()} />
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <EditProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Excluir Produto"
        description={`Tem certeza que deseja excluir o produto "${deletingProduct?.name}"? Esta ação não pode ser desfeita.`}
        isDeleting={deleteProduct.isPending}
      />
    </SkeletonTransition>
  </>
    </PageTransition>
  );
};

export default Produtos;