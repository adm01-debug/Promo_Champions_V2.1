import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Clock, RotateCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWebhookDeliveries } from "@/hooks/win-loss/useWebhookDeliveries";

interface Props {
  subscriptionId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url?: string;
}

export function WebhookDeliveriesDrawer({ subscriptionId, open, onOpenChange, url }: Props) {
  const { data, isLoading, replay, isReplaying } = useWebhookDeliveries(subscriptionId);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleReplay = (id: string) => {
    setPendingId(id);
    replay([id], { onSettled: () => setPendingId(null) });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="text-base">Histórico de entregas</DrawerTitle>
          <DrawerDescription className="truncate text-xs">{url ?? subscriptionId}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 px-4 py-3">
          {isLoading && <p className="text-xs text-muted-foreground py-4 text-center">Carregando…</p>}
          {!isLoading && (data?.length ?? 0) === 0 && (
            <p className="text-xs text-muted-foreground py-6 text-center">Nenhuma entrega registrada ainda.</p>
          )}
          <ul className="space-y-2 pb-6" role="list" aria-label="Entregas de webhook">
            <TooltipProvider delayDuration={200}>
              {(data ?? []).map((d) => {
                const Icon = d.succeeded ? CheckCircle2 : XCircle;
                const color = d.succeeded ? "text-emerald-500" : "text-destructive";
                const isPending = pendingId === d.id && isReplaying;
                return (
                  <li
                    key={d.id}
                    className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2"
                  >
                    <Icon className={`h-4 w-4 mt-0.5 ${color}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">{d.event}</Badge>
                        <Badge
                          variant={d.succeeded ? "secondary" : "destructive"}
                          className="text-[10px] py-0 px-1.5"
                        >
                          HTTP {d.status || "—"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          tentativa {d.attempt}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {d.duration_ms}ms
                        </span>
                      </div>
                      {d.error_message && (
                        <p className="text-[11px] text-destructive mt-1 break-words">{d.error_message}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(d.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 shrink-0"
                            disabled={d.succeeded || isPending || isReplaying}
                            onClick={() => handleReplay(d.id)}
                            aria-label="Reenviar entrega"
                          >
                            {isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCw className="h-3 w-3" />
                            )}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        {d.succeeded ? "Já entregue com sucesso" : "Reenviar este evento"}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </TooltipProvider>
          </ul>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
