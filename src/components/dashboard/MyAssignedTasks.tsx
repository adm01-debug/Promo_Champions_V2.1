import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTaskAssignments } from '@/hooks/admin-tasks/useTaskAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_LABELS, STATUS_TONES, DIFFICULTY_TONES, DIFFICULTY_LABELS, type TaskDifficulty } from '@/components/admin/task-console/taskConsoleHelpers';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function MyAssignedTasks() {
  const { user } = useAuth();
  const { data, isLoading, updateStatus } = useTaskAssignments({ userId: user?.id });
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const active = (data || []).filter((a) => ['pending', 'in_progress', 'submitted'].includes(a.status));

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!active.length) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg">Minhas Tarefas</h3>
          <p className="text-sm text-muted-foreground">Atribuídas pelo gestor</p>
        </div>
        <Badge variant="secondary">{active.length} ativa(s)</Badge>
      </div>

      <div className="space-y-2">
        {active.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium truncate">{a.catalog?.title}</p>
                {a.catalog?.difficulty && (
                  <Badge variant="outline" className={DIFFICULTY_TONES[a.catalog.difficulty as TaskDifficulty]}>
                    {DIFFICULTY_LABELS[a.catalog.difficulty as TaskDifficulty]}
                  </Badge>
                )}
                <Badge variant="outline" className={STATUS_TONES[a.status]}>{STATUS_LABELS[a.status]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {a.catalog?.xp_reward} XP {a.due_date && `• Entrega: ${a.due_date}`}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              {a.status === 'pending' && (
                <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: a.id, status: 'in_progress' })}>
                  <PlayCircle className="mr-1 h-4 w-4" /> Iniciar
                </Button>
              )}
              {a.status !== 'submitted' && (
                <Button size="sm" onClick={() => { setSubmitting(a.id); setNote(''); }}>
                  <Send className="mr-1 h-4 w-4" /> Submeter
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!submitting} onOpenChange={(o) => !o && setSubmitting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submeter tarefa para revisão</DialogTitle></DialogHeader>
          <div>
            <Label>Nota da entrega (opcional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Descreva o que foi feito…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitting(null)}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (submitting) {
                  await updateStatus.mutateAsync({ id: submitting, status: 'submitted', note });
                  setSubmitting(null);
                }
              }}
            >Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
