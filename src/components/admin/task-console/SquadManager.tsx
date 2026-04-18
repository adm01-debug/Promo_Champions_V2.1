import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSquads, useSquadMembers } from '@/hooks/admin-tasks/useSquads';
import { SQUAD_COLOR_PRESETS } from './taskConsoleHelpers';
import { supabase } from '@/integrations/supabase/client';

interface SimpleSalesperson { id: string; name: string }

export function SquadManager() {
  const { data: squads, isLoading, create, remove, addMember, removeMember } = useSquads();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(SQUAD_COLOR_PRESETS[0]);
  const [activeSquad, setActiveSquad] = useState<string | null>(null);

  const { data: salespeople } = useQuery<SimpleSalesperson[]>({
    queryKey: ['salespeople-min'],
    queryFn: async () => {
      const { data, error } = await supabase.from('salespeople_public').select('id, name').order('name');
      if (error) throw error;
      return (data || []).filter((s): s is SimpleSalesperson => !!s.id && !!s.name);
    },
  });

  const { data: members } = useSquadMembers(activeSquad ?? undefined);
  const memberIds = new Set((members || []).map((m) => m.user_id));

  const handleCreate = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined, color });
    setName(''); setDescription(''); setColor(SQUAD_COLOR_PRESETS[0]); setOpen(false);
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Squads</h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" />Novo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar squad</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: SDRs Elite" /></div>
                <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
                <div>
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SQUAD_COLOR_PRESETS.map((c) => (
                      <button key={c} type="button" onClick={() => setColor(c)}
                        className={`h-7 w-7 rounded-full border-2 ${color === c ? 'border-foreground' : 'border-transparent'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!name.trim() || create.isPending}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="h-[420px]">
          <div className="space-y-2 pr-2">
            <AnimatePresence>
              {(squads || []).map((s) => (
                <motion.div key={s.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card
                    className={`p-3 cursor-pointer transition-all ${activeSquad === s.id ? 'ring-2 ring-primary' : 'hover:bg-muted/40'}`}
                    onClick={() => setActiveSquad(s.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />{s.member_count} membros
                          </p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); remove.mutate(s.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {!squads?.length && <p className="text-sm text-muted-foreground text-center py-6">Nenhum squad criado</p>}
          </div>
        </ScrollArea>
      </div>

      <Card className="lg:col-span-2 p-4">
        {!activeSquad ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Selecione um squad para gerenciar membros</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display">Membros ({memberIds.size})</h4>
              <Badge variant="outline">{(salespeople || []).length} disponíveis</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 pr-2">
                {(salespeople || []).map((s) => {
                  const inSquad = memberIds.has(s.id);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <span className="text-sm">{s.name}</span>
                      {inSquad ? (
                        <Button size="sm" variant="ghost"
                          onClick={() => removeMember.mutate({ squad_id: activeSquad, user_id: s.id })}>
                          <X className="h-3 w-3 mr-1" />Remover
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline"
                          onClick={() => addMember.mutate({ squad_id: activeSquad, user_id: s.id })}>
                          <Plus className="h-3 w-3 mr-1" />Adicionar
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </Card>
    </div>
  );
}
