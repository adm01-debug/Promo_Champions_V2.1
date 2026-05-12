import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuotes, useQuoteSummary, useCreateQuote, useUpdateQuoteStatus, useDeleteQuote, QUOTE_STATUSES, useDealsForQuotes, type Quote } from "@/hooks/useQuotes";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Plus, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { QuoteDetailDialog } from "@/components/quotes/QuoteDetailDialog";
import { QuoteCard } from "@/components/quotes/QuoteCard";
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
  const { data: deals } = useDealsForQuotes();
  
  const [form, setForm] = useState({ 
    client_name: "", 
    title: "", 
    description: "", 
    total_value: "", 
    external_reference: "", 
    valid_until: "", 
    notes: "",
    sale_id: ""
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
      sale_id: form.sale_id || undefined,
      created_by: salesperson?.id,
    }, { 
      onSuccess: () => { 
        setIsCreateOpen(false); 
        setForm({ 
          client_name: "", 
          title: "", 
          description: "", 
          total_value: "", 
          external_reference: "", 
          valid_until: "", 
          notes: "",
          sale_id: ""
        }); 
      } 
    });
  };

  const summaryCards = [
    { label: "Total", value: summary?.total || 0, icon: FileText, color: "text-foreground" },
    { label: "Enviados", value: summary?.sent || 0, icon: Send, color: "text-primary" },
    { label: "Aprovados", value: summary?.approved || 0, icon: CheckCircle2, color: "text-status-success" },
    { label: "Expirando", value: summary?.expiringSoon || 0, icon: AlertTriangle, color: "text-status-warning" },
  ];

  return (
    <>
    <Helmet>
      <title>Orçamentos | Promo Champions</title>
      <meta name="description" content="Gestão de orçamentos e propostas" />
    </Helmet>
    <PageTransition>
      <div className="space-y-6">
        <motion.div className="flex items-center justify-between" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl gradient-primary"><FileText className="h-6 w-6 text-primary-foreground" /></div>
            <div>
              <h1 className="text-page-title gradient-text">Orçamentos</h1>
              <p className="text-muted-foreground">Acompanhe propostas, status e validade dos orçamentos</p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Orçamento</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Registrar Orçamento</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Cliente *</Label><Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nome do cliente" /></div>
                  <div className="space-y-2"><Label>Valor Total *</Label><Input type="number" value={form.total_value} onChange={e => setForm(f => ({ ...f, total_value: e.target.value }))} placeholder="0.00" /></div>
                </div>
                <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do orçamento" /></div>
                <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes..." rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Ref. Externa</Label><Input value={form.external_reference} onChange={e => setForm(f => ({ ...f, external_reference: e.target.value }))} placeholder="ID do sistema externo" /></div>
                  <div className="space-y-2"><Label>Válido até</Label><Input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} /></div>
                </div>
                <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas internas..." rows={2} /></div>
                <Button onClick={handleCreate} className="w-full" disabled={createQuote.isPending || !form.client_name || !form.title || !form.total_value}>{createQuote.isPending ? "Criando..." : "Criar Orçamento"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {summaryCards.map((card) => (
            <Card key={card.label} className="p-4 flex items-center gap-3">
              <card.icon className={cn("h-5 w-5", card.color)} />
              <div><p className="text-metric">{card.value}</p><p className="text-xs text-muted-foreground">{card.label}</p></div>
            </Card>
          ))}
        </motion.div>

        <div className="flex items-center gap-2">
          <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>Todos</Button>
          {QUOTE_STATUSES.map(s => (<Button key={s.value} variant={statusFilter === s.value ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s.value)}>{s.label}</Button>))}
        </div>

        <motion.div className="space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => (<Card key={i} className="p-4 animate-pulse"><div className="h-6 bg-muted rounded w-1/3 mb-2" /><div className="h-4 bg-muted rounded w-1/2" /></Card>))}</div>
          ) : !quotes?.length ? (
            <Card className="p-12 text-center"><FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">Nenhum orçamento encontrado</p></Card>
          ) : (
            quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote as Quote} onView={setSelectedQuote} onUpdateStatus={updateStatus.mutate} onDelete={deleteQuote.mutate} />
            ))
          )}
        </motion.div>
        <QuoteDetailDialog quote={selectedQuote} open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)} />
      </div>
    </PageTransition>
  </>
  );
}
