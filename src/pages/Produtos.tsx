import { Package, Filter, Search, Star, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProdutosLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { useState } from "react";
import { useProducts, useDeleteProduct, Product } from "@/hooks/useProducts";
import { CreateProductDialog } from "@/components/products/CreateProductDialog";
import { EditProductDialog } from "@/components/products/EditProductDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

const statusColors: Record<string, string> = {
  ativo: "bg-status-success/20 text-status-success border-status-success/30",
  pausado: "bg-warning/20 text-warning border-warning/30",
};

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  
  const { data: products, isLoading } = useProducts(searchTerm);
  const deleteProduct = useDeleteProduct();

  const handleDelete = () => {
    if (!deletingProduct) return;
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => setDeletingProduct(null),
    });
  };

  return (
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
                <h1 className="text-2xl font-bold gradient-text">Produtos</h1>
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
              <Button variant="outline" className="glass">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  className="opacity-0 animate-fade-in-up glass rounded-xl p-5 hover:bg-card/80 transition-all group relative"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
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
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">{Number(product.rating).toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({product.sales_count} vendas)</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Preço</span>
                      <span className="text-xl font-bold gradient-text">
                        R$ {Number(product.price).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente uma busca diferente" : "Adicione seu primeiro produto para começar"}
              </p>
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
  );
};

export default Produtos;
