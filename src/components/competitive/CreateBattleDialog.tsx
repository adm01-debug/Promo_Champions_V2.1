import React, { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Swords } from 'lucide-react';

interface CreateBattleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBattleDialog: FC<CreateBattleDialogProps> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState('revenue');
  const [battleType, setBattleType] = useState('1v1');
  const [xpReward, setXpReward] = useState('100');

  const handleCreate = () => {
    // TODO: wire to createBattle mutation when participant selection is built
    onOpenChange(false);
    setTitle('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Criar Nova Batalha
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="battle-title">Título</Label>
            <Input id="battle-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Duelo de Sexta" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Métrica</Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="deals">Deals Fechados</SelectItem>
                  <SelectItem value="calls">Ligações</SelectItem>
                  <SelectItem value="meetings">Reuniões</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={battleType} onValueChange={setBattleType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1v1">1v1</SelectItem>
                  <SelectItem value="team">Equipe</SelectItem>
                  <SelectItem value="ffa">Todos vs Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="xp-reward">Recompensa XP</Label>
            <Input id="xp-reward" type="number" value={xpReward} onChange={e => setXpReward(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={!title.trim()}>
            <Swords className="h-4 w-4 mr-2" /> Criar Batalha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
