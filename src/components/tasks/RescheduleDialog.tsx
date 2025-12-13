import { useState } from 'react';
import { Task, useUpdateTask } from '@/hooks/useTasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RescheduleDialogProps {
  task: Task | null;
  onClose: () => void;
  allTasks: Task[];
}

export function RescheduleDialog({ task, onClose, allTasks }: RescheduleDialogProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [newDate, setNewDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
  );
  const [newTime, setNewTime] = useState('');
  
  const updateTask = useUpdateTask();
  const { toast } = useToast();

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === allTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(allTasks.map(t => t.id));
    }
  };

  const handleReschedule = async () => {
    if (selectedTasks.length === 0) {
      toast({ title: 'Selecione pelo menos uma tarefa', variant: 'destructive' });
      return;
    }

    for (const taskId of selectedTasks) {
      await updateTask.mutateAsync({
        id: taskId,
        due_date: newDate,
        due_time: newTime || undefined,
      });
    }

    toast({ 
      title: 'Tarefas reagendadas!',
      description: `${selectedTasks.length} tarefa(s) movida(s) para ${formatDate(newDate)}`
    });
    
    setSelectedTasks([]);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Reagendar Tarefas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date/Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newDate">Nova Data</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTime">Novo Horário (opcional)</Label>
              <Input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>

          {/* Preview Date */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">Reagendar para:</p>
            <p className="font-medium text-primary capitalize">
              {formatDate(newDate)}
              {newTime && (
                <span className="ml-2 text-muted-foreground">
                  às {newTime}
                </span>
              )}
            </p>
          </div>

          {/* Task Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Selecionar Tarefas</Label>
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedTasks.length === allTasks.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </Button>
            </div>

            <ScrollArea className="h-[200px] rounded-lg border p-2">
              <div className="space-y-2">
                {allTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleToggleTask(t.id)}
                  >
                    <Checkbox
                      checked={selectedTasks.includes(t.id)}
                      onCheckedChange={() => handleToggleTask(t.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {t.due_time && (
                          <>
                            <Clock className="h-3 w-3" />
                            {t.due_time.slice(0, 5)}
                          </>
                        )}
                        {t.salesperson && (
                          <span>• {t.salesperson.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={selectedTasks.length === 0 || updateTask.isPending}
            >
              {updateTask.isPending 
                ? 'Reagendando...' 
                : `Reagendar ${selectedTasks.length} tarefa(s)`
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
