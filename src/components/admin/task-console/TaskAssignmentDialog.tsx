import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserPlus } from 'lucide-react';
import { useTaskCatalog } from '@/hooks/admin-tasks/useTaskCatalog';
import { useTaskAssignments } from '@/hooks/admin-tasks/useTaskAssignments';
import { useSquads } from '@/hooks/admin-tasks/useSquads';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RECURRENCE_LABELS, type RecurrenceRule } from './taskConsoleHelpers';

interface SimpleSalesperson { id: string; name: string }

export function TaskAssignmentDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'individual' | 'squad'>('individual');
  const [catalogId, setCatalogId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [recurrence, setRecurrence] = useState<string>('none');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [squadId, setSquadId] = useState<string>('');
  const { data: catalog } = useTaskCatalog();
  const { assign } = useTaskAssignments();
  const { data: squads, assignToSquad } = useSquads();

  const { data: salespeople } = useQuery<SimpleSalesperson[]>({
    queryKey: ['salespeople-min'],
    queryFn: async () => {
      const { data, error } = await supabase.from('salespeople_public').select('id, name').order('name');
      if (error) throw error;
      return (data || []).filter((s): s is SimpleSalesperson => !!s.id && !!s.name);
    },
    enabled: open,
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const reset = () => {
    setOpen(false); setSelected(new Set()); setCatalogId(''); setDueDate('');
    setRecurrence('none'); setSquadId(''); setMode('individual');
  };

  const handleAssign = async () => {
    if (!catalogId) return;
    const rec = recurrence === 'none' ? null : recurrence;
    if (mode === 'squad') {
      if (!squadId) return;
      await assignToSquad.mutateAsync({ catalog_id: catalogId, squad_id: squadId, due_date: dueDate || null, recurrence: rec });
    } else {
      if (selected.size === 0) return;
      await assign.mutateAsync({ catalog_id: catalogId, assigned_to_list: Array.from(selected), due_date: dueDate || null });
    }
    reset();
  };

  const canSubmit = catalogId && (mode === 'individual' ? selected.size > 0 : !!squadId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus className="mr-2 h-4 w-4" /> Atribuir tarefa</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Atribuir tarefa</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Tarefa do catálogo</Label>
            <Select value={catalogId} onValueChange={setCatalogId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {(catalog || []).filter((c) => c.active).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title} ({c.xp_reward} XP)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data de entrega</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label>Recorrência</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem recorrência</SelectItem>
                  {(Object.keys(RECURRENCE_LABELS) as RecurrenceRule[]).map((r) => (
                    <SelectItem key={r} value={r}>{RECURRENCE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'individual' | 'squad')}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="individual">Por vendedor</TabsTrigger>
              <TabsTrigger value="squad">Por squad</TabsTrigger>
            </TabsList>
            <TabsContent value="individual" className="mt-3">
              <Label>Vendedores ({selected.size} selecionados)</Label>
              <ScrollArea className="h-48 rounded-lg border p-2 mt-1">
                <div className="space-y-1">
                  {(salespeople || []).map((s) => (
                    <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer">
                      <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                      <span className="text-sm">{s.name}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="squad" className="mt-3">
              <Label>Squad</Label>
              <Select value={squadId} onValueChange={setSquadId}>
                <SelectTrigger><SelectValue placeholder="Selecione um squad…" /></SelectTrigger>
                <SelectContent>
                  {(squads || []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.member_count} membros)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                A tarefa será atribuída automaticamente a todos os membros do squad.
              </p>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={reset}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!canSubmit || assign.isPending || assignToSquad.isPending}>
            Atribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
