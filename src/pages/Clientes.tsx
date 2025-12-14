import { Users, Filter, Search, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClientesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: clients, isLoading } = useClients(searchTerm);

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<ClientesLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl gradient-primary">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Clientes</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie sua base de clientes
                  {isLoading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                </p>
              </div>
            </div>
            <CreateClientDialog />
          </div>

          {/* Filters */}
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "100ms" }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar clientes..." 
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

          {/* Cards Grid */}
          {clients && clients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client, index) => (
                <div 
                  key={client.id}
                  className="opacity-0 animate-fade-in-up glass rounded-xl p-5 hover:bg-card/80 transition-all cursor-pointer group"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                        {client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{client.company || "Sem empresa"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Valor total</span>
                      <span className="font-semibold text-primary">
                        R$ {Number(client.total_value).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente uma busca diferente" : "Adicione seu primeiro cliente para começar"}
              </p>
            </div>
          )}
        </div>
      </div>
    </SkeletonTransition>
  );
};

export default Clientes;
