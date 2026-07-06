import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AlertTriangle, Bell, CheckCircle2, Clock, PlayCircle, RefreshCw, RotateCcw, Archive, Send, Radio, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useV4CallbackActions, useV4CallbackKpis, useV4DeadLetters, useV4Alerts, useV4AlertSettings, type V4DeadLetter, type V4DeadLetterStatus } from "@/hooks/admin/useV4Callbacks";

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Clock; label: string; value: string | number; tone: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${tone}`}><Icon className="h-5 w-5" /></div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminV4CallbacksContent() {
  const [tab, setTab] = useState<V4DeadLetterStatus>("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<V4DeadLetter | null>(null);

  const kpisQ = useV4CallbackKpis();
  const listQ = useV4DeadLetters(tab, search);
  const { retry, reset, archive, retryFiltered, runDispatcher } = useV4CallbackActions();
  const alertsQ = useV4Alerts();
  const alertSettings = useV4AlertSettings();

  const items = listQ.data ?? [];
  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const ids = () => Array.from(selected);

  const kpi = kpisQ.data;
  const rate = kpi?.successRate7d;
  const disabled = kpi ? kpi.pending > 0 && (kpi.metrics7d.length === 0 || (rate === null)) : false;

  return (
    <>
      <Helmet><title>Callbacks V4 | Promo Champions</title></Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-page-title gradient-text">Callbacks V4</h1>
            <p className="text-muted-foreground mt-1">Fila de notificações do CRM para o Promo Gifts V4.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { listQ.refetch(); kpisQ.refetch(); alertsQ.refetch(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />Atualizar
            </Button>
            <AlertSettingsDialog settings={alertSettings} />
            <Button size="sm" onClick={() => runDispatcher.mutate()} disabled={runDispatcher.isPending}>
              <PlayCircle className="h-4 w-4 mr-2" />Executar dispatcher
            </Button>
          </div>
        </div>

        <AlertsPanel alerts={alertsQ.data ?? []} onAck={(id) => alertSettings.ackMutation.mutate(id)} />

        {disabled && (
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Callback desligado.</strong> Existem <b>{kpi?.pending}</b> evento(s) enfileirados.
                Configure os secrets <code>V4_CALLBACK_URL</code> e <code>V4_CALLBACK_API_KEY</code> para habilitar o envio ao V4.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Kpi icon={Clock} label="Pendentes" value={kpi?.pending ?? "—"} tone="bg-info/10 text-info" />
          <Kpi icon={AlertTriangle} label="Esgotados (≥5)" value={kpi?.exhausted ?? "—"} tone="bg-destructive/10 text-destructive" />
          <Kpi icon={CheckCircle2} label="Resolvidos 24h" value={kpi?.resolved24h ?? "—"} tone="bg-success/10 text-success" />
          <Kpi icon={Radio} label="Taxa sucesso 7d" value={rate === null || rate === undefined ? "—" : `${rate.toFixed(1)}%`} tone="bg-primary/10 text-primary" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle>Dead letters</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Buscar external_quote_id" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
              <Tabs value={tab} onValueChange={(v) => { setTab(v as V4DeadLetterStatus); setSelected(new Set()); }}>
                <TabsList>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="exhausted">Esgotados</TabsTrigger>
                  <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (!confirm(`Reprocessar TODOS os registros da aba "${tab}"${search.trim() ? ` filtrados por "${search.trim()}"` : ""}?`)) return;
                  retryFiltered.mutate({ status: tab, search });
                }}
                disabled={retryFiltered.isPending}
                title="Reprocessa todos os registros que casam com o filtro atual"
              >
                <Send className="h-4 w-4 mr-1" />Reprocessar filtro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selected.size > 0 && (
              <div className="mb-3 flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
                <span className="ml-2 font-medium">{selected.size} selecionado(s)</span>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => retry.mutate(ids())}><Send className="h-4 w-4 mr-1" />Reprocessar</Button>
                  <Button size="sm" variant="outline" onClick={() => reset.mutate(ids())}><RotateCcw className="h-4 w-4 mr-1" />Resetar tentativas</Button>
                  <Button size="sm" variant="outline" onClick={() => archive.mutate(ids())}><Archive className="h-4 w-4 mr-1" />Arquivar</Button>
                </div>
              </div>
            )}

            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
                    <TableHead>Quote (V4)</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Tentativas</TableHead>
                    <TableHead>Próximo retry</TableHead>
                    <TableHead>Último erro</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listQ.isLoading && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>}
                  {!listQ.isLoading && items.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum evento nesta aba.</TableCell></TableRow>}
                  {items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell><Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggle(i.id)} /></TableCell>
                      <TableCell className="font-mono text-xs">{i.external_quote_id}</TableCell>
                      <TableCell><Badge variant="outline">{i.event_type}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={i.attempts >= 5 ? "destructive" : i.attempts >= 3 ? "secondary" : "outline"}>{i.attempts}/5</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {i.next_retry_at ? formatDistanceToNow(new Date(i.next_retry_at), { addSuffix: true, locale: ptBR }) : "—"}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {i.last_error ? (
                          <Tooltip>
                            <TooltipTrigger className="truncate block max-w-[200px] text-left text-xs text-destructive">{i.last_error}</TooltipTrigger>
                            <TooltipContent className="max-w-md whitespace-pre-wrap">{i.last_error}</TooltipContent>
                          </Tooltip>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(i.created_at), { addSuffix: true, locale: ptBR })}</TableCell>
                      <TableCell><Button size="sm" variant="ghost" onClick={() => setDetail(i)}>Ver</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader><SheetTitle>Detalhes do evento</SheetTitle></SheetHeader>
          {detail && (
            <div className="mt-4 space-y-4 text-sm">
              <div><span className="text-muted-foreground">Quote V4:</span> <code>{detail.external_quote_id}</code></div>
              <div><span className="text-muted-foreground">Evento:</span> <Badge variant="outline">{detail.event_type}</Badge></div>
              <div><span className="text-muted-foreground">Tentativas:</span> {detail.attempts}/5</div>
              {detail.last_error && (
                <div>
                  <div className="text-muted-foreground mb-1">Último erro</div>
                  <pre className="bg-destructive/10 border border-destructive/30 rounded p-2 text-xs whitespace-pre-wrap">{detail.last_error}</pre>
                </div>
              )}
              <div>
                <div className="text-muted-foreground mb-1">Payload</div>
                <pre className="bg-muted rounded p-2 text-xs overflow-auto">{JSON.stringify(detail.payload, null, 2)}</pre>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => { retry.mutate([detail.id]); setDetail(null); }}><Send className="h-4 w-4 mr-1" />Reprocessar</Button>
                <Button size="sm" variant="outline" onClick={() => { reset.mutate([detail.id]); setDetail(null); }}><RotateCcw className="h-4 w-4 mr-1" />Resetar</Button>
                <Button size="sm" variant="outline" onClick={() => { archive.mutate([detail.id]); setDetail(null); }}><Archive className="h-4 w-4 mr-1" />Arquivar</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

const KIND_LABEL: Record<string, string> = {
  high_failure_rate: "Taxa de falha alta",
  exhausted_spike: "Pico de esgotados",
  pending_backlog: "Backlog pendente",
};

function AlertsPanel({ alerts, onAck }: { alerts: ReturnType<typeof useV4Alerts>["data"] extends infer T ? Exclude<T, undefined> : never; onAck: (id: string) => void }) {
  const active = alerts.filter((a) => !a.acknowledged_at);
  if (active.length === 0) return null;
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <Bell className="h-4 w-4 text-destructive" />
        <CardTitle className="text-sm">Alertas ativos ({active.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {active.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-md border bg-background/60 p-2 text-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{KIND_LABEL[a.kind] ?? a.kind}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(a.fired_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                {JSON.stringify(a.details)}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onAck(a.id)}>Reconhecer</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AlertSettingsDialog({ settings }: { settings: ReturnType<typeof useV4AlertSettings> }) {
  const [open, setOpen] = useState(false);
  const s = settings.query.data;
  const [form, setForm] = useState({
    is_active: true,
    failure_rate_threshold: 20,
    exhausted_threshold_24h: 5,
    pending_threshold: 50,
    window_minutes: 60,
    min_events: 10,
    suppress_minutes: 30,
  });
  const openWithData = (v: boolean) => {
    if (v && s) setForm({
      is_active: s.is_active,
      failure_rate_threshold: Number(s.failure_rate_threshold),
      exhausted_threshold_24h: s.exhausted_threshold_24h,
      pending_threshold: s.pending_threshold,
      window_minutes: s.window_minutes,
      min_events: s.min_events,
      suppress_minutes: s.suppress_minutes,
    });
    setOpen(v);
  };
  return (
    <Dialog open={open} onOpenChange={openWithData}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Settings className="h-4 w-4 mr-2" />Alertas</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Configurar alertas do dispatcher V4</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="v4-alerts-active">Alertas ativos</Label>
            <Switch id="v4-alerts-active" checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <NumField label="Taxa falha ≥ (%)" value={form.failure_rate_threshold} onChange={(v) => setForm({ ...form, failure_rate_threshold: v })} />
            <NumField label="Janela (min)" value={form.window_minutes} onChange={(v) => setForm({ ...form, window_minutes: v })} />
            <NumField label="Mín. eventos" value={form.min_events} onChange={(v) => setForm({ ...form, min_events: v })} />
            <NumField label="Esgotados 24h ≥" value={form.exhausted_threshold_24h} onChange={(v) => setForm({ ...form, exhausted_threshold_24h: v })} />
            <NumField label="Backlog pendente ≥" value={form.pending_threshold} onChange={(v) => setForm({ ...form, pending_threshold: v })} />
            <NumField label="Anti-flood (min)" value={form.suppress_minutes} onChange={(v) => setForm({ ...form, suppress_minutes: v })} />
          </div>
          <p className="text-xs text-muted-foreground">O cron avalia a cada 5 min e insere um alerta por tipo/janela quando os limiares são cruzados.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => settings.mutation.mutate(form, { onSuccess: () => setOpen(false) })}
            disabled={settings.mutation.isPending || !s}
          >Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-8" />
    </div>
  );
}

export default function AdminV4CallbacksPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PageTransition>
        <AdminV4CallbacksContent />
      </PageTransition>
    </ProtectedRoute>
  );
}
