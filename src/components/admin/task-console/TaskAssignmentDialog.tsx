import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus } from 'lucide-react';
import { useTaskCatalog } from '@/hooks/admin-tasks/useTaskCatalog';
import { useTaskAssignments } from '@/hooks/admin-tasks/useTaskAssignments';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimpleSalesperson { id: string; name: string }

export function TaskAssignmentDialog() {
  const [open, setOpen] = useState(false);
  const [catalogId, setCatalogId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: catalog } = useTaskCatalog();
  const { assign } = useTaskAssignments();

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

  const handleAssign = async () => {
    if (!catalogId || selected.size === 0) return;
    await assign.mutateAsync({
      catalog_id: catalogId,
      assigned_to_list: Array.from(selected),
      due_date: dueDate || null,
    });
    setOpen(false);
    setSelected(new Set());
    setCatalogId('');
    setDueDate('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus className="mr-2 h-4 w-4" /> Atribuir tarefa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Atribuir tarefa a vendedores</DialogTitle></DialogHeader>
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
          <div>
            <Label>Data de entrega (opcional)</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label>Vendedores ({selected.size} selecionados)</Label>
            <ScrollArea className="h-48 rounded-lg border p-2">
              <div className="space-y-1">
                {(salespeople || []).map((s) => (
                  <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!catalogId || selected.size === 0 || assign.isPending}>Atribuir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
