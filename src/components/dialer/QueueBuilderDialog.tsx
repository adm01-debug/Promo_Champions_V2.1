import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateQueue } from '@/hooks/dialer/usePowerDialer';
import { STRATEGY_OPTIONS } from './dialerHelpers';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QueueBuilderDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState('');
  const [strategy, setStrategy] = useState<'hybrid' | 'score' | 'recency' | 'send_time'>('hybrid');
  const [minScore, setMinScore] = useState(0);
  const create = useCreateQueue();

  const handleCreate = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({
      name: name.trim(),
      priority_strategy: strategy,
      filter: { min_score: minScore },
    });
    setName(''); setStrategy('hybrid'); setMinScore(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova fila de discagem</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Hot leads desta semana" />
          </div>
          <div>
            <Label>Estratégia de priorização</Label>
            <Select value={strategy} onValueChange={(v) => setStrategy(v as typeof strategy)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STRATEGY_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Score mínimo</Label>
            <Input type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!name.trim() || create.isPending} loading={create.isPending}>
            Criar fila
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
