import { ShoppingCart, Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VendasLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { useState } from "react";
import { useSalesData } from "@/hooks/useSalesData";
import { CreateSaleDialog } from "@/components/sales/CreateSaleDialog";

const statusColors: Record<string, string> = {
  concluída: "bg-status-success/20 text-status-success border-status-success/30",
  pendente: "bg-warning/20 text-warning border-warning/30",
  cancelada: "bg-destructive/20 text-destructive border-destructive/30",
  qualificada: "bg-primary/20 text-primary border-primary/30",
  proposta: "bg-secondary/20 text-secondary border-secondary/30",
  negociação: "bg-accent/20 text-accent border-accent/30",
};

const Vendas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: sales, isLoading } = useSalesData(searchTerm);

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<VendasLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl gradient-primary">
                <ShoppingCart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Vendas</h1>
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
              <Button variant="outline" className="glass">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Table */}
          {sales && sales.length > 0 ? (
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
                    {sales.map((sale, index) => (
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
                          <Badge variant="outline" className={statusColors[sale.status] || statusColors.pendente}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{sale.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente uma busca diferente" : "Adicione sua primeira venda para começar"}
              </p>
            </div>
          )}
        </div>
      </div>
    </SkeletonTransition>
  );
};

export default Vendas;
