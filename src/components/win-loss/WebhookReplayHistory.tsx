import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReplayHistoryItem {
  id: string;
  total: number;
  ok: number;
  skipped: number;
  fail: number;
  at: number;
  byEvent: Array<{ event: string; ok: number; skipped: number; fail: number }>;
}

interface WebhookReplayHistoryProps {
  history: ReplayHistoryItem[];
  onClear: () => void;
}

export function WebhookReplayHistory({ history, onClear }: WebhookReplayHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="border-b bg-muted/10 px-4 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
          Histórico do replay
        </h4>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Limpar histórico de replays"
        >
          Limpar
        </button>
      </div>
      <ScrollArea className="max-h-32">
        <ol className="space-y-1.5 pr-2" aria-label="Últimos reenvios">
          {history.map((h) => (
            <li
              key={h.id}
              className="rounded-md border bg-background/60 px-2 py-1.5 text-[10px]"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-foreground">
                    {h.total} {h.total === 1 ? "entrega" : "entregas"}
                  </span>
                  {h.ok > 0 && (
                    <Badge variant="secondary" className="text-[9px] py-0 px-1 bg-success/15 text-success">
                      {h.ok} ok
                    </Badge>
                  )}
                  {h.skipped > 0 && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 text-muted-foreground">
                      {h.skipped} já entregue{h.skipped === 1 ? "" : "s"}
                    </Badge>
                  )}
                  {h.fail > 0 && (
                    <Badge variant="destructive" className="text-[9px] py-0 px-1">
                      {h.fail} falhou
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(h.at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {h.byEvent.map((e) => {
                  const variant: "secondary" | "destructive" | "outline" =
                    e.fail > 0 ? "destructive" : e.ok > 0 ? "secondary" : "outline";
                  const cls =
                    e.fail > 0
                      ? ""
                      : e.ok > 0
                        ? "bg-success/15 text-success"
                        : "text-muted-foreground";
                  return (
                    <Badge
                      key={e.event}
                      variant={variant}
                      className={cn("text-[9px] py-0 px-1 font-mono", cls)}
                    >
                      {e.event}
                      {e.ok > 0 && <span className="ml-1 opacity-80">✓{e.ok}</span>}
                      {e.skipped > 0 && <span className="ml-1 opacity-80">↷{e.skipped}</span>}
                      {e.fail > 0 && <span className="ml-1 opacity-80">✕{e.fail}</span>}
                    </Badge>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
}
