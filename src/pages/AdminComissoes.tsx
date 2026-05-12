import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, CheckCircle, XCircle, Clock, Filter, Search, FileText, Wallet } from "lucide-react";
import { useAllCommissions, useUpdateCommissionStatus, type CommissionStatus } from "@/hooks/useCommissions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

const statusBadge: Record<CommissionStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  approved: { label: "Aprovada", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  paid: { label: "Paga", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  cancelled: { label: "Cancelada", className: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
};

export default function AdminComissoes() {
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: commissions = [], isLoading } = useAllCommissions(statusFilter === "all" ? undefined : statusFilter);
  const updateStatus = useUpdateCommissionStatus();

  const filteredCommissions = commissions.filter(c => 
    c.salespeople?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sales?.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (commission: any, status: CommissionStatus) => {
    setSelectedCommission({ ...commission, targetStatus: status });
    setNotes(commission.payment_notes || "");
    setIsDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedCommission) return;
    await updateStatus.mutateAsync({
      id: selectedCommission.id,
      status: selectedCommission.targetStatus,
      payment_notes: notes
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Gestão de Comissões | Admin</title>
      </Helmet>

      <PageTransition>
        <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-page-title font-display italic uppercase tracking-tighter">Gestão de Comissões</h1>
              <p className="text-sm text-muted-foreground">Aprovação e pagamento de comissões de vendas</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar vendedor ou cliente..." 
                  className="pl-9 w-[250px] bg-white/5 border-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="space-y-6">
              <TabsList className="bg-white/5 border border-white/10 p-1">
                <TabsTrigger value="all" className="text-xs font-black uppercase tracking-widest">Todas</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs font-black uppercase tracking-widest">Pendentes</TabsTrigger>
                <TabsTrigger value="approved" className="text-xs font-black uppercase tracking-widest">Aprovadas</TabsTrigger>
                <TabsTrigger value="paid" className="text-xs font-black uppercase tracking-widest">Pagas</TabsTrigger>
              </TabsList>

              <Card className="glass border-white/5 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Vendedor</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Cliente / Produto</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Data</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Valor Venda</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Comissão</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-white/5">
                          <TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredCommissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">
                          Nenhuma comissão encontrada para os critérios selecionados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCommissions.map((c) => (
                        <TableRow key={c.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                          <TableCell>
                            <span className="font-bold text-sm">{c.salespeople?.name || "Vendedor"}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{c.sales?.client_name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{c.sales?.product_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {formatBRL(c.base_amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-black italic text-primary">{formatBRL(c.commission_amount)}</span>
                            <span className="text-[9px] text-muted-foreground ml-1">({c.percentage}%)</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1", statusBadge[c.status].className)}>
                              {statusBadge[c.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {c.status === 'pending' && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" onClick={() => handleAction(c, 'approved')} title="Aprovar">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {c.status === 'approved' && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" onClick={() => handleAction(c, 'paid')} title="Marcar como Paga">
                                  <Wallet className="h-4 w-4" />
                                </Button>
                              )}
                              {(c.status === 'pending' || c.status === 'approved') && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10" onClick={() => handleAction(c, 'cancelled')} title="Cancelar">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => { setSelectedCommission(c); setNotes(c.payment_notes || ""); setIsDialogOpen(true); }} title="Ver Detalhes">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </Tabs>
          </motion.div>
        </div>
      </PageTransition>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display italic uppercase tracking-tighter">
              {selectedCommission?.targetStatus ? `Atualizar para ${statusBadge[selectedCommission.targetStatus].label}` : 'Detalhes da Comissão'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Vendedor: {selectedCommission?.salespeople?.name} | Valor: {formatBRL(selectedCommission?.commission_amount)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notas de Pagamento / Observações</label>
              <Textarea 
                placeholder="Insira notas sobre o pagamento, comprovantes ou justificativas..."
                className="bg-white/5 border-white/10 min-h-[100px] text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                readOnly={!selectedCommission?.targetStatus}
              />
            </div>

            {selectedCommission?.approved_at && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[10px] space-y-1">
                <p className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest">Aprovado em:</span>
                  <span className="font-bold">{format(new Date(selectedCommission.approved_at), "dd/MM/yyyy HH:mm")}</span>
                </p>
                {selectedCommission.paid_at && (
                  <p className="flex justify-between">
                    <span className="text-muted-foreground uppercase tracking-widest">Pago em:</span>
                    <span className="font-bold">{format(new Date(selectedCommission.paid_at), "dd/MM/yyyy HH:mm")}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[10px] font-black uppercase tracking-widest">
              Fechar
            </Button>
            {selectedCommission?.targetStatus && (
              <Button onClick={confirmAction} disabled={updateStatus.isPending} className="gradient-primary text-[10px] font-black uppercase tracking-widest px-8">
                Confirmar Alteração
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
