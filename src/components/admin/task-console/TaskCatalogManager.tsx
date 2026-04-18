import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTaskCatalog, type TaskCatalogItem, type TaskCatalogInput } from '@/hooks/admin-tasks/useTaskCatalog';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_TONES,
  DIFFICULTY_XP_DEFAULTS,
  type TaskDifficulty,
} from './taskConsoleHelpers';
import { Skeleton } from '@/components/ui/skeleton';

const emptyForm: TaskCatalogInput = {
  title: '',
  description: '',
  category: 'general',
  difficulty: 'medium',
  xp_reward: DIFFICULTY_XP_DEFAULTS.medium,
  active: true,
};

export function TaskCatalogManager() {
  const { data, isLoading, create, update, remove } = useTaskCatalog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskCatalogItem | null>(null);
  const [form, setForm] = useState<TaskCatalogInput>(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (item: TaskCatalogItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      difficulty: item.difficulty,
      xp_reward: item.xp_reward,
      active: item.active,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    if (editing) await update.mutateAsync({ id: editing.id, ...form });
    else await create.mutateAsync(form);
    setOpen(false);
  };

  const onDifficultyChange = (d: TaskDifficulty) =>
    setForm((f) => ({ ...f, difficulty: d, xp_reward: DIFFICULTY_XP_DEFAULTS[d] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg">Catálogo de Tarefas</h3>
          <p className="text-sm text-muted-foreground">Defina tarefas, dificuldade e recompensa de XP.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Nova tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <Label>Dificuldade</Label>
                  <Select value={form.difficulty} onValueChange={(v) => onDifficultyChange(v as TaskDifficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((d) => (
                        <SelectItem key={d} value={d}>{DIFFICULTY_LABELS[d]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <Label>Recompensa XP</Label>
                  <Input
                    type="number"
                    value={form.xp_reward}
                    onChange={(e) => setForm({ ...form, xp_reward: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label>Ativa</Label>
                  <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data || []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={DIFFICULTY_TONES[item.difficulty]}>
                      {DIFFICULTY_LABELS[item.difficulty]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{item.xp_reward}</TableCell>
                  <TableCell>
                    {item.active ? <Badge variant="secondary">Ativa</Badge> : <Badge variant="outline">Inativa</Badge>}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma tarefa cadastrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
