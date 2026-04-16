import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useWebhooks, useWebhookDeliveries, useCreateWebhook, useUpdateWebhook,
  useDeleteWebhook, useTestWebhook, WEBHOOK_EVENTS,
} from "@/hooks/useWebhooks";
import { Webhook, Plus, Send, Trash2, CheckCircle, XCircle, Clock, Activity, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition } from "@/components/transitions/PageTransition";
import { toast } from "sonner";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const WebhooksPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [form, setForm] = useState({ name: "", url: "", secret: "", events: [] as string[] });

  const { data: webhooks, isLoading } = useWebhooks();
  const { data: deliveries } = useWebhookDeliveries(selectedId);
  const createWh = useCreateWebhook();
  const updateWh = useUpdateWebhook();
  const deleteWh = useDeleteWebhook();
  const testWh = useTestWebhook();

  const handleCreate = () => {
    if (!form.name || !form.url || form.events.length === 0) {
      toast.error("Preencha nome, URL e selecione ao menos um evento");
      return;
    }
    createWh.mutate({
      name: form.name, url: form.url,
      secret: form.secret || null, events: form.events,
    }, {
      onSuccess: () => {
        setCreateOpen(false);
        setForm({ name: "", url: "", secret: "", events: [] });
      },
    });
  };

  const toggleEvent = (ev: string) => {
    setForm(p => ({
      ...p, events: p.events.includes(ev) ? p.events.filter(e => e !== ev) : [...p.events, ev],
    }));
  };

  const generateSecret = () => {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    const secret = Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
    setForm(p => ({ ...p, secret }));
  };

  return (
    <>
      <Helmet>
        <title>Webhooks | Promo Champions</title>
        <meta name="description" content="Configuração de webhooks de saída para integrações externas." />
      </Helmet>
      <PageTransition>
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="container max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Webhook className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-page-title font-display">Webhooks</h1>
                <p className="text-sm text-muted-foreground">Integre eventos do CRM com sistemas externos</p>
              </div>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Novo Webhook</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Criar Webhook</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Slack notificações" />
                  </div>
                  <div className="space-y-2">
                    <Label>URL de destino</Label>
                    <Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                      placeholder="https://hooks.example.com/..." />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Secret (HMAC SHA-256)</Label>
                      <Button type="button" size="sm" variant="ghost" onClick={generateSecret}>Gerar</Button>
                    </div>
                    <Input value={form.secret} onChange={e => setForm(p => ({ ...p, secret: e.target.value }))}
                      placeholder="Opcional - usado para assinar payloads" />
                  </div>
                  <div className="space-y-2">
                    <Label>Eventos ({form.events.length} selecionados)</Label>
                    <ScrollArea className="h-48 rounded-md border border-border p-3">
                      <div className="space-y-2">
                        {WEBHOOK_EVENTS.map(ev => (
                          <label key={ev.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                            <Checkbox checked={form.events.includes(ev.value)} onCheckedChange={() => toggleEvent(ev.value)} />
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{ev.value}</code>
                            <span>{ev.label}</span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <Button onClick={handleCreate} className="w-full" disabled={createWh.isPending}>
                    {createWh.isPending ? "Criando..." : "Criar Webhook"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total", value: webhooks?.length ?? 0, icon: Webhook, color: "text-primary" },
              { label: "Ativos", value: webhooks?.filter(w => w.is_active).length ?? 0, icon: CheckCircle, color: "text-status-success" },
              { label: "Com Falhas", value: webhooks?.filter(w => w.failure_count > 0).length ?? 0, icon: XCircle, color: "text-destructive" },
              { label: "Entregas (50 últ.)", value: deliveries?.length ?? 0, icon: Activity, color: "text-accent" },
            ].map(s => (
              <Card key={s.label} className="glass border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={cn("h-8 w-8", s.color)} />
                  <div>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <Tabs defaultValue="webhooks">
            <TabsList>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="deliveries">Entregas Recentes</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks" className="space-y-3 mt-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
              ) : !webhooks?.length ? (
                <Card className="p-8 text-center glass border-border/40">
                  <Webhook className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="font-display font-semibold">Nenhum webhook configurado</p>
                  <p className="text-sm text-muted-foreground">Crie seu primeiro webhook para receber eventos.</p>
                </Card>
              ) : (
                webhooks.map(wh => (
                  <Card key={wh.id} className={cn("glass border-border/40 hover:border-primary/30 transition-colors cursor-pointer",
                    selectedId === wh.id && "border-primary/60")}
                    onClick={() => setSelectedId(wh.id === selectedId ? undefined : wh.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-display font-semibold">{wh.name}</h3>
                            <Badge variant={wh.is_active ? "default" : "secondary"} className="text-[10px]">
                              {wh.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                            {wh.failure_count > 0 && (
                              <Badge variant="destructive" className="text-[10px]">{wh.failure_count} falhas</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded truncate flex-1">{wh.url}</code>
                            <Button size="icon" variant="ghost" className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(wh.url); toast.success("URL copiada"); }}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {wh.events.map(ev => <Badge key={ev} variant="outline" className="text-[9px]">{ev}</Badge>)}
                          </div>
                          {wh.last_triggered_at && (
                            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Último disparo: {formatDistanceToNow(new Date(wh.last_triggered_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <Switch checked={wh.is_active}
                            onCheckedChange={(v) => updateWh.mutate({ id: wh.id, is_active: v })} />
                          <Button size="sm" variant="ghost" className="h-7 gap-1"
                            onClick={() => testWh.mutate(wh.id)} disabled={testWh.isPending}>
                            <Send className="h-3 w-3" /> Testar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 gap-1 text-destructive"
                            onClick={() => { if (confirm("Remover webhook?")) deleteWh.mutate(wh.id); }}>
                            <Trash2 className="h-3 w-3" /> Remover
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="deliveries" className="space-y-2 mt-4">
              {!deliveries?.length ? (
                <Card className="p-8 text-center glass border-border/40">
                  <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="font-display font-semibold">Sem entregas</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedId ? "Este webhook ainda não foi disparado." : "Selecione um webhook para ver suas entregas."}
                  </p>
                </Card>
              ) : (
                deliveries.map(d => (
                  <Card key={d.id} className="glass border-border/40">
                    <CardContent className="p-3 flex items-center gap-3">
                      {d.success ? <CheckCircle className="h-5 w-5 text-status-success shrink-0" /> :
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{d.event_type}</code>
                          {d.response_status && (
                            <Badge variant={d.success ? "default" : "destructive"} className="text-[10px]">
                              HTTP {d.response_status}
                            </Badge>
                          )}
                          {d.duration_ms && <span className="text-[10px] text-muted-foreground">{d.duration_ms}ms</span>}
                        </div>
                        {d.error_message && <p className="text-xs text-destructive mt-1 truncate">{d.error_message}</p>}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(d.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </PageTransition>
    </>
  );
};

export default WebhooksPage;
