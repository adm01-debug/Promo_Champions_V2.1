import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Copy, User2, Clock, Hash, ListChecks } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useReplayInvocations, type ReplayInvocation } from "@/hooks/win-loss/useReplayInvocations";

function copy(text: string, label: string) {
  void navigator.clipboard?.writeText(text).then(
    () => toast.success(`${label} copiado`),
    () => toast.error("Falha ao copiar"),
  );
}

function InvocationCard({ inv }: { inv: ReplayInvocation }) {
  const successRate = inv.item_count > 0
    ? Math.round((inv.succeeded_count / inv.item_count) * 100)
    : 0;
  const tone = inv.failed_count === 0 ? "success" : inv.succeeded_count === 0 ? "destructive" : "warning";
  const toneClass =
    tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-amber-500";

  return (
    <li className="rounded-lg border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="capitalize">{inv.source}</Badge>
            <Badge variant="secondary" className="gap-1">
              <ListChecks className="h-3 w-3" />
              {inv.item_count} {inv.item_count === 1 ? "item" : "itens"}
            </Badge>
            <span className={`font-semibold ${toneClass}`}>{successRate}% sucesso</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User2 className="h-3 w-3 shrink-0" />
            <span className="truncate" title={inv.actor_email ?? inv.actor_user_id}>
              {inv.actor_email ?? inv.actor_user_id.slice(0, 8) + "…"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
          <span title={format(new Date(inv.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}>
            <Clock className="h-3 w-3 inline mr-1" />
            {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true, locale: ptBR })}
          </span>
          {typeof inv.duration_ms === "number" && (
            <span>{(inv.duration_ms / 1000).toFixed(2)}s</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-success/10 text-success py-1.5">
          <p className="font-semibold">{inv.succeeded_count}</p>
          <p className="text-[10px] uppercase tracking-wide opacity-80">Sucesso</p>
        </div>
        <div className="rounded-md bg-destructive/10 text-destructive py-1.5">
          <p className="font-semibold">{inv.failed_count}</p>
          <p className="text-[10px] uppercase tracking-wide opacity-80">Falha</p>
        </div>
        <div className="rounded-md bg-muted py-1.5 text-muted-foreground">
          <p className="font-semibold">{inv.skipped_count}</p>
          <p className="text-[10px] uppercase tracking-wide opacity-80">Ignorado</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Hash className="h-3 w-3 shrink-0" />
        <code className="truncate flex-1">{inv.request_id}</code>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5"
          onClick={() => copy(inv.request_id, "requestId")}
          aria-label="Copiar requestId"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </li>
  );
}

export function ReplayInvocationsPanel() {
  const { data, isLoading } = useReplayInvocations(200);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((i) =>
      (i.actor_email ?? "").toLowerCase().includes(q) ||
      i.actor_user_id.toLowerCase().includes(q) ||
      i.request_id.toLowerCase().includes(q),
    );
  }, [data, filter]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
          <span className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Auditoria de invocações
          </span>
          <Badge variant="outline">{filtered.length} registros</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por email, user_id ou requestId…"
            className="pl-8"
            aria-label="Filtrar auditoria de invocações"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando…
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-6 text-center">
            Nenhuma invocação registrada.
          </p>
        ) : (
          <ScrollArea className="max-h-[640px] pr-2">
            <ol className="space-y-2" aria-label="Histórico de invocações de replay">
              {filtered.map((inv) => (
                <InvocationCard key={inv.id} inv={inv} />
              ))}
            </ol>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
