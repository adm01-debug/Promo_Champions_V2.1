import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Webhook, Plus, Trash2, History } from "lucide-react";
import { useWebhookSubscriptions } from "@/hooks/win-loss/useWebhookSubscriptions";
import { useWebhookAlerts, activeAlertsBySubscription, type WebhookAlert } from "@/hooks/win-loss/useWebhookAlerts";
import { WebhookDeliveriesDrawer } from "./WebhookDeliveriesDrawer";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";


const ALL_EVENTS = ["critical_pattern", "anomaly", "perf_drop"] as const;

export function WebhookSubscriptionsPanel() {
  const { list, create, toggle, remove, isCreating } = useWebhookSubscriptions();
  const { data: alerts } = useWebhookAlerts();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([...ALL_EVENTS]);
  const [deliveriesFor, setDeliveriesFor] = useState<{ id: string; url: string } | null>(null);

  const alertsBySub = useMemo(() => activeAlertsBySubscription(alerts ?? []), [alerts]);

  const submit = () => {
    if (!url.trim() || !/^https?:\/\//.test(url)) return;
    create({ url: url.trim(), events });
    setUrl("");
  };

  const toggleEvent = (e: string) => {
    setEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Webhook className="h-4 w-4 text-primary" aria-hidden />
          Webhooks de eventos críticos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="https://seu-endpoint.com/webhook"
            value={url}
            onChange={e => setUrl(e.target.value)}
            type="url"
            aria-label="URL do webhook"
          />
          <div className="flex flex-wrap gap-1.5">
            {ALL_EVENTS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => toggleEvent(e)}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                  events.includes(e) ? "bg-primary/15 border-primary/40 text-primary" : "bg-muted border-muted text-muted-foreground"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={submit} disabled={isCreating || !url.trim()}>
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        </div>

        <div className="space-y-1.5">
          {(list.data ?? []).map(w => (
            <div key={w.id} className="flex items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5">
              <Switch checked={w.active} onCheckedChange={(v) => toggle({ id: w.id, active: v })} aria-label="Ativar webhook" />
              <div className="min-w-0 flex-1">
                <p className="text-xs truncate">{w.url}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {w.events.map(e => <Badge key={e} variant="outline" className="text-[9px] py-0 px-1.5">{e}</Badge>)}
                  {w.last_status && <Badge variant={w.last_status >= 200 && w.last_status < 300 ? "secondary" : "destructive"} className="text-[9px] py-0 px-1.5">HTTP {w.last_status}</Badge>}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setDeliveriesFor({ id: w.id, url: w.url })}
                aria-label="Ver entregas"
                title="Ver histórico de entregas"
              >
                <History className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => remove(w.id)} aria-label="Remover webhook">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {list.data && !list.data.length && (
            <p className="text-xs text-muted-foreground py-2 text-center">Nenhum webhook configurado.</p>
          )}
        </div>
      </CardContent>
      <WebhookDeliveriesDrawer
        subscriptionId={deliveriesFor?.id ?? null}
        url={deliveriesFor?.url}
        open={!!deliveriesFor}
        onOpenChange={(v) => !v && setDeliveriesFor(null)}
      />
    </Card>
  );
}
