import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTask, TaskPriority, TaskType } from '@/hooks/useTasks';
import { useSalespeople } from '@/hooks/useSalespeople';
import { useClients } from '@/hooks/useClients';
import { useSalesData } from '@/hooks/useSalesData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';

const taskSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Título é obrigatório")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z.string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional(),
  salesperson_id: z.string().optional(),
  client_id: z.string().optional(),
  sale_id: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  task_type: z.enum(["call", "meeting", "follow_up", "email", "proposal", "linkedin", "whatsapp", "other"]),
  due_date: z.string().min(1, "Data é obrigatória"),
  due_time: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskDialogProps {
  defaultSaleId?: string;
  defaultClientId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTaskDialog({ defaultSaleId, defaultClientId, trigger, open: controlledOpen, onOpenChange }: CreateTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const createTask = useCreateTask();
  const { data: salespeople } = useSalespeople();
  const { data: clients } = useClients();
  const { data: sales } = useSalesData();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      salesperson_id: '',
      client_id: defaultClientId || '',
      sale_id: defaultSaleId || '',
      priority: 'medium',
      task_type: 'other',
      due_date: new Date().toISOString().split('T')[0],
      due_time: '',
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    createTask.mutate({
      title: data.title,
      description: data.description || undefined,
      salesperson_id: data.salesperson_id || undefined,
      client_id: data.client_id || undefined,
      sale_id: data.sale_id || undefined,
      priority: data.priority as TaskPriority,
      task_type: data.task_type as TaskType,
      due_date: data.due_date,
      due_time: data.due_time || undefined,
    }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      form.reset({
        title: '',
        description: '',
        salesperson_id: '',
        client_id: defaultClientId || '',
        sale_id: defaultSaleId || '',
        priority: 'medium',
        task_type: 'other',
        due_date: new Date().toISOString().split('T')[0],
        due_time: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="glow" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Ligar para cliente"
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detalhes da tarefa..."
                      rows={3}
                      maxLength={1000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="task_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="call">Ligação</SelectItem>
                        <SelectItem value="meeting">Reunião</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="proposal">Proposta</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salesperson_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendedor</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um vendedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {salespeople?.map((sp) => (
                        <SelectItem key={sp.id} value={sp.id}>
                          {sp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vincular cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sale_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venda / Deal</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vincular venda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {sales?.map((sale) => (
                          <SelectItem key={sale.fullId || sale.id} value={sale.fullId || sale.id}>
                            {sale.cliente} - {sale.produto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant="glow-pulse" type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
