import { Users, Plus, Filter, Search, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const clientesData = [
  { id: 1, nome: "João Silva", email: "joao@email.com", telefone: "(11) 99999-1234", empresa: "Tech Solutions", valor: 15000 },
  { id: 2, nome: "Maria Santos", email: "maria@email.com", telefone: "(21) 98888-5678", empresa: "Design Co", valor: 8500 },
  { id: 3, nome: "Carlos Oliveira", email: "carlos@email.com", telefone: "(31) 97777-9012", empresa: "Marketing Pro", valor: 22000 },
  { id: 4, nome: "Ana Costa", email: "ana@email.com", telefone: "(41) 96666-3456", empresa: "Consultoria XYZ", valor: 12000 },
  { id: 5, nome: "Pedro Lima", email: "pedro@email.com", telefone: "(51) 95555-7890", empresa: "Vendas Plus", valor: 18500 },
  { id: 6, nome: "Lucia Ferreira", email: "lucia@email.com", telefone: "(61) 94444-1234", empresa: "Finance Corp", valor: 31000 },
];

const Clientes = () => {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Clientes</h1>
              <p className="text-sm text-muted-foreground">Gerencie sua base de clientes</p>
            </div>
          </div>
          <Button className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Filters */}
        <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "100ms" }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar clientes..." className="pl-10 bg-muted/50 border-border/50" />
            </div>
            <Button variant="outline" className="glass">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesData.map((cliente, index) => (
            <div 
              key={cliente.id}
              className="opacity-0 animate-fade-in-up glass rounded-xl p-5 hover:bg-card/80 transition-all cursor-pointer group"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                    {cliente.nome.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {cliente.nome}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{cliente.empresa}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{cliente.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{cliente.telefone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Valor total</span>
                  <span className="font-semibold text-primary">
                    R$ {cliente.valor.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clientes;
