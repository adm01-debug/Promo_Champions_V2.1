import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, RotateCcw, Archive, Eye, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWebhookDeadLetters, type DeadLetter, type DeadLetterStatus } from "@/hooks/win-loss/useWebhookDeadLetters";
import { useUserRoles } from "@/hooks/useUserRoles";
import { BulkReplayConfirmDialog, BULK_REPLAY_HARD_CAP } from "./BulkReplayConfirmDialog";
import { toast } from "sonner";

type DateRange = "all" | "24h" | "7d" | "30d";

interface WebhookDeadLetterPanelProps {
  fullWidth?: boolean;
  filterText?: string;
  filterSubscriptionId?: string;
  filterEvent?: string;
  dateRange?: DateRange;
}

function withinRange(createdAt: string, range: DateRange): boolean {
  if (range === "all") return true;
  const ms = { "24h": 24 * 3600e3, "7d": 7 * 86400e3, "30d": 30 * 86400e3 }[range];
  return Date.now() - new Date(createdAt).getTime() <= ms;
}

export function WebhookDeadLetterPanel({
  fullWidth = false,
  filterText,
  filterSubscriptionId,
  filterEvent,
  dateRange = "all",
}: WebhookDeadLetterPanelProps = {}) {
  const { isAdmin, isLoadingCurrentRole } = useUserRoles();
  const [tab, setTab] = useState<DeadLetterStatus>("pending");
  const { list, replay, archive, isReplaying, isArchiving } = useWebhookDeadLetters(tab);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewOf, setPreviewOf] = useState<DeadLetter | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingReplayIds, setPendingReplayIds] = useState<string[]>([]);


  const rawItems = list.data ?? [];
  const items = useMemo(() => {
    const needle = filterText?.trim().toLowerCase();
    return rawItems.filter((d) => {
      if (filterSubscriptionId && d.subscription_id !== filterSubscriptionId) return false;
      if (filterEvent && d.event !== filterEvent) return false;
      if (!withinRange(d.created_at, dateRange)) return false;
      if (needle) {
        const hay = [
          d.event,
          d.subscription_url ?? "",
          d.request_id ?? "",
          d.last_error ?? "",
        ].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [rawItems, filterText, filterSubscriptionId, filterEvent, dateRange]);
  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  if (isLoadingCurrentRole) return null;
  if (!isAdmin) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  };

  const onReplay = (ids: string[]) => {
    replay(ids);
    setSelected(new Set());
  };
  const requestBulkReplay = (ids: string[]) => {
    if (ids.length === 0) return;
    if (ids.length > BULK_REPLAY_HARD_CAP) {
      toast.error(
        `Limite de ${BULK_REPLAY_HARD_CAP} itens por reenvio (selecionado: ${ids.length}).`,
      );
      return;
    }
    setPendingReplayIds(ids);
    setConfirmOpen(true);
  };
  const onArchive = (ids: string[]) => {
    archive(ids);
    setSelected(new Set());
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
            Webhooks em dead-letter
            {tab === "pending" && items.length > 0 && (
              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">{items.length}</Badge>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => { setTab(v as DeadLetterStatus); setSelected(new Set()); }}>
          <TabsList className="grid grid-cols-3 h-8">
            <TabsTrigger value="pending" className="text-xs">Pendentes</TabsTrigger>
            <TabsTrigger value="replayed" className="text-xs">Reprocessados</TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">Arquivados</TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedIds.length > 0 && tab === "pending" && (
          <div className="flex items-center justify-between rounded-md border bg-primary/5 px-2.5 py-1.5">
            <span className="text-xs text-muted-foreground">{selectedIds.length} selecionado(s)</span>
            <div className="flex gap-1.5">
              <Button size="sm" variant="default" className="h-7" disabled={isReplaying} onClick={() => requestBulkReplay(selectedIds)}>
                <RotateCcw className="h-3 w-3 mr-1" /> Reprocessar
              </Button>
              <Button size="sm" variant="ghost" className="h-7" disabled={isArchiving} onClick={() => onArchive(selectedIds)}>
                <Archive className="h-3 w-3 mr-1" /> Arquivar
              </Button>
            </div>
          </div>
        )}

        {tab === "pending" && items.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Selecionar todos" />
            <span className="text-[11px] text-muted-foreground">Selecionar todos</span>
          </div>
        )}

        <ScrollArea className={fullWidth ? "max-h-[70vh] pr-2" : "max-h-[420px] pr-2"}>
          <ul className="space-y-1.5" role="list" aria-label="Dead letters">
            {list.isLoading && <li className="text-xs text-muted-foreground py-3 text-center">Carregando…</li>}
            {!list.isLoading && items.length === 0 && (
              <li className="text-xs text-muted-foreground py-6 text-center">
                {tab === "pending" ? "Nenhum webhook em dead-letter." : tab === "replayed" ? "Nenhum reprocessamento bem-sucedido ainda." : "Nada arquivado."}
              </li>
            )}
            {items.map((d) => (
              <li key={d.id} className="flex items-start gap-2 rounded-md border bg-muted/20 px-2.5 py-2">
                {tab === "pending" && (
                  <Checkbox
                    checked={selected.has(d.id)}
                    onCheckedChange={() => toggle(d.id)}
                    aria-label={`Selecionar ${d.event}`}
                    className="mt-0.5"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">{d.event}</Badge>
                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5">HTTP {d.last_status || "—"}</Badge>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">{d.attempts} tentativas</Badge>
                    {d.replay_count > 0 && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 inline-flex items-center gap-0.5">
                        <History className="h-2.5 w-2.5" />
                        {d.replay_count}× replay
                      </Badge>
                    )}
                  </div>
                  {d.subscription_url && (
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">{d.subscription_url}</p>
                  )}
                  {d.last_error && (
                    <p className="text-[11px] text-destructive mt-1 break-words line-clamp-2">{d.last_error}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(d.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPreviewOf(d)} aria-label="Ver payload" title="Ver payload">
                    <Eye className="h-3 w-3" />
                  </Button>
                  {tab === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        disabled={isReplaying}
                        onClick={() => onReplay([d.id])}
                        aria-label="Reprocessar"
                        title="Reprocessar"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        disabled={isArchiving}
                        onClick={() => onArchive([d.id])}
                        aria-label="Arquivar"
                        title="Arquivar"
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>

      <Drawer open={!!previewOf} onOpenChange={(v) => !v && setPreviewOf(null)}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle className="text-base">Payload do dead-letter</DrawerTitle>
            <DrawerDescription className="text-xs">{previewOf?.event} · {previewOf?.subscription_url ?? previewOf?.subscription_id}</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="flex-1 px-4 py-3">
            {previewOf && (
              <>
                <div className="space-y-1 mb-3 text-[11px] text-muted-foreground">
                  <p><span className="font-medium text-foreground">Status final:</span> HTTP {previewOf.last_status || "—"}</p>
                  <p><span className="font-medium text-foreground">Tentativas:</span> {previewOf.attempts}</p>
                  <p><span className="font-medium text-foreground">Latência total:</span> {previewOf.total_latency_ms}ms</p>
                  {previewOf.request_id && <p><span className="font-medium text-foreground">requestId:</span> <code className="text-[10px]">{previewOf.request_id}</code></p>}
                  {previewOf.replay_count > 0 && (
                    <>
                      <p><span className="font-medium text-foreground">Replays:</span> {previewOf.replay_count}</p>
                      {previewOf.last_replay_at && <p><span className="font-medium text-foreground">Último replay:</span> {formatDistanceToNow(new Date(previewOf.last_replay_at), { addSuffix: true, locale: ptBR })} (HTTP {previewOf.last_replay_status ?? "—"})</p>}
                      {previewOf.last_replay_error && <p className="text-destructive">{previewOf.last_replay_error}</p>}
                    </>
                  )}
                </div>
                <pre className="text-[11px] bg-muted/40 rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
{JSON.stringify(previewOf.payload, null, 2)}
                </pre>
              </>
            )}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}
