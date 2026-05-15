import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Clock, RotateCw, Loader2, Copy, SkipForward } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WebhookDeliveryItemProps {
  delivery: {
    id: string;
    event: string;
    status: number | null;
    succeeded: boolean;
    attempt: number;
    duration_ms: number;
    error_message: string | null;
    created_at: string;
  };
  isProcessing: boolean;
  isChecked: boolean;
  checkboxDisabled: boolean;
  pendingId: string | null;
  isReplaying: boolean;
  result?: string;
  reqId?: string;
  maxReplay: number;
  atLimit: boolean;
  toggleOne: (id: string) => void;
  handleReplay: (id: string) => void;
}

export function WebhookDeliveryItem({
  delivery: d,
  isProcessing,
  isChecked,
  checkboxDisabled,
  pendingId,
  isReplaying,
  result,
  reqId,
  maxReplay,
  atLimit,
  toggleOne,
  handleReplay
}: WebhookDeliveryItemProps) {
  const Icon = d.succeeded ? CheckCircle2 : XCircle;
  const color = d.succeeded ? "text-emerald-500" : "text-destructive";

  return (
    <li
      aria-busy={isProcessing}
      className={cn(
        "relative flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2 transition-colors overflow-hidden",
        isProcessing && "bg-primary/5 border-primary/30",
      )}
    >
      {d.succeeded ? (
        <span className="w-4 shrink-0" aria-hidden />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="mt-0.5 shrink-0">
              <Checkbox
                checked={isChecked}
                disabled={checkboxDisabled}
                onCheckedChange={() => toggleOne(d.id)}
                aria-label={`Selecionar entrega de ${d.event}`}
              />
            </span>
          </TooltipTrigger>
          {atLimit && !isChecked && (
            <TooltipContent side="right" className="text-xs">
              Máximo de {maxReplay} por reenvio — desmarque uma entrega para selecionar outra.
            </TooltipContent>
          )}
        </Tooltip>
      )}
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
        {(isProcessing || result) && (
          <div
            className="mt-1.5"
            role="status"
            aria-live="polite"
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Reenviando…
              </span>
            ) : result === "ok" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2 py-0.5 text-[10px] font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Reenviado
              </span>
            ) : result === "skipped" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-medium">
                <SkipForward className="h-3 w-3" />
                Já entregue
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive px-2 py-0.5 text-[10px] font-medium">
                  <XCircle className="h-3 w-3" />
                  Falhou
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-1 h-5 px-2 text-[10px] gap-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleReplay(d.id)}
                  disabled={d.succeeded || isProcessing}
                  aria-label={`Tentar reenviar novamente entrega ${d.event}`}
                >
                  <RotateCw className="h-2.5 w-2.5" />
                  Tentar novamente
                </Button>
              </>
            )}
            {reqId && !isProcessing && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(reqId).then(
                        () => toast.success("requestId copiado"),
                        () => toast.error("Falha ao copiar"),
                      );
                    }}
                    className="ml-1 inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label={`Copiar requestId ${reqId}`}
                  >
                    <span className="opacity-70">req</span>
                    <span>{reqId.slice(0, 8)}</span>
                    <Copy className="h-2.5 w-2.5 opacity-60" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-mono">
                  {reqId}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <span aria-busy={isProcessing}>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 shrink-0"
              disabled={d.succeeded || isProcessing || isReplaying}
              onClick={() => handleReplay(d.id)}
              aria-label={
                isProcessing
                  ? "Reenvio em andamento para esta entrega"
                  : isReplaying
                    ? "Aguardando reenvio em andamento concluir"
                    : "Reenviar entrega"
              }
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCw className="h-3 w-3" />
              )}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          {d.succeeded
            ? "Já entregue com sucesso"
            : isProcessing
              ? "Reenvio em andamento — aguarde…"
              : "Reenviar este evento"}
        </TooltipContent>
      </Tooltip>
      {isProcessing && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-pulse"
        />
      )}
    </li>
  );
}
