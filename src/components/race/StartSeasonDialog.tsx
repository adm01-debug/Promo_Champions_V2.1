import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStartRaceSeason } from '@/hooks/race/useStartRaceSeason';
import { Flag } from 'lucide-react';

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export function StartSeasonDialog({ open, onOpenChange }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const [name, setName] = useState('Nova Temporada 🏁');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(in30);
  const [goal, setGoal] = useState('100000');
  const [track, setTrack] = useState<'oval' | 'circuit' | 'street'>('oval');
  const { mutate, isPending } = useStartRaceSeason();

  const submit = () => {
    mutate(
      { name, start_date: startDate, end_date: endDate, goal_amount: Number(goal), track_type: track },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-primary" /> Iniciar nova temporada</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Início</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Fim</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Meta total (R$)</Label>
            <Input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div>
            <Label>Tipo de pista</Label>
            <Select value={track} onValueChange={(v) => setTrack(v as 'oval' | 'circuit' | 'street')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="oval">Oval</SelectItem>
                <SelectItem value="circuit">Circuito</SelectItem>
                <SelectItem value="street">Rua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={isPending}>{isPending ? 'Iniciando…' : 'Largada! 🏁'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
