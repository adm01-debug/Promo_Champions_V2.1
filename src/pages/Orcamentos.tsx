import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuotes, useQuoteSummary, useCreateQuote, useUpdateQuoteStatus, useDeleteQuote, QUOTE_STATUSES, type QuoteStatus, type Quote } from "@/hooks/useQuotes";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Plus, Send, CheckCircle2, XCircle, Clock, AlertTriangle, Trash2, Link2, Eye } from "lucide-react";
import { QuoteDetailDialog } from "@/components/quotes/QuoteDetailDialog";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/transitions/PageTransition";
import { cn } from "@/lib/utils";

export default function Orcamentos() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const { salesperson } = useAuth();

  const { data: quotes, isLoading } = useQuotes(statusFilter);
  const { data: summary } = useQuoteSummary();
  const createQuote = useCreateQuote();
  const updateStatus = useUpdateQuoteStatus();
  const deleteQuote = useDeleteQuote();

  const [form, setForm] = useState({
    client_name: "",
    title: "",
    description: "",
    total_value: "",
    external_reference: "",
    valid_until: "",
    notes: "",
  });

  const handleCreate = () => {
    if (!form.client_name || !form.title || !form.total_value) return;
    createQuote.mutate({
      client_name: form.client_name,
      title: form.title,
      description: form.description || undefined,
      total_value: Number(form.total_value),
      external_reference: form.external_reference || undefined,
      valid_until: form.valid_until || undefined,
      notes: form.notes || undefined,
      created_by: salesperson?.id,
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setForm({ client_name: "", title: "", description: "", total_value: "", external_reference: "", valid_until: "", notes: "" });
      }
    });
  };

  const getStatusConfig = (status: string) => 
    QUOTE_STATUSES.find(s => s.value === status) || QUOTE_STATUSES[0];

  const getExpirationInfo = (validUntil: string | null, status: string) => {
    if (!validUntil || status !== 'sent') return null;
    const days = differenceInDays(new Date(validUntil), new Date());
    if (days < 0) return { label: 'Expirado', color: 'text-destructive', urgent: true };
    if (days <= 3) return { label: `${days}d restantes`, color: 'text-yellow-400', urgent: true };
    return { label: `${days}d restantes`, color: 'text-muted-foreground', urgent: false };
  };

  const summaryCards = [
    { label: "Total", value: summary?.total || 0, icon: FileText, color: "text-foreground" },
    { label: "Enviados", value: summary?.sent || 0, icon: Send, color: "text-blue-400" },
    { label: "Aprovados", value: summary?.approved || 0, icon: CheckCircle2, color: "text-green-400" },
    { label: "Expirando", value: summary?.expiringSoon || 0, icon: AlertTriangle, color: "text-yellow-400" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl gradient-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Orçamentos</h1>
              <p className="text-muted-foreground">
                Acompanhe propostas, status e validade dos orçamentos
              </p>
            </div>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Orçamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nome do cliente" />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Total *</Label>
                    <Input type="number" value={form.total_value} onChange={e => setForm(f => ({ ...f, total_value: e.target.value }))} placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do orçamento" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes..." rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ref. Externa</Label>
                    <Input value={form.external_reference} onChange={e => setForm(f => ({ ...f, external_reference: e.target.value }))} placeholder="ID do sistema externo" />
                  </div>
                  <div className="space-y-2">
                    <Label>Válido até</Label>
                    <Input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas internas..." rows={2} />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createQuote.isPending || !form.client_name || !form.title || !form.total_value}>
                  {createQuote.isPending ? "Criando..." : "Criar Orçamento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {summaryCards.map((card) => (
            <Card key={card.label} className="p-4 flex items-center gap-3">
              <card.icon className={cn("h-5 w-5", card.color)} />
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Todos
          </Button>
          {QUOTE_STATUSES.map(s => (
            <Button
              key={s.value}
              variant={statusFilter === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>

        {/* Quotes List */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : !quotes?.length ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
            </Card>
          ) : (
            quotes.map((quote) => {
              const statusConfig = getStatusConfig(quote.status);
              const expiration = getExpirationInfo(quote.valid_until, quote.status);

              return (
                <Card key={quote.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{quote.title}</h3>
                        <Badge className={cn("text-xs", statusConfig.color)} variant="outline">
                          {statusConfig.label}
                        </Badge>
                        {expiration?.urgent && (
                          <span className={cn("text-xs font-medium flex items-center gap-1", expiration.color)}>
                            <Clock className="h-3 w-3" />
                            {expiration.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{quote.client_name}</span>
                        <span className="font-semibold text-foreground">
                          {Number(quote.total_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        {quote.external_reference && (
                          <span className="flex items-center gap-1 text-xs">
                            <Link2 className="h-3 w-3" />
                            {quote.external_reference}
                          </span>
                        )}
                        {quote.valid_until && (
                          <span className="text-xs">
                            Validade: {format(new Date(quote.valid_until), "dd/MM/yyyy")}
                          </span>
                        )}
                      </div>
                      {quote.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{quote.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Criado em {format(new Date(quote.created_at), "dd MMM yyyy", { locale: ptBR })}
                        {quote.salespeople?.name && ` por ${quote.salespeople.name}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => setSelectedQuote(quote as Quote)}
                      >
                        <Eye className="h-3 w-3" />
                        Detalhes
                      </Button>
                      {quote.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                          onClick={() => updateStatus.mutate({ id: quote.id, status: 'sent' })}
                        >
                          <Send className="h-3 w-3" />
                          Enviar
                        </Button>
                      )}
                      {quote.status === 'sent' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs text-green-400 border-green-400/30"
                            onClick={() => updateStatus.mutate({ id: quote.id, status: 'approved' })}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs text-destructive border-destructive/30"
                            onClick={() => updateStatus.mutate({ id: quote.id, status: 'rejected' })}
                          >
                            <XCircle className="h-3 w-3" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O orçamento "{quote.title}" será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteQuote.mutate(quote.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </motion.div>
        <QuoteDetailDialog
          quote={selectedQuote}
          open={!!selectedQuote}
          onOpenChange={(open) => !open && setSelectedQuote(null)}
        />
      </div>
    </PageTransition>
  );
}
