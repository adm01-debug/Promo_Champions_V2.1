import React, { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Swords, Users, Trophy, Zap, Calendar } from 'lucide-react';
import { useSalesBattles } from '@/hooks/useSalesBattles';
import { useSalespeople } from '@/hooks/sales/useSalespeople';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


interface CreateBattleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBattleDialog: FC<CreateBattleDialogProps> = ({ open, onOpenChange }) => {
  const { createBattle } = useSalesBattles();
  const { data: salespeople = [] } = useSalespeople();
  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState('revenue');
  const [battleType, setBattleType] = useState('1v1');
  const [xpReward, setXpReward] = useState('100');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [endsAt, setEndsAt] = useState('');

  const { data: currentSp } = useQuery({
    queryKey: ['battle-current-sp'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('salespeople').select('id').eq('auth_user_id', user.id).maybeSingle();
      return data;
    },
  });

  const handleCreate = () => {
    if (!currentSp?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    if (selectedParticipants.length < 2) {
      toast.error('Selecione pelo menos 2 gladiadores');
      return;
    }

    if (!endsAt) {
      toast.error('Selecione uma data de encerramento');
      return;
    }

    createBattle.mutate({
      title,
      battle_type: battleType,
      metric,
      ends_at: new Date(endsAt).toISOString(),
      xp_reward: parseInt(xpReward),
      created_by: currentSp.id,
      participant_ids: selectedParticipants,
    }, {
      onSuccess: () => {
        toast.success('Batalha épica iniciada!');
        onOpenChange(false);
        setTitle('');
        setSelectedParticipants([]);
        setEndsAt('');
      },
      onError: () => toast.error('Erro ao iniciar batalha'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass border-border/40 card-elevated">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display font-black tracking-tighter italic gradient-text uppercase">
            <div className="p-2 rounded-xl bg-primary/10 shadow-lg">
              <Swords className="h-6 w-6 text-primary animate-pulse-subtle" />
            </div>
            Nova Batalha de Elite
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Operação</Label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ex: Operação Over-Achievement" 
              className="font-black italic uppercase tracking-tight"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Métrica Alvo</Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="font-bold italic uppercase text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue" className="text-xs font-bold uppercase italic">Receita (R$)</SelectItem>
                  <SelectItem value="deals" className="text-xs font-bold uppercase italic">Deals Fechados</SelectItem>
                  <SelectItem value="calls" className="text-xs font-bold uppercase italic">Ligações</SelectItem>
                  <SelectItem value="meetings" className="text-xs font-bold uppercase italic">Reuniões</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Formato de Combate</Label>
              <Select value={battleType} onValueChange={setBattleType}>
                <SelectTrigger className="font-bold italic uppercase text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1v1" className="text-xs font-bold uppercase italic">Duelo 1v1</SelectItem>
                  <SelectItem value="team" className="text-xs font-bold uppercase italic">Confronto Equipes</SelectItem>
                  <SelectItem value="ffa" className="text-xs font-bold uppercase italic">Todos vs Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Selecionar Gladiadores</Label>
            <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 scrollbar-hide">
              {salespeople.map(sp => (
                <button
                  key={sp.id}
                  onClick={() => {
                    setSelectedParticipants(prev => 
                      prev.includes(sp.id) ? prev.filter(id => id !== sp.id) : [...prev, sp.id]
                    )
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 group ${
                    selectedParticipants.includes(sp.id)
                      ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-lg shadow-primary/5'
                      : 'border-border/10 bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[8px] font-black ${
                    selectedParticipants.includes(sp.id) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {selectedParticipants.includes(sp.id) ? '✓' : sp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight truncate ${
                    selectedParticipants.includes(sp.id) ? 'text-primary' : 'text-muted-foreground/80'
                  }`}>{sp.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bounty (XP)</Label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rank-gold animate-pulse" />
                <Input 
                  type="number" 
                  value={xpReward} 
                  onChange={e => setXpReward(e.target.value)} 
                  className="pl-9 font-black italic text-rank-gold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deadline</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/70" />
                <Input 
                  type="datetime-local" 
                  value={endsAt} 
                  onChange={e => setEndsAt(e.target.value)} 
                  className="pl-9 font-black text-xs"
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-sm italic rounded-2xl group/btn" 
            onClick={handleCreate} 
            disabled={!title.trim() || createBattle.isPending}
          >
            <Swords className="h-5 w-5 mr-3 group-hover/btn:rotate-12 transition-transform" /> 
            {createBattle.isPending ? 'Mobilizando Gladiadores...' : 'Iniciar Combate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
