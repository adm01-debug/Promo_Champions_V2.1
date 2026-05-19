import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Clock, RotateCw, Loader2, SkipForward, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getEventLabel } from "../webhookHelpers";

interface WebhookDeliveryRowProps {
  delivery: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
  isProcessing: boolean;
  lastResult?: "ok" | "skipped" | "fail";
  requestId?: string;
  onReplay: (id: string) => void;
}

export function WebhookDeliveryRow({
  delivery,
  isSelected,
  onToggle,
  isProcessing,
  lastResult,
  requestId,
  onReplay,
}: WebhookDeliveryRowProps) {
  const { id, event, succeeded, created_at, status, error_message, attempt } = delivery;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 transition-all",
        isSelected ? "border-primary/50 bg-primary/5 shadow-sm" : "bg-card hover:border-border/80",
        lastResult === "ok" && "border-emerald-500/30 bg-emerald-500/5",
        lastResult === "fail" && "border-destructive/30 bg-destructive/5"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(id)}
        disabled={succeeded || isProcessing}
        className="mt-0.5"
      />

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider shrink-0">
            {getEventLabel(event)}
          </Badge>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: ptBR })}
          </span>
          {lastResult && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase font-bold animate-in fade-in zoom-in duration-300",
                lastResult === "ok" && "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
                lastResult === "skipped" && "border-amber-500/50 text-amber-500 bg-amber-500/10",
                lastResult === "fail" && "border-destructive/50 text-destructive bg-destructive/10"
              )}
            >
              {lastResult === "ok" ? "Sucesso" : lastResult === "skipped" ? "Ignorado" : "Falhou"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {succeeded ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          )}
          <span className="truncate text-xs font-medium">
            {succeeded ? "Entrega concluída" : error_message || "Falha na entrega"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Status {status}
          </span>
          <span className="flex items-center gap-1">
            Tentativa {attempt}
          </span>
          {requestId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(requestId);
                    }}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    ID: {requestId.slice(0, 8)}...
                  </button>
                </TooltipTrigger>
                <TooltipContent>Copiar Request ID</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onReplay(id)}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
