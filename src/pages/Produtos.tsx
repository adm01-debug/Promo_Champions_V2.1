import { Package, Plus, Filter, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProdutosLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { useState, useEffect } from "react";

const produtosData = [
  { id: 1, nome: "Plano Básico", categoria: "Assinatura", preco: 499, vendas: 156, rating: 4.2, status: "ativo" },
  { id: 2, nome: "Plano Premium", categoria: "Assinatura", preco: 1299, vendas: 89, rating: 4.8, status: "ativo" },
  { id: 3, nome: "Plano Enterprise", categoria: "Assinatura", preco: 2999, vendas: 34, rating: 4.9, status: "ativo" },
  { id: 4, nome: "Consultoria Básica", categoria: "Serviço", preco: 2500, vendas: 23, rating: 4.5, status: "ativo" },
  { id: 5, nome: "Treinamento Equipe", categoria: "Serviço", preco: 5000, vendas: 12, rating: 4.7, status: "pausado" },
  { id: 6, nome: "Implementação Custom", categoria: "Projeto", preco: 15000, vendas: 8, rating: 5.0, status: "ativo" },
];

const statusColors: Record<string, string> = {
  ativo: "bg-success/20 text-success border-success/30",
  pausado: "bg-warning/20 text-warning border-warning/30",
};

const Produtos = () => {
  // Simula loading para demonstrar skeleton
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Produtos</h1>
              <p className="text-sm text-muted-foreground">Gerencie seu catálogo de produtos</p>
            </div>
          </div>
          <Button className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Filters */}
        <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "100ms" }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar produtos..." className="pl-10 bg-muted/50 border-border/50" />
            </div>
            <Button variant="outline" className="glass">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtosData.map((produto, index) => (
            <div 
              key={produto.id}
              className="opacity-0 animate-fade-in-up glass rounded-xl p-5 hover:bg-card/80 transition-all cursor-pointer group"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs bg-muted/50">
                      {produto.categoria}
                    </Badge>
                    <Badge variant="outline" className={statusColors[produto.status]}>
                      {produto.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {produto.nome}
                  </h3>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{produto.rating}</span>
                <span className="text-sm text-muted-foreground">({produto.vendas} vendas)</span>
              </div>

              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Preço</span>
                  <span className="text-xl font-bold gradient-text">
                    R$ {produto.preco.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </SkeletonTransition>
  );
};

export default Produtos;
