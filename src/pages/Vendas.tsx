import { ShoppingCart, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const salesData = [
  { id: "V001", cliente: "João Silva", produto: "Plano Premium", valor: 1299, status: "concluída", data: "12/12/2024" },
  { id: "V002", cliente: "Maria Santos", produto: "Plano Básico", valor: 499, status: "pendente", data: "11/12/2024" },
  { id: "V003", cliente: "Carlos Oliveira", produto: "Plano Enterprise", valor: 2999, status: "concluída", data: "10/12/2024" },
  { id: "V004", cliente: "Ana Costa", produto: "Plano Premium", valor: 1299, status: "cancelada", data: "09/12/2024" },
  { id: "V005", cliente: "Pedro Lima", produto: "Plano Básico", valor: 499, status: "concluída", data: "08/12/2024" },
];

const statusColors: Record<string, string> = {
  concluída: "bg-success/20 text-success border-success/30",
  pendente: "bg-warning/20 text-warning border-warning/30",
  cancelada: "bg-destructive/20 text-destructive border-destructive/30",
};

const Vendas = () => {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Vendas</h1>
              <p className="text-sm text-muted-foreground">Gerencie todas as vendas</p>
            </div>
          </div>
          <Button className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        </div>

        {/* Filters */}
        <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "100ms" }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar vendas..." className="pl-10 bg-muted/50 border-border/50" />
            </div>
            <Button variant="outline" className="glass">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Table */}
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
                {salesData.map((sale, index) => (
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
                      <Badge variant="outline" className={statusColors[sale.status]}>
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
      </div>
    </div>
  );
};

export default Vendas;
