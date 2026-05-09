import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Plus, CheckCircle2, Trash2, Phone, Users, Bell, ListChecks, Repeat, ShoppingCart } from "lucide-react";
import { useAgendaEvents, useCreateAgendaEvent, useCompleteAgendaEvent, useDeleteAgendaEvent, type AgendaEvent, type AgendaEventType, type AgendaEventPriority, type AgendaEventStatus } from "@/hooks/useAgendaEvents";
import { useClients } from "@/hooks/useClients";
import { useSalesData } from "@/hooks/useSalesData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeIcon: Record<AgendaEventType, React.ReactNode> = {
  reminder: <Bell className="h-4 w-4" />,
  follow_up: <Repeat className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  task: <ListChecks className="h-4 w-4" />,
};

const typeLabel: Record<AgendaEventType, string> = {
  reminder: "Lembrete",
  follow_up: "Follow-up",
  meeting: "Reunião",
  call: "Ligação",
  task: "Tarefa",
};

const priorityVariant: Record<AgendaEventPriority, "default" | "secondary" | "outline" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

const priorityLabel: Record<AgendaEventPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const sectionConfig: { key: AgendaEventStatus; label: string; tone: string }[] = [
  { key: "pending", label: "Pendentes", tone: "text-streak" },
  { key: "in_progress", label: "Em andamento", tone: "text-accent" },
  { key: "completed", label: "Concluídos", tone: "text-success" },
  { key: "cancelled", label: "Cancelados", tone: "text-muted-foreground" },
];

function NewEventDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<AgendaEventType>("reminder");
  const [priority, setPriority] = useState<AgendaEventPriority>("medium");
  const [scheduledAt, setScheduledAt] = useState("");
  const [clientId, setClientId] = useState<string>("none");
  const [saleId, setSaleId] = useState<string>("none");
  
  const create = useCreateAgendaEvent();
  const { data: clients } = useClients();
  const { data: sales } = useSalesData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt) return;
    create.mutate(
      {
        title,
        description: description || undefined,
        event_type: eventType,
        priority,
        scheduled_at: new Date(scheduledAt).toISOString(),
        client_id: clientId !== "none" ? clientId : undefined,
        sale_id: saleId !== "none" ? saleId : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setDescription("");
          setEventType("reminder");
          setPriority("medium");
          setScheduledAt("");
          setClientId("none");
          setSaleId("none");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" />Novo evento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo evento na agenda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="ev-title">Título</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="ev-desc">Descrição</Label>
            <Textarea id="ev-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as AgendaEventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(typeLabel) as AgendaEventType[]).map((t) => (
                    <SelectItem key={t} value={t}>{typeLabel[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as AgendaEventPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(priorityLabel) as AgendaEventPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>{priorityLabel[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Vincular Cliente</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clients?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vincular Deal / Venda</Label>
              <Select value={saleId} onValueChange={setSaleId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Deal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {sales?.map((s) => (
                    <SelectItem key={s.fullId} value={s.fullId}>{s.cliente} - {s.produto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="ev-when">Data e hora</Label>
            <Input id="ev-when" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? "Salvando…" : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EventCard({ event }: { event: AgendaEvent }) {
  const complete = useCompleteAgendaEvent();
  const remove = useDeleteAgendaEvent();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-primary">{typeIcon[event.event_type]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="font-semibold truncate">{event.title}</p>
              <Badge variant={priorityVariant[event.priority]}>{priorityLabel[event.priority]}</Badge>
            </div>
            {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              {typeLabel[event.event_type]} · {format(new Date(event.scheduled_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex gap-1">
            {event.status !== "completed" && event.status !== "cancelled" && (
              <Button size="icon" variant="ghost" onClick={() => complete.mutate(event.id)} aria-label="Concluir">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => remove.mutate(event.id)} aria-label="Remover">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Agenda() {
  const { data: events = [], isLoading } = useAgendaEvents();
  const grouped = useMemo(() => {
    const g: Record<AgendaEventStatus, AgendaEvent[]> = { pending: [], in_progress: [], completed: [], cancelled: [] };
    for (const e of events) g[e.status].push(e);
    return g;
  }, [events]);

  return (
    <>
      <Helmet>
        <title>Agenda Comercial | Promo Champions</title>
        <meta name="description" content="Lembretes, follow-ups e reuniões organizados por status." />
      </Helmet>

      <main className="container max-w-6xl py-6 space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-page-title flex items-center gap-2"><CalendarClock className="h-7 w-7 text-primary" />Agenda Comercial</h1>
            <p className="text-sm text-muted-foreground">Lembretes, follow-ups e reuniões</p>
          </div>
          <NewEventDialog />
        </header>

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {sectionConfig.map((section) => (
              <section key={section.key} aria-label={section.label}>
                <h2 className={`text-sm font-semibold mb-3 ${section.tone}`}>
                  {section.label} ({grouped[section.key].length})
                </h2>
                {grouped[section.key].length === 0 ? (
                  <Card className="p-6 text-center text-sm text-muted-foreground">Nenhum evento</Card>
                ) : (
                  <div className="space-y-3">
                    {grouped[section.key].map((e) => <EventCard key={e.id} event={e} />)}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
