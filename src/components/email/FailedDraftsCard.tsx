import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { AlertTriangle, Ban, RefreshCw, Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  classifyDraft,
  humanizeError,
  statusLabel,
  statusVariant,
  summarize,
  type DraftFailureStatus,
} from '@/hooks/email/failedDraftsHelpers';
import {
  useDiscardDrafts,
  useFailedDrafts,
  useManualRetryDrafts,
} from '@/hooks/email/useFailedDrafts';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return format(new Date(value), "dd/MM 'às' HH:mm", { locale: ptBR });
}

/** Painel operacional dos rascunhos de campanha que falharam. */
export function FailedDraftsCard() {
  const { data, isLoading, isFetching, refetch } = useFailedDrafts();
  const retryMutation = useManualRetryDrafts();
  const discardMutation = useDiscardDrafts();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const drafts = useMemo(() => data ?? [], [data]);
  const summary = useMemo(() => summarize(drafts), [drafts]);

  const statuses = useMemo(() => {
    const now = new Date();
    const map = new Map<string, DraftFailureStatus>();
    for (const d of drafts) map.set(d.id, classifyDraft(d, now));
    return map;
  }, [drafts]);

  const selectedIds = useMemo(
    () => drafts.filter((d) => selected.has(d.id)).map((d) => d.id),
    [drafts, selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === drafts.length ? new Set() : new Set(drafts.map((d) => d.id))));
  };

  const handleRetry = async () => {
    try {
      const result = await retryMutation.mutateAsync(selectedIds);
      setSelected(new Set());
      toast.success(
        `${result.retried} reenviado(s) de ${result.requested} solicitado(s).` +
          (result.gaveUp > 0 ? ` ${result.gaveUp} bloqueado(s) por supressão.` : ''),
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDiscard = async () => {
    try {
      const count = await discardMutation.mutateAsync(selectedIds);
      setSelected(new Set());
      toast.success(`${count} rascunho(s) encerrado(s) sem reenvio.`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const busy = retryMutation.isPending || discardMutation.isPending;

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" aria-hidden />
              Rascunhos em falha
            </CardTitle>
            <CardDescription>
              Envios de campanha que não foram entregues. O robô reprocessa falhas temporárias a
              cada 15 minutos; use o reenvio manual para antecipar ou forçar uma nova tentativa.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
            Atualizar
          </Button>
        </div>

        {!isLoading && drafts.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="default">{summary.pending} na fila</Badge>
            <Badge variant="outline">{summary.scheduled} agendado(s)</Badge>
            <Badge variant="secondary">{summary.exhausted} esgotado(s)</Badge>
            <Badge variant="destructive">{summary.permanent} definitivo(s)</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`fd-sk-${i}`} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhum rascunho em falha. Todas as campanhas foram entregues.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
              <Checkbox
                id="fd-all"
                checked={selected.size > 0 && selected.size === drafts.length}
                onCheckedChange={toggleAll}
                aria-label="Selecionar todos os rascunhos"
              />
              <label htmlFor="fd-all" className="text-sm text-muted-foreground">
                {selected.size > 0 ? `${selected.size} selecionado(s)` : 'Selecionar todos'}
              </label>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  onClick={() => void handleRetry()}
                  disabled={busy || selectedIds.length === 0}
                >
                  <Send className={cn('h-4 w-4 mr-2', retryMutation.isPending && 'animate-pulse')} />
                  Reenviar agora
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleDiscard()}
                  disabled={busy || selectedIds.length === 0}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Encerrar
                </Button>
              </div>
            </div>

            <ul className="space-y-2">
              {drafts.map((d) => {
                const status = statuses.get(d.id) ?? 'pending';
                return (
                  <li
                    key={d.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card/40 p-3"
                  >
                    <Checkbox
                      checked={selected.has(d.id)}
                      onCheckedChange={() => toggle(d.id)}
                      aria-label={`Selecionar ${d.recipient_email ?? 'rascunho sem destinatário'}`}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {d.recipient_email ?? 'Sem destinatário'}
                        </span>
                        <Badge variant={statusVariant(status)} className="text-[10px]">
                          {statusLabel(status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {d.retry_count} tentativa(s)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{d.subject}</p>
                      <p className="text-xs text-destructive/90">{humanizeError(d.error)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Última falha: {formatDate(d.last_error_at)}
                        {d.next_retry_at ? ` • Próxima tentativa: ${formatDate(d.next_retry_at)}` : ''}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default FailedDraftsCard;
