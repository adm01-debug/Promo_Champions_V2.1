import { Helmet } from "react-helmet-async";
import { Users, Search, Mail, Phone, Pencil, Trash2, History, BarChart3, Plus, Sparkles, Zap, TrendingUp, Clock, ShieldAlert, BrainCircuit } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClientesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useClients, useDeleteClient, Client } from "@/hooks/crm/useClients";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { FilterPopover, SortOption } from "@/components/shared/FilterPopover";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { ICPBadge } from "@/components/shared/ICPBadge";
import { useICPDataMap } from "@/hooks/useICPData";
import { EmptyStateClients } from "@/components/shared/EmptyStateClients";
import { ClientTimeline } from "@/components/clients/ClientTimeline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AIEmailComposerButton } from "@/components/email/AIEmailComposerButton";
import { Client360View } from "@/components/clients/Client360View";
import { useCountUp } from "@/hooks/useCountUp";
import { useClientPredictions } from "@/hooks/crm/useClientPredictions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const sortOptions: SortOption[] = [
  { label: "Nome (A-Z)", value: "name_asc", direction: "asc" },
  { label: "Nome (Z-A)", value: "name_desc", direction: "desc" },
  { label: "Maior valor", value: "value_desc", direction: "desc" },
  { label: "Menor valor", value: "value_asc", direction: "asc" },
  { label: "Mais recente", value: "date_desc", direction: "desc" },
  { label: "Mais antigo", value: "date_asc", direction: "asc" },
];

const TotalValueDisplay = ({ value }: { value: number }) => {
  const animated = useCountUp(value, { duration: 1200 });
  return (
    <span className="font-display font-black text-xl text-primary tracking-tighter">
      R$ {animated.toLocaleString("pt-BR", { notation: 'compact' })}
    </span>
  );
};

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [timelineClient, setTimelineClient] = useState<Client | null>(null);
  const [view360Client, setView360Client] = useState<Client | null>(null);
  const { data: clients = [], isLoading } = useClients();
  const { data: predictions = {} } = useClientPredictions();
  const { icpMap } = useICPDataMap();
  const deleteClient = useDeleteClient();

  const fuse = useMemo(() => {
    if (!clients || clients.length === 0) return null;
    return new Fuse(clients, {
      keys: ['name', 'company', 'email', 'phone'],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [clients]);

  const sortedClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    const filtered = searchTerm.trim() && fuse
      ? fuse.search(searchTerm).map(result => result.item)
      : [...clients];
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name_asc": return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        case "value_desc": return Number(b.total_value || 0) - Number(a.total_value || 0);
        case "value_asc": return Number(a.total_value || 0) - Number(b.total_value || 0);
        case "date_desc": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date_asc": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default: return 0;
      }
    });
  }, [clients, fuse, searchTerm, sortBy]);

  const {
    paginatedItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, itemsPerPage, setItemsPerPage, itemsPerPageOptions,
  } = usePagination(sortedClients, { initialItemsPerPage: 12 });

  const handleDelete = () => {
    if (!deletingClient) return;
    deleteClient.mutate(deletingClient.id, { onSuccess: () => setDeletingClient(null) });
  };

  return (
    <>
    <Helmet>
      <title>Clientes | Promo Champions</title>
      <meta name="description" content="Gestão da carteira de clientes com IA" />
    </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<ClientesLoadingSkeleton />} duration={400}>
      <PageTransition>
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                  <Users className="h-7 w-7 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="font-display font-black text-3xl uppercase tracking-tighter italic">Clientes</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Intelligence Hub v3.0</span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{totalItems} UNIDADES CADASTRADAS</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <AIEmailComposerButton variant="outline" className="h-11 px-5 rounded-xl border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all duration-300" />
              <CreateClientDialog />
            </div>
          </div>

          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-4" style={{ animationDelay: "100ms" }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar clientes..." className="pl-10 bg-muted/50 border-border/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <FilterPopover sortOptions={sortOptions} currentSort={sortBy} onSortChange={setSortBy} />
            </div>
          </div>

          {sortedClients.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {paginatedItems.map((client, index) => {
                    const prediction = predictions[client.id];
                    return (
                      <motion.div 
                        key={client.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.05,
                          ease: [0.23, 1, 0.32, 1] 
                        }}
                        className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-xl backdrop-blur-md rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/5 hover:border-primary/30 will-change-transform"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-10">
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-background/50 border-border/50 hover:bg-primary/20 hover:text-primary" onClick={() => setView360Client(client)}><BarChart3 className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-background/50 border-border/50 hover:bg-primary/20 hover:text-primary" onClick={() => setTimelineClient(client)}><History className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-background/50 border-border/50 hover:bg-primary/20 hover:text-primary" onClick={() => setEditingClient(client)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-background/50 border-border/50 hover:bg-destructive/20 hover:text-destructive" onClick={() => setDeletingClient(client)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex items-start gap-4 mb-6">
                          <Avatar className="h-14 w-14 rounded-2xl ring-2 ring-background group-hover:ring-primary/20 transition-all"><AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-black uppercase">{client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-black text-base uppercase tracking-tighter truncate group-hover:text-primary transition-colors">{client.name}</h3>
                            <div className="flex items-center gap-2"><p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">{client.company || "OPERATIVA INDEPENDENTE"}</p><ICPBadge icpData={icpMap.get(client.id)} size="sm" /></div>
                          </div>
                        </div>
                        {prediction && prediction.nextPurchaseDate && (
                          <div className={cn("mb-4 p-3 rounded-xl border flex items-center gap-3 animate-fade-in", prediction.urgency === 'high' ? "bg-rose-500/10 border-rose-500/20" : prediction.urgency === 'medium' ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20")}>
                            <div className={cn("p-2 rounded-lg", prediction.urgency === 'high' ? "bg-rose-500/20" : prediction.urgency === 'medium' ? "bg-amber-500/20" : "bg-emerald-500/10")}><BrainCircuit className={cn("h-4 w-4", prediction.urgency === 'high' ? "text-rose-500 animate-pulse" : prediction.urgency === 'medium' ? "text-amber-500" : "text-emerald-500")} /></div>
                            <div><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Previsão</p><p className="text-xs font-bold">{prediction.daysToNextPurchase <= 0 ? "Expectativa Hoje!" : `Em ~${prediction.daysToNextPurchase} dias`}</p></div>
                            <div className="ml-auto text-right"><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Confiança</p><p className="text-xs font-bold text-primary">{Math.round(prediction.confidence * 100)}%</p></div>
                          </div>
                        )}
                        <div className="space-y-3 mb-6">
                          {client.email && <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent/20 border border-white/5 group-hover:border-primary/10"><Mail className="h-3.5 w-3.5 text-primary" /><span className="text-xs font-medium text-muted-foreground truncate">{client.email}</span></div>}
                          {client.phone && <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent/20 border border-white/5 group-hover:border-primary/10"><Phone className="h-3.5 w-3.5 text-indigo-500" /><span className="text-xs font-medium text-muted-foreground">{client.phone}</span></div>}
                        </div>
                        <div className="pt-4 border-t border-border/10">
                          <div className="flex justify-between items-end">
                            <div className="space-y-0.5"><span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">LTV Total</span><div className="flex items-baseline gap-1"><TotalValueDisplay value={Number(client.total_value || 0)} /><span className="text-[9px] font-bold text-emerald-500 uppercase">Valorizado</span></div></div>
                            <div className="px-2 py-1 rounded-md bg-primary/5 text-[9px] font-black text-primary uppercase border border-primary/10">Rank Elite</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} startIndex={startIndex} endIndex={endIndex} totalItems={totalItems} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} itemsPerPageOptions={itemsPerPageOptions} />
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center"><Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><h3 className="text-lg font-semibold mb-2">Nenhum cliente</h3><Button variant="outline" onClick={() => setSearchTerm('')}>Limpar Busca</Button></div>
          )}
        </div>
      </div>
      <EditClientDialog client={editingClient} open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)} />
      <DeleteConfirmDialog open={!!deletingClient} onOpenChange={(open) => !open && setDeletingClient(null)} onConfirm={handleDelete} title="Excluir Cliente" description={`Confirma a exclusão de "${deletingClient?.name}"?`} isDeleting={deleteClient.isPending} />
      <Dialog open={!!timelineClient} onOpenChange={(open) => !open && setTimelineClient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-xl border-primary/20 rounded-3xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2"><div className="flex items-center gap-3"><History className="h-5 w-5 text-primary" /><DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Timeline — {timelineClient?.name}</DialogTitle></div></DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">{timelineClient && <ClientTimeline clientId={timelineClient.id} clientName={timelineClient.name} />}</div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!view360Client} onOpenChange={(open) => !open && setView360Client(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl rounded-3xl">
          {view360Client && <Client360View clientName={view360Client.name} />}
        </DialogContent>
      </Dialog>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
};

export default Clientes;
