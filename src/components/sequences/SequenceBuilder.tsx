import { useState } from 'react';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Inbox } from 'lucide-react';
import {
  useSequenceSteps,
  useDeleteSequenceStep,
  type SequenceStep,
} from '@/hooks/sequences/useSequenceSteps';
import { useSequence } from '@/hooks/sequences/useSequences';
import { SequenceStepCard } from './SequenceStepCard';
import { SequenceStepDialog } from './SequenceStepDialog';
import { SendTimeOptimizationToggle } from './SendTimeOptimizationToggle';
import { AutoPauseSettingsCard } from './AutoPauseSettingsCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  sequenceId: string;
}

export function SequenceBuilder({ sequenceId }: Props) {
  const { data: sequence } = useSequence(sequenceId);
  const { data: steps, isLoading } = useSequenceSteps(sequenceId);
  const del = useDeleteSequenceStep();
  const [editing, setEditing] = useState<SequenceStep | null>(null);
  const [open, setOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<SequenceStep | null>(null);

  const nextOrder = steps?.length ?? 0;

  const handleNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const handleEdit = (s: SequenceStep) => {
    setEditing(s);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sequence && (
        <>
          <SendTimeOptimizationToggle
            sequenceId={sequence.id}
            enabled={sequence.send_time_optimization ?? true}
          />
          <AutoPauseSettingsCard
            sequenceId={sequence.id}
            autoPauseOnReply={sequence.auto_pause_on_reply ?? true}
            autoPauseOnBounce={sequence.auto_pause_on_bounce ?? true}
          />
        </>
      )}
      {(steps ?? []).length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum passo ainda. Comece criando o primeiro.
          </p>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Criar primeiro passo
          </Button>
        </Card>
      ) : (
        <>
          {(steps ?? []).map((s, i) => (
            <SequenceStepCard
              key={s.id}
              step={s}
              index={i}
              onEdit={() => handleEdit(s)}
              onDelete={() => setStepToDelete(s)}
            />
          ))}
          <Button variant="outline" className="w-full" onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar passo
          </Button>
        </>
      )}
      {open && (
        <SequenceStepDialog
          open={open}
          onOpenChange={setOpen}
          sequenceId={sequenceId}
          step={editing}
          nextOrder={nextOrder}
        />
      )}

      <DeleteConfirmDialog
        open={!!stepToDelete}
        onOpenChange={open => !open && setStepToDelete(null)}
        onConfirm={() => {
          if (!stepToDelete) return;
          del.mutate(
            { id: stepToDelete.id, sequence_id: sequenceId },
            { onSuccess: () => setStepToDelete(null) }
          );
        }}
        title="Excluir este passo da sequencia?"
        description={
          stepToDelete
            ? `O passo ${stepToDelete.step_order}${
                stepToDelete.subject ? ` ("${stepToDelete.subject.slice(0, 60)}")` : ''
              } sai da sequencia. Leads que ja passaram por ele mantem o historico.`
            : ''
        }
        isDeleting={del.isPending}
      />
    </div>
  );
}
