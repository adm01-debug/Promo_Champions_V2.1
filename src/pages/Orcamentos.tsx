import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuotes, useQuoteSummary, useCreateQuote, useUpdateQuoteStatus, useDeleteQuote, QUOTE_STATUSES, useDealsForQuotes, type Quote } from "@/hooks/useQuotes";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FileText, Plus, Send, CheckCircle2, AlertTriangle, 
  ShoppingBag, Trash2, Calculator, Settings2, DollarSign,
  TrendingUp, Activity
} from "lucide-react";
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
    total_value: "0", 
    external_reference: "", 
    valid_until: "", 
    notes: "",
    sale_id: "",
    subtotal: "0",
    discount_amount: "0",
    currency: "BRL",
    subscription_type: "one-time"
  });

  interface QuoteItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItem, setNewItem] = useState<{ product_name: string; quantity: number; unit_price: number }>({ product_name: "", quantity: 1, unit_price: 0 });

  const addItem = () => {
    if (!newItem.product_name || newItem.unit_price <= 0) return;
    const total = newItem.quantity * newItem.unit_price;
    const updatedItems = [...items, { ...newItem, total_price: total }];
    setItems(updatedItems);
    
    const newSubtotal = updatedItems.reduce((acc, curr) => acc + curr.total_price, 0);
    setForm(f => ({
      ...f,
      subtotal: String(newSubtotal),
      total_value: String(newSubtotal - Number(f.discount_amount))
    }));
    setNewItem({ product_name: "", quantity: 1, unit_price: 0 });
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    const newSubtotal = updatedItems.reduce((acc, curr) => acc + curr.total_price, 0);
    setForm(f => ({
      ...f,
      subtotal: String(newSubtotal),
      total_value: String(newSubtotal - Number(f.discount_amount))
    }));
  };

  const handleCreate = () => {
    if (!form.client_name || !form.title || Number(form.total_value) <= 0) return;
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
      subtotal: Number(form.subtotal),
      discount_amount: Number(form.discount_amount),
      discount_percent: Number(form.subtotal) > 0 ? (Number(form.discount_amount) / Number(form.subtotal)) * 100 : 0,
      items: items
    }, { 
      onSuccess: () => { 
        setIsCreateOpen(false); 
        setForm({ 
          client_name: "", 
          title: "", 
          description: "", 
          total_value: "0", 
          external_reference: "", 
          valid_until: "", 
          notes: "",
          sale_id: "",
          subtotal: "0",
          discount_amount: "0",
          currency: "BRL",
          subscription_type: "one-time"
        }); 
        setItems([]);
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
      <title>CPQ Engine & Orçamentos | Promo Champions</title>
      <meta name="description" content="Configure-Price-Quote (CPQ) avançado com gestão de assinaturas." />
    </Helmet>
    <PageTransition>
      <div className="space-y-6">
        <motion.div className="flex items-center justify-between" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl gradient-primary"><ShoppingBag className="h-6 w-6 text-primary-foreground" /></div>
            <div>
              <h1 className="text-page-title gradient-text">Quote-to-Cash (CPQ)</h1>
              <p className="text-muted-foreground">Motor de orçamentos avançado, bundles e assinaturas</p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo CPQ</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Configurar Proposta (CPQ)</DialogTitle></DialogHeader>
              
              <Tabs defaultValue="general" className="mt-4">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="general">Geral & Cliente</TabsTrigger>
                  <TabsTrigger value="items">Configuração de Itens</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Moeda da Transação</Label>
                      <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">BRL (R$)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Contrato</Label>
                      <Select value={form.subscription_type} onValueChange={v => setForm(f => ({ ...f, subscription_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">Venda Única (One-time)</SelectItem>
                          <SelectItem value="saas">SaaS / Recorrente (MRR)</SelectItem>
                          <SelectItem value="service">Serviço Pontual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2"><Label>Cliente / Empresa *</Label><Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nome do cliente" /></div>
                  <div className="space-y-2"><Label>Título da Proposta *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Upgrade de Infraestrutura 2024" /></div>
                  
                  <div className="space-y-2">
                    <Label>Vincular a Negociação do Pipeline</Label>
                    <Select value={form.sale_id} onValueChange={val => {
                      const deal = deals?.find(d => d.id === val);
                      setForm(f => ({ ...f, sale_id: val, client_name: f.client_name || deal?.client_name || "" }));
                    }}>
                      <SelectTrigger><SelectValue placeholder="Selecione um deal..." /></SelectTrigger>
                      <SelectContent>
                        {deals?.map(deal => <SelectItem key={deal.id} value={deal.id}>{deal.client_name} - {deal.product_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Validade da Proposta</Label><Input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>ID Externo (ERP/Ref)</Label><Input value={form.external_reference} onChange={e => setForm(f => ({ ...f, external_reference: e.target.value }))} /></div>
                  </div>
                </TabsContent>

                <TabsContent value="items" className="space-y-4 pt-4">
                  <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
                    <Label className="text-xs font-black uppercase text-primary tracking-widest">Adicionar Linha de Produto</Label>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6"><Input placeholder="Produto ou SKU" value={newItem.product_name} onChange={e => setNewItem({ ...newItem, product_name: e.target.value })} /></div>
                      <div className="col-span-2"><Input type="number" placeholder="Qtd" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} /></div>
                      <div className="col-span-3"><Input type="number" placeholder="Preço" value={newItem.unit_price} onChange={e => setNewItem({ ...newItem, unit_price: Number(e.target.value) })} /></div>
                      <div className="col-span-1"><Button size="icon" onClick={addItem}><Plus className="h-4 w-4" /></Button></div>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {items.length === 0 && <p className="text-center text-muted-foreground text-sm py-8 border border-dashed rounded-lg">Nenhum item configurado. Adicione produtos acima.</p>}
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary/30 transition-all text-sm group">
                        <div className="flex-1">
                          <p className="font-black text-primary uppercase text-[10px] tracking-tighter">LINHA #{i+1}</p>
                          <p className="font-bold">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} un. x {form.currency} {item.unit_price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-display font-black text-lg">{form.currency} {item.total_price.toLocaleString()}</span>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-dashed">
                    <div className="flex justify-between text-sm uppercase font-bold text-muted-foreground"><span>Subtotal Configurador</span><span>{form.currency} {Number(form.subtotal).toLocaleString()}</span></div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-primary" />
                        <Label className="text-xs font-bold">Desconto Estratégico</Label>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
                        <Input 
                          type="number" 
                          className="w-32 h-8 text-right pl-6" 
                          value={form.discount_amount} 
                          onChange={e => {
                            const disc = e.target.value;
                            setForm(f => ({ ...f, discount_amount: disc, total_value: String(Number(f.subtotal) - Number(disc)) }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Valor Final da Proposta</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-status-success" />
                          <p className="text-3xl font-black text-primary tracking-tighter">{form.currency} {Number(form.total_value).toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="h-6 bg-status-success/10 text-status-success border-status-success/20 font-black">
                        CPQ READY
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button onClick={handleCreate} className="w-full mt-4 h-12 text-lg font-black uppercase tracking-widest shadow-lg shadow-primary/20" disabled={createQuote.isPending || !form.client_name || !form.title || Number(form.total_value) <= 0}>
                {createQuote.isPending ? "Configurando..." : "Gerar Orçamento Inteligente"}
              </Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {summaryCards.map((card) => (
            <Card 
              key={card.label} 
              className={cn(
                "p-4 flex items-center gap-3 transition-all duration-300 hover:shadow-md border-border/40 glass",
                card.label === "Expirando" && card.value > 0 ? "border-status-warning/50 bg-status-warning/5 animate-pulse-subtle" : ""
              )}
            >
              <div className={cn("p-2 rounded-lg", card.color.replace('text-', 'bg-').replace('text-foreground', 'bg-muted'))}>
                <card.icon className={cn("h-5 w-5", card.color.includes('status-warning') ? 'text-status-warning' : 'text-current')} />
              </div>
              <div>
                <p className="text-metric font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
              </div>
            </Card>
          ))}
        </motion.div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>Todos</Button>
            {QUOTE_STATUSES.map(s => (
              <Button 
                key={s.value} 
                variant={statusFilter === s.value ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter(s.value)}
                className="gap-2"
              >
                <div className={cn("w-2 h-2 rounded-full", s.color.split(' ')[0])} />
                {s.label}
              </Button>
            ))}
          </div>
          
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-4 bg-muted/30 px-3 py-1.5 rounded-full">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-success" /> Aprovado</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-warning" /> Expira em ≤3d</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Expirado</span>
          </div>
        </div>

        <motion.div className="space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => (<Card key={i} className="p-4 animate-pulse"><div className="h-6 bg-muted rounded w-1/3 mb-2" /><div className="h-4 bg-muted rounded w-1/2" /></Card>))}</div>
          ) : !quotes?.length ? (
            <Card className="p-12 text-center border-dashed"><FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Nenhuma Proposta Ativa</p></Card>
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
