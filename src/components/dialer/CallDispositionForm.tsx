import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLogCall } from '@/hooks/dialer/usePowerDialer';
import { DISPOSITION_OPTIONS, OUTCOME_OPTIONS } from './dialerHelpers';

interface Props {
  saleId: string;
  queueItemId: string;
  onComplete: () => void;
}

export const CallDispositionForm = ({ saleId, queueItemId, onComplete }: Props) => {
  const [disposition, setDisposition] = useState<string>('');
  const [outcome, setOutcome] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const log = useLogCall();

  const handleSave = async () => {
    if (!disposition) return;
    await log.mutateAsync({
      sale_id: saleId,
      queue_item_id: queueItemId,
      disposition,
      outcome: outcome || null,
      duration_seconds: duration,
      notes: notes || null,
      next_action_at: nextAction ? new Date(nextAction).toISOString() : null,
    });
    setDisposition(''); setOutcome(''); setDuration(0); setNotes(''); setNextAction('');
    onComplete();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Registrar resultado</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Disposição *</Label>
            <Select value={disposition} onValueChange={setDisposition}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {DISPOSITION_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Resultado</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>
                {OUTCOME_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Duração (s)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div>
            <Label>Próxima ação</Label>
            <Input type="datetime-local" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Notas</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="O que foi conversado..." />
        </div>

        <Button onClick={handleSave} disabled={!disposition || log.isPending} loading={log.isPending} className="w-full">
          Salvar e ir para o próximo
        </Button>
      </CardContent>
    </Card>
  );
};
