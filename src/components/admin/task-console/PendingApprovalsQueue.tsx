import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X } from 'lucide-react';
import { useTaskAssignments } from '@/hooks/admin-tasks/useTaskAssignments';
import { usePendingApprovals } from '@/hooks/admin-tasks/usePendingApprovals';
import { useBulkApprovals } from '@/hooks/admin-tasks/useBulkApprovals';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BulkActionBar } from './BulkActionBar';

export function PendingApprovalsQueue() {
  const { data, isLoading } = useTaskAssignments();
  const { approve, reject } = usePendingApprovals();
  const { bulkApprove, bulkReject } = useBulkApprovals();
  const [xpOverride, setXpOverride] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pending = (data || []).filter((a) => a.status === 'submitted');

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (!pending.length) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Nenhuma submissão aguardando revisão. ✨</p>
      </Card>
    );
  }

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    setSelected(selected.size === pending.length ? new Set() : new Set(pending.map((p) => p.id)));
  };

  const handleBulkApprove = async () => {
    const overrides: Record<string, number> = {};
    for (const id of selected) {
      const v = xpOverride[id];
      if (v) overrides[id] = Number(v);
    }
    await bulkApprove.mutateAsync({ ids: Array.from(selected), xpOverrides: overrides });
    setSelected(new Set());
  };

  const handleBulkReject = async () => {
    await bulkReject.mutateAsync({ ids: Array.from(selected) });
    setSelected(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Checkbox checked={selected.size === pending.length} onCheckedChange={toggleAll} />
        <span className="text-sm text-muted-foreground">Selecionar todos ({pending.length})</span>
      </div>
      {pending.map((a) => {
        const baseXp = a.catalog?.xp_reward || 0;
        const xpVal = Number(xpOverride[a.id] ?? baseXp);
        return (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{a.catalog?.title || 'Tarefa'}</h4>
                    <Badge variant="outline">{a.catalog?.category}</Badge>
                  </div>
                  {a.submission_note && (
                    <p className="text-sm text-muted-foreground italic mb-2">"{a.submission_note}"</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Submetido em {format(new Date(a.created_at), "dd 'de' MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    className="w-20 h-9"
                    value={xpOverride[a.id] ?? String(baseXp)}
                    onChange={(e) => setXpOverride({ ...xpOverride, [a.id]: e.target.value })}
                  />
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
                <Button size="sm" onClick={() => approve.mutate({ assignmentId: a.id, xpAmount: xpVal })} disabled={approve.isPending}>
                  <Check className="mr-1 h-4 w-4" /> Aprovar
                </Button>
                <Button size="sm" variant="outline" onClick={() => reject.mutate({ assignmentId: a.id })} disabled={reject.isPending}>
                  <X className="mr-1 h-4 w-4" /> Rejeitar
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
      <BulkActionBar
        count={selected.size}
        onApprove={handleBulkApprove}
        onReject={handleBulkReject}
        onClear={() => setSelected(new Set())}
        loading={bulkApprove.isPending || bulkReject.isPending}
      />
    </div>
  );
}
